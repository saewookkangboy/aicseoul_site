# LinkedIn Chapter Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Footer와 홈 Final CTA에 AI Collective Seoul 챕터 LinkedIn(`social.linkedin`)을 테마에 맞는 아이콘·링크로 노출한다.

**Architecture:** 기존 `SiteSetting` `social.linkedin`을 단일 소스로 유지한다. Footer가 settings를 읽어 People와 같은 Phosphor `LinkedinLogo` 원형 아이콘을 붙이고, `HomeFinalCta` 텍스트 버튼에 아이콘만 보강한다. URL이 비면 둘 다 숨긴다.

**Tech Stack:** Next.js App Router, `@phosphor-icons/react/ssr`, Prisma `SiteSetting`, 기존 i18n `ctaLinkedin`

**Spec:** `docs/superpowers/specs/2026-07-30-linkedin-chapter-link-design.md`

## Global Constraints

- URL 하드코딩 금지 — 항상 `settings["social.linkedin"]` (시드 기본값만 실 URL)
- Header / Contact / People 카드 동작은 변경하지 않음
- 빈 `social.linkedin` → Footer·CTA 미노출
- 외부 링크: `target="_blank"` + `rel="noreferrer"`
- 구현은 feature branch + PR (`finishing-a-development-branch`); `main`에 장수명 WIP 커밋 누적 지양
- 챕터 URL: `https://www.linkedin.com/company/117154975`

---

## File map

| File | Role |
|------|------|
| `prisma/seed.ts` | `social.linkedin` 기본값을 챕터 URL로 갱신 |
| `src/components/layout/SiteFooter.tsx` | settings 조회 + Footer 아이콘 |
| `src/components/home/sections.tsx` | `HomeFinalCta`에 아이콘 추가 |
| `docs/gates/P5-content-guide.md` | `social.linkedin` 행에 실 URL 예시 |

컴포넌트 단위 테스트 하네스 없음 → 검증은 로컬 UI + settings 빈값 시나리오 수동 확인.

---

### Task 1: Seed + content guide URL

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `docs/gates/P5-content-guide.md`

- [ ] **Step 1: Update seed default**

In `prisma/seed.ts`, change:

```ts
{ key: "social.linkedin", value: "https://www.linkedin.com" },
```

to:

```ts
{ key: "social.linkedin", value: "https://www.linkedin.com/company/117154975" },
```

- [ ] **Step 2: Update P5 content guide row**

In `docs/gates/P5-content-guide.md` settings table, change the `social.linkedin` row memo to include the chapter URL, e.g.:

```markdown
| `social.linkedin` | `https://www.linkedin.com/company/117154975` | 없으면 빈 문자열 → Footer·Final CTA에서 링크 숨김 |
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts docs/gates/P5-content-guide.md
git commit -m "$(cat <<'EOF'
chore: set chapter LinkedIn URL in seed and content guide

EOF
)"
```

---

### Task 2: Footer LinkedIn icon

**Files:**
- Modify: `src/components/layout/SiteFooter.tsx`

**Interfaces:**
- Consumes: `getSiteSettingsMap()` from `@/lib/queries/content` → `Record` with optional `social.linkedin`
- Produces: Footer brand row with conditional LinkedIn icon link when URL is non-empty

- [ ] **Step 1: Rewrite `SiteFooter` to load settings and render icon**

Replace `src/components/layout/SiteFooter.tsx` contents with:

```tsx
import Link from "next/link";
import { headers } from "next/headers";
import { LinkedinLogo } from "@phosphor-icons/react/ssr";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getSiteSettingsMap } from "@/lib/queries/content";

export async function SiteFooter() {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getMessages(locale);
  const settings = await getSiteSettingsMap();
  const linkedin = settings["social.linkedin"]?.trim();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink)]">
            AI Collective Seoul
          </p>
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="AI Collective Seoul LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              <LinkedinLogo size={18} weight="fill" />
            </a>
          ) : null}
        </div>
        <p className="text-sm text-[var(--color-ink-muted)]">{t.footer.tagline}</p>
        <Link
          href="/admin/login"
          className="text-xs tracking-wide text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Manual check — Footer with URL**

Ensure local DB has `social.linkedin` set (re-seed or Admin → Settings). Run `npm run dev`, open any public page, confirm Footer shows LinkedIn icon next to brand and opens the chapter company page in a new tab.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SiteFooter.tsx
git commit -m "$(cat <<'EOF'
feat: show chapter LinkedIn icon in site footer

EOF
)"
```

---

### Task 3: Home Final CTA icon

**Files:**
- Modify: `src/components/home/sections.tsx` (`HomeFinalCta`)

**Interfaces:**
- Consumes: existing `linkedin?: string` prop on `HomeFinalCta`
- Produces: same conditional `<a>` with leading `LinkedinLogo` + `t.ctaLinkedin` text

- [ ] **Step 1: Import `LinkedinLogo` and update the CTA anchor**

At top of `src/components/home/sections.tsx`, add to imports (keep existing imports intact):

```tsx
import { LinkedinLogo } from "@phosphor-icons/react/ssr";
```

In `HomeFinalCta`, replace the LinkedIn `<a>` block with:

```tsx
{linkedin ? (
  <a
    href={linkedin}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-cream)_28%,transparent)] px-6 py-3 text-sm"
  >
    <LinkedinLogo size={18} weight="fill" aria-hidden />
    {t.ctaLinkedin}
  </a>
) : null}
```

- [ ] **Step 2: Manual check — Home CTA + empty URL**

1. Home `/` (또는 `/ko`) Final CTA: 아이콘+「링크드인 팔로우」 버튼, 챕터 URL.
2. Admin에서 `social.linkedin`을 비우면 Footer 아이콘과 Final CTA 버튼이 모두 사라지는지 확인 후 실 URL로 되돌린다.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/sections.tsx
git commit -m "$(cat <<'EOF'
feat: add LinkedIn icon to home final CTA

EOF
)"
```

---

### Task 4: Branch hygiene + verify

**Files:** none (process)

- [ ] **Step 1: Ensure work is on a feature branch**

If commits landed on `main`, create/move to:

```bash
git checkout -b feat/linkedin-chapter-link
```

(If already on that branch, skip.)

- [ ] **Step 2: Smoke TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0 (or only pre-existing unrelated errors — do not introduce new ones in touched files).

- [ ] **Step 3: Ready for PR**

When user asks: push + `gh pr create` per `finishing-a-development-branch` / creating-pull-requests user rules.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Footer icon + settings | Task 2 |
| Home Final CTA icon + text | Task 3 |
| Seed real URL | Task 1 |
| Empty URL hides both | Task 2+3 conditional; verified Task 3 Step 2 |
| No Header/Contact/People change | File map — not touched |
| P5 content guide optional | Task 1 |
| Feature branch + PR | Task 4 |
