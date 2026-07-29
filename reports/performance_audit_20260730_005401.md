# Performance Audit: aic-seoul-website

Date: 2026-07-30
Scope: whole repository (Next.js 16 App Router + Prisma/PostgreSQL), prioritizing public list/dashboard views, hot routes, and large tables.
Method: static review of code, queries, and schema/migrations. Not a load test — row counts and Gemini latency need runtime confirmation (see end).

The two dominant findings interact, so read them together:

- **F2 (runtime data cache)** is the biggest lever — it removes per-request work on cache hits. But it carries the invalidation-correctness risk, so it needs care.
- **F1 (batch the translation cache reads)** is the safe, contained, high-confidence win. It stands on its own and *also* protects you during cache-miss stampedes (first paint after a publish). Do F1 regardless of whether you do F2.

---

## Public pages (`/insights`, `/people`, `/meetups`, `/insights/[id]`)

### F1 — N+1 translation-cache lookups (HIGH)

- **Finding:** `translateCached` issues one `prisma.translationCache.findUnique` per string. Public pages call it once per translatable field per row, so an English page fans out into dozens of individual DB round-trips. With `TRANSLATE_CONCURRENCY = 2` these serialize into ~N/2 sequential waves, and every public page is `force-dynamic`, so it recurs on every request.
- **Evidence:**
  - `src/lib/i18n/translate.ts:121` — per-call `findUnique` on `translationCache`.
  - `src/lib/i18n/translate.ts:8` — `TRANSLATE_CONCURRENCY = 2` (caps parallelism → serializes the reads).
  - `src/app/[locale]/(public)/insights/page.tsx:33-38` + `:71-73` — 9 posts × 4 fields = up to **36** `translateCached` calls per list render.
  - `src/app/[locale]/(public)/people/page.tsx:40-44` — one call per member bio.
  - `src/app/[locale]/(public)/meetups/page.tsx:55-61` and `src/app/[locale]/(public)/insights/[id]/page.tsx:65-69` — same pattern.
  - The request-scoped `memo` (`translate.ts:114-117`) only dedupes *identical* strings; distinct fields still each hit the DB.
- **Recommendation:** Add a batch read. Collect every `(sourceHash, targetLang)` for the request, run **one** query, then only call Gemini for misses:
  ```ts
  const rows = await prisma.translationCache.findMany({
    where: { targetLang, sourceHash: { in: hashes } },
    select: { sourceHash: true, translatedText: true },
  });
  ```
  Build a `Map<hash, translatedText>`, serve hits from it, and reserve `withTranslateSlot` + Gemini strictly for misses. The `(sourceHash, targetLang)` unique index already backs the `in` lookup (`prisma/migrations/20260729120000_translation_cache/migration.sql:20`).
- **Effort:** Medium · **Priority:** High
- **Expected effect:** ~36 cache queries → 1 on the insights list; removes the serialized read waves on the fully-cached (steady-state) path.

### F2 — No runtime data cache; `force-dynamic` re-runs everything per request (HIGH)

- **Finding:** Every public route is `force-dynamic`, and none of the data fetches are memoized. Even when all translations are cache hits, each request re-runs all DB reads + translation lookups + render. The output is deterministic per `(locale, page)` and already persisted in `TranslationCache`, so this is repeated work.
- **Evidence:** `force-dynamic` at `src/app/[locale]/(public)/insights/page.tsx:17`, `people/page.tsx:12`, `meetups/page.tsx:21`, `page.tsx:21`, `contact/page.tsx:12`. Grep for `unstable_cache` across `src` returns nothing — no runtime caching exists today.
- **Recommendation:** Wrap the localized fetch in **`unstable_cache`** (or `cache()`), keyed by `(locale, page)`, with tags like `insights`, `people`, `meetups`.
  - **Do NOT use route-level `export const revalidate = 300` / ISR here.** It is ignored under `force-dynamic`, and ISR prerenders at build — which reintroduces the build-time DB dependency the project deliberately avoids (`src/app/sitemap.ts:7`: "Build/prerender must not require DATABASE_URL"). `unstable_cache` caches at *runtime* and coexists with `force-dynamic`.
  - **Invalidation (already wired):** the CMS server actions already call `revalidatePath("/insights")`, `/people`, `/meetups`, `/`, `/contact` on every mutation — see `src/lib/actions/insights-contact.ts:70-125`, `src/lib/actions/cms.ts:56-140`, `src/lib/actions/meetups.ts:36-154`. Add matching `revalidateTag("insights"|"people"|"meetups")` calls (a one-line addition next to each existing `revalidatePath`) so the new cache entries are purged on publish/edit/delete. The invalidation hook points already exist; you're only adding tags.
- **Effort:** Medium · **Priority:** High
- **Expected effect:** Steady-state public page renders drop to a cache read (no DB, no translation loop) between edits; F1's loop then only fires on cache miss / first paint after a publish.

---

## Admin — Insights list (`/admin/insights`)

### F3 — Over-fetch of full article `body` + unbounded list (MEDIUM)

- **Finding:** The list query has no `select` and no `take`, so it loads the entire `body` (full article HTML/markdown) for **every** post, though the list only renders title, category, status, publishedAt, and isFeatured. Payload grows linearly with post count × article size.
- **Evidence:** `src/app/admin/(console)/insights/page.tsx:9-11` (`findMany({ orderBy })` — no `select`, no `take`); rendered fields at `:34-41` never touch `body`/`summary`/`thumbnailUrl`/`author`.
- **Recommendation:** Select only rendered columns and paginate:
  ```ts
  prisma.insightPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: { id: true, title: true, category: true, status: true,
              publishedAt: true, isFeatured: true },
  })
  ```
- **Effort:** Low · **Priority:** Medium
- **Expected effect:** List payload/memory bounded and independent of article body sizes.

---

## Schema / indexes (all hot filter+sort paths)

### F4 — Missing composite indexes on filtered+sorted columns (MEDIUM)

- **Finding:** The schema declares indexes only on the photo FKs, `TranslationCache`, and `User.email`. The recurring production filter/sort combinations have no supporting index, so they seq-scan + sort — fine on seed data, degrades as rows grow.
- **Evidence (queries):**
  - `InsightPost` filtered by `status` + ordered by `publishedAt desc`: `src/lib/queries/content.ts:55-58,69-75`, `src/app/admin/(console)/page.tsx:16-20`, `src/app/sitemap.ts:31-34`, `src/app/llms-full.txt/route.ts:11-16`.
  - `Meetup` filtered by `type`(+`status`) ordered by `date desc`: `src/lib/queries/content.ts:30-33`, `src/app/admin/(console)/meetups/page.tsx:12-15`.
  - `ContactSubmission` filtered by `status`/`type` ordered by `createdAt desc`: `src/app/admin/(console)/contact/page.tsx:22-26`, `src/app/api/admin/contact/export/route.ts`.
- **Evidence (absence):** `prisma/schema.prisma` — `InsightPost` (`:111-124`), `Meetup` (`:76-89`), `ContactSubmission` (`:126-137`) declare no `@@index`; migrations confirm only `MeetupPhoto`/`ArchivePhoto`/`TranslationCache`/`User.email` indexes exist.
- **Recommendation:** Add composite indexes matching each access path:
  ```prisma
  model InsightPost { @@index([status, publishedAt]) }
  model Meetup      { @@index([type, status, date]) }
  model ContactSubmission { @@index([status, createdAt]) }  // admin-only, lower priority
  ```
  (`Member` uses `where isVisible order sortOrder` on a tiny table — skip.)
- **Effort:** Low · **Priority:** Medium (High once any of these tables passes a few thousand rows)
- **Expected effect:** Index scans replace seq-scan+sort on the public insights list, sitemap, and dashboard.

---

## Admin — Contact CSV export (`/api/admin/contact/export`)

### F5 — Unbounded `findMany` builds full CSV in memory (LOW)

- **Finding:** Export fetches all matching `ContactSubmission` rows with no limit and assembles the whole CSV as one string. Acceptable for a low-frequency, admin-only export today; will grow unbounded with submissions.
- **Evidence:** `src/app/api/admin/contact/export/route.ts` — `findMany({ where, orderBy })` with no `take`, then `.map(...).join("\n")`.
- **Recommendation:** Leave as-is short term. When contact volume grows, stream the response (chunked `ReadableStream`) or page through with a cursor rather than materializing all rows + the full string in memory. Pairs with the `ContactSubmission(status, createdAt)` index from F4.
- **Effort:** Medium · **Priority:** Low
- **Expected effect:** Bounds server memory on large exports.

---

## Already efficient (verified — do not change)

- **`src/lib/queries/content.ts`** — `getPublishedInsights` paginates (`skip`/`take`) and runs the page query + `count` in parallel via `Promise.all` (`:68-76`). Good reference pattern.
- **`src/app/llms-full.txt/route.ts`** — `select` + `take: 50` + `Cache-Control: max-age=3600` (`:11-24`). Textbook.
- **`src/app/sitemap.ts:31-34`** — selects only `id`/`publishedAt`/`updatedAt`; no over-fetch.
- **`src/app/admin/(console)/page.tsx:11-28`** — dashboard runs 3 queries in parallel, each permission-gated, insights capped at `take: 3`.
- **`src/app/admin/(console)/meetups/classes/[id]/page.tsx:12-14`** — single `findUnique` with an ordered `include` of photos; no N+1.
- **i18n concurrency guard** — `withTranslateSlot` / `TRANSLATE_CONCURRENCY = 2` (`translate.ts:16-30`) intentionally protects the Supabase session pool on cache-miss fan-out; keep it (it bounds Gemini+write concurrency even after F1 batches the reads).
- **Request-scoped `memo`** (`translate.ts:114-117`) dedupes identical strings within a render.

## Needs runtime profiling to confirm

- Actual row counts for `InsightPost` / `Meetup` / `ContactSubmission` — sets how urgent F4 is.
- Gemini cache-miss latency and hit ratio in production — quantifies F1/F2 gains on cold vs. warm paths.
- Whether `force-dynamic` is strictly required by the Vercel deploy (missing `DATABASE_URL` at build) — it is the reason ISR is off the table for F2, but confirm before relying on `unstable_cache` semantics under your Next 16 version.

## Priority summary (impact per effort)

| # | Finding | Effort | Priority |
|---|---------|--------|----------|
| F1 | Batch translation-cache reads (N+1 → 1) | Medium | **High** |
| F2 | Runtime `unstable_cache` + `revalidateTag` on public pages | Medium | **High** |
| F3 | `select` + `take` on admin insights list | Low | Medium |
| F4 | Composite indexes (InsightPost/Meetup/ContactSubmission) | Low | Medium |
| F5 | Stream/paginate CSV export | Medium | Low |
