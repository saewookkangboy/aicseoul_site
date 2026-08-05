# Railway Postgres Cutover (Vercel app retained) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Point Vercel’s Prisma `DATABASE_URL` / `DIRECT_URL` at Railway Postgres, document dump/restore cutover, and update env examples + P5/README SoT — without removing Supabase client leftovers or changing Prisma schema.

**Architecture:** App stays on Vercel. Railway Postgres is the hosted DB SoT via a **public** connection URL. Set `DATABASE_URL` and `DIRECT_URL` to the **same** Railway URL (no Supabase-style pooler split). Operators run `pg_dump` / `pg_restore` per the new cutover runbook; the repo only ships docs and env templates.

**Tech Stack:** Vercel, Railway Postgres, Prisma 6 (`directUrl`), Auth.js, existing `@supabase/*` stubs (retained unused)

## Global Constraints

- App hosting: **Vercel** (do not move the Next.js app to Railway in this plan)
- DB hosting SoT: **Railway Postgres** public URL
- `DATABASE_URL` === `DIRECT_URL` (identical Railway public URL values)
- Do **not** apply Supabase `:6543` / `pgbouncer=true` patterns to Railway URLs
- Keep `NEXT_PUBLIC_SUPABASE_*`, `@supabase/ssr`, `@supabase/supabase-js`, `src/utils/supabase/`
- Do **not** modify `prisma/schema.prisma` or remove `directUrl`
- Do **not** delete `:6543` logic in `src/lib/db.ts`
- Do **not** run production `pg_dump` in CI/agent sessions — runbook only
- Feature branch + PR; do not commit implementation on `main`
- Spec: `docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md`

## File map

| File | Responsibility |
|---|---|
| `.env.example` | Local + Railway comments; keep Supabase public keys |
| `.env.vercel.example` | Production Railway URL template (`DATABASE_URL` = `DIRECT_URL`) |
| `docs/gates/P5-railway-postgres-cutover.md` | Dump/restore, verify, Vercel env swap, rollback |
| `docs/gates/P5-vercel-setup.md` | Hosted DB SoT → Railway; residual Supabase env section |
| `README.md` | Stack + env table: Railway Postgres |
| `docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md` | Link plan path (status already approved) |
| `prisma/schema.prisma`, `src/lib/db.ts`, `src/utils/supabase/*` | **No changes** |

---

### Task 1: Env templates — Railway URL SoT

**Files:**
- Modify: `.env.example`
- Modify: `.env.vercel.example`

**Interfaces:**
- Produces: documented rule that production `DATABASE_URL` and `DIRECT_URL` are the same Railway public URL; `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` keys remain present

- [ ] **Step 1: Replace `.env.example` DB / Supabase comment block** with:

```dotenv
DATABASE_URL="postgresql://aic:aic@localhost:5433/aic_seoul?schema=public"
# Local: same as DATABASE_URL. Production (Vercel→Railway): set BOTH to the Railway
# Postgres *public* URL (identical values). Do not use Supabase :6543/pgbouncer URLs.
DIRECT_URL="postgresql://aic:aic@localhost:5433/aic_seoul?schema=public"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Public site origin for SEO/canonical/OG (planned prod: https://aic.kr)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Residual Supabase client env (optional / unused for Auth — Auth.js owns auth).
# Kept for compatibility; hosted Postgres SoT is Railway. Do not remove these keys.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Keep all remaining keys below (`SUPERADMIN_*`, Cloudinary, Resend, Gemini, etc.) unchanged from the current file.

- [ ] **Step 2: Replace `.env.vercel.example` header / DB / Supabase block** with:

```dotenv
# Prisma Client + migrate. Railway Postgres *public* URL (TLS).
# Set DATABASE_URL and DIRECT_URL to the SAME value — Railway has no Supabase-style
# Transaction(:6543)/Session(:5432) pooler split. Do not add pgbouncer=true for Railway.
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/railway?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/railway?sslmode=require"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://YOUR-PROJECT.vercel.app"

# Public site origin for SEO/canonical/OG
# Production: https://aic.kr (until DNS: https://YOUR-PROJECT.vercel.app)
NEXT_PUBLIC_SITE_URL="https://YOUR-PROJECT.vercel.app"

SUPERADMIN_EMAILS="you@example.com,ops@example.com"
SUPERADMIN_SEED_PASSWORD="ReplaceWithStrongTempPass1"
# Optional: require invite code on /admin/signup when set
ADMIN_SIGNUP_INVITE_CODE=

# Residual Supabase client env (optional). Auth is Auth.js. DB SoT is Railway Postgres.
# Safe to leave empty. Do not delete these keys from the template.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Keep Cloudinary / Resend / Gemini / seed override sections unchanged.

- [ ] **Step 3: Verify templates still declare required keys**

Run:

```bash
rg -n '^(DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)=' .env.example .env.vercel.example
rg -n 'Railway|pgbouncer|:6543' .env.example .env.vercel.example
```

Expected:
- Both files list all four keys
- Comments mention Railway and warn against `:6543` / `pgbouncer` for Railway
- `.env.vercel.example` shows identical placeholder hosts for `DATABASE_URL` and `DIRECT_URL` (not `:6543` vs `:5432`)

- [ ] **Step 4: Commit**

```bash
git add .env.example .env.vercel.example
git commit -m "$(cat <<'EOF'
docs(env): point production DB templates at Railway Postgres

Use identical DATABASE_URL/DIRECT_URL public URLs; keep residual Supabase client keys.
EOF
)"
```

---

### Task 2: Cutover runbook — dump / restore / verify / rollback

**Files:**
- Create: `docs/gates/P5-railway-postgres-cutover.md`

**Interfaces:**
- Consumes: Task 1 URL rules (`DATABASE_URL` === `DIRECT_URL`, public URL)
- Produces: operator checklist covering provision → dump → restore → row counts → Vercel env swap → rollback
- Row-count tables (Prisma names): `User`, `Member`, `Meetup`, `InsightPost`

- [ ] **Step 1: Create** `docs/gates/P5-railway-postgres-cutover.md` with this full content:

```markdown
# P5 — Railway Postgres cutover (Vercel app retained)

- 작성일: 2026-08-05
- 스펙: `docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md`
- 상태: 운영 런북 (에이전트가 프로덕션 dump를 대신 실행하지 않음)

## 전제

- 앱: Vercel
- DB SoT (컷오버 후): Railway Postgres **공개** URL
- `DATABASE_URL`과 `DIRECT_URL`은 **동일** 값
- Supabase 클라이언트 env/패키지는 레포에 잔류 (제거하지 않음)
- 스키마 SoT: Prisma (`_prisma_migrations`가 dump에 포함되면 복원 후 `migrate deploy`는 no-op)

## 0. 컷오버 전 기록

Supabase(직접/Session `:5432`, **not** Transaction `:6543`)에서:

```sql
SELECT 'User' AS t, COUNT(*) FROM "User"
UNION ALL SELECT 'Member', COUNT(*) FROM "Member"
UNION ALL SELECT 'Meetup', COUNT(*) FROM "Meetup"
UNION ALL SELECT 'InsightPost', COUNT(*) FROM "InsightPost";
```

결과를 이 문서나 운영 노트에 붙여 둔다. Vercel의 기존 `DATABASE_URL` / `DIRECT_URL` 값을 안전한 곳에 백업(롤백용).

## 1. Railway Postgres 프로비저닝

1. Railway 프로젝트에 Postgres 플러그인/서비스 추가
2. 리전: 가능하면 Vercel `icn1`에 가까운 리전
3. **Public Networking / TCP Proxy** 활성화 → 공개 connection URL 복사
4. URL에 TLS 파라미터 유지 (`sslmode=require` 등 Railway 문서 따름)
5. Private Network 전용 URL은 Vercel에서 사용하지 말 것

## 2. Dump (Supabase → 파일)

로컬에 `pg_dump` 설치 후 (비밀번호는 셸 히스토리/채팅에 남기지 말 것):

```bash
# Prefer Session/direct host :5432 (not pooler :6543)
export SRC='postgresql://USER:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require'
pg_dump "$SRC" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file=aic-seoul-supabase.dump
```

## 3. Restore (파일 → Railway)

```bash
export DEST='postgresql://USER:PASSWORD@HOST:PORT/railway?sslmode=require'
# Empty target DB preferred. If objects already exist, drop/recreate DB first on Railway.
pg_restore \
  --dbname="$DEST" \
  --no-owner \
  --no-acl \
  --verbose \
  aic-seoul-supabase.dump
```

Plain SQL alternate: `pg_dump --format=plain` then `psql "$DEST" -f dump.sql`.

## 4. 복원 검증

```bash
psql "$DEST" -c "SELECT 'User' AS t, COUNT(*) FROM \"User\"
UNION ALL SELECT 'Member', COUNT(*) FROM \"Member\"
UNION ALL SELECT 'Meetup', COUNT(*) FROM \"Meetup\"
UNION ALL SELECT 'InsightPost', COUNT(*) FROM \"InsightPost\";"
```

섹션 0 수치와 일치해야 한다. `_prisma_migrations` 행 존재도 확인.

## 5. Vercel env 컷오버

1. Production (필요 시 Preview): `DATABASE_URL` = Railway 공개 URL
2. 동일 값으로 `DIRECT_URL` 설정
3. `NEXT_PUBLIC_SUPABASE_*`는 비워 두거나 기존 값 유지 (삭제하지 않음)
4. Redeploy Production
5. 빌드 로그: `prisma migrate deploy` 성공 또는 already applied
6. 스모크: `/admin/login` SuperAdmin, Meetups / People / Insights 공개·Admin 샘플

## 6. 안정화 · Supabase 보관

- 최소 안정화 기간 동안 Supabase 프로젝트를 **삭제하지 않음** (읽기 전용/보관)
- 문제 없으면 이후 폐기

## 7. 롤백

1. Vercel `DATABASE_URL` / `DIRECT_URL`을 섹션 0에서 백업한 Supabase 값으로 복구
2. Redeploy
3. Railway DB는 보관 (즉시 삭제 금지)

## 체크리스트

- [ ] 사전 row count 기록
- [ ] Railway 공개 URL 확보
- [ ] dump / restore 완료
- [ ] 사후 row count 일치
- [ ] Vercel env 교체 + redeploy
- [ ] migrate + Admin/공개 스모크
- [ ] 롤백 절차 숙지 · Supabase 미삭제
```

- [ ] **Step 2: Verify file exists and names core tables**

Run:

```bash
test -f docs/gates/P5-railway-postgres-cutover.md
rg -n 'InsightPost|DATABASE_URL|DIRECT_URL|pg_dump|pg_restore|롤백|Private Network' docs/gates/P5-railway-postgres-cutover.md
```

Expected: file exists; all patterns match at least once.

- [ ] **Step 3: Commit**

```bash
git add docs/gates/P5-railway-postgres-cutover.md
git commit -m "$(cat <<'EOF'
docs(gates): add Railway Postgres cutover runbook

Document dump/restore, Vercel env swap, verification, and rollback.
EOF
)"
```

---

### Task 3: P5 Vercel setup — DB SoT → Railway

**Files:**
- Modify: `docs/gates/P5-vercel-setup.md`

**Interfaces:**
- Consumes: Task 1 URL rules; Task 2 runbook path
- Produces: section 3–4 rewritten so Railway is SoT; Supabase env marked residual/optional; link to cutover runbook

- [ ] **Step 1: In section 2**, after the build table note, ensure this sentence (add if missing):

```markdown
→ Production에 `DATABASE_URL`과 `DIRECT_URL`(동일 Railway 공개 URL)이 있어야 빌드 시 migrate가 성공합니다.
```

- [ ] **Step 2: Replace the “필수” DB rows and the “Supabase (Postgres 호스트 only)” subsection** (current lines ~48–68) with:

```markdown
### 필수

| Key | Example / 생성 | Notes |
|---|---|---|
| `DATABASE_URL` | Railway Postgres **공개** URL (`sslmode=require` 등) | Prisma Client 런타임. Private Network URL은 Vercel에서 사용 불가 |
| `DIRECT_URL` | **`DATABASE_URL`과 동일** | `prisma migrate`용. Railway에는 Supabase식 `:6543`/`:5432` 분리가 없음 |
| `AUTH_SECRET` | `openssl rand -base64 32` | 필수 |
| `AUTH_URL` | `https://<project>.vercel.app` | 커스텀 도메인 확정 시 교체 |
| `SUPERADMIN_EMAILS` | `a@…,b@…,c@…` | 최대 3, 실운영 메일 |
| `SUPERADMIN_SEED_PASSWORD` | 강한 임시 비번 | 시드 후 즉시 변경 |

### Supabase 잔여 env (선택 · DB SoT 아님)

Auth.js + Prisma. Supabase Auth/Storage 미사용. 호스팅 Postgres SoT는 **Railway**.

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 잔여 클라이언트용. 비워 둬도 됨. 키는 템플릿에 유지 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 동일 |

Vercel Marketplace의 타 프로젝트 `POSTGRES_*`가 `DATABASE_URL`을 오염시키지 않게 Integration/변수를 점검한다.
```

- [ ] **Step 3: Replace entire “## 4. 호스팅 DB (Supabase)”** with:

```markdown
## 4. 호스팅 DB (Railway Postgres)

1. Railway에서 Postgres 생성 → **공개** connection URL 확보 (컷오버 상세: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md))
2. Vercel `DATABASE_URL`과 `DIRECT_URL`에 **동일** URL 등록
3. 스키마 변경 SoT: **Prisma migrate**. `supabase/migrations`는 레거시/보조로 남을 수 있으나 운영 DB SoT는 Railway
4. Supabase → Railway 데이터 이전은 dump/restore 런북을 따른다 (빈 DB에 `db:seed:prod`만 하는 것은 데이터 이관이 아님)
5. 로컬 시드(빈 DB일 때만):

```bash
DATABASE_URL="<railway-or-local>" DIRECT_URL="<same>" pnpm db:seed:prod
```

> 과거 Neon/Supabase pooler 안내는 폐기. 현재 운영 SoT는 **Railway Postgres**입니다.
```

- [ ] **Step 4: In section 5 or 6**, add one link line if not present:

```markdown
DB 컷오버: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md)
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n 'Railway Postgres|P5-railway-postgres-cutover|Transaction pooler|운영 SoT는 Supabase' docs/gates/P5-vercel-setup.md
```

Expected:
- `Railway Postgres` and `P5-railway-postgres-cutover` present
- `운영 SoT는 Supabase` **absent**
- Old “Transaction pooler (`:6543`” as **required** production guidance should be gone from section 3–4 (historical mentions elsewhere in repo are OK)

- [ ] **Step 6: Commit**

```bash
git add docs/gates/P5-vercel-setup.md
git commit -m "$(cat <<'EOF'
docs(gates): set Railway Postgres as P5 hosted DB SoT

Align Vercel setup with identical DATABASE_URL/DIRECT_URL and cutover runbook link.
EOF
)"
```

---

### Task 4: README stack + env table

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Railway SoT wording from Tasks 1–3
- Produces: README stack row and env blurbs that say Railway (not Supabase as DB host); link to cutover doc

- [ ] **Step 1: Change the stack table data row** from Supabase-hosted wording to:

```markdown
| 데이터 | PostgreSQL · Prisma 6 · Railway Postgres(호스팅 DB) · Auth.js |
```

Keep Auth / 미디어 / 배포 rows as they are (Vercel remains the deploy target).

- [ ] **Step 2: Update env table rows** for DB:

```markdown
| `DATABASE_URL` | Prisma 런타임 (로컬 5433 / 프로덕션 Railway 공개 URL) |
| `DIRECT_URL` | 마이그레이션용 — 프로덕션에서는 `DATABASE_URL`과 동일 |
```

- [ ] **Step 3: In the directory tree or docs links area**, ensure cutover + vercel setup are linked. Under the existing P5 vercel-setup bullet (or adjacent), add:

```markdown
- [`docs/gates/P5-railway-postgres-cutover.md`](./docs/gates/P5-railway-postgres-cutover.md) — Supabase→Railway dump/restore
```

If the “디렉터리” tree still says `supabase/                 # CLI · remote schema`, leave it (legacy folder retained per spec).

- [ ] **Step 4: Verify**

Run:

```bash
rg -n 'Railway Postgres|Supabase\(호스팅 Postgres|P5-railway-postgres-cutover|프로덕션 pooler' README.md
```

Expected:
- `Railway Postgres` and cutover link present
- `Supabase(호스팅 Postgres` **absent** from stack table
- `프로덕션 pooler` **absent** from `DATABASE_URL` row

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): describe Railway Postgres as hosted DB

Keep Vercel as deploy target; link cutover runbook.
EOF
)"
```

---

### Task 5: Spec plan pointer + retention guardrails

**Files:**
- Modify: `docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md`
- Verify (no edit unless broken): `package.json`, `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `prisma/schema.prisma`

**Interfaces:**
- Produces: spec header `플랜:` points at this plan file; confirms non-removal constraints still hold in the tree

- [ ] **Step 1: Update the spec header plan line** to:

```markdown
- 플랜: `docs/superpowers/plans/2026-08-05-railway-postgres-cutover.md`
```

Remove any “(구현 플랜 작성 예정)” wording.

- [ ] **Step 2: Retention / no-touch verification**

Run:

```bash
rg -n '@supabase/(ssr|supabase-js)' package.json
test -f src/utils/supabase/client.ts && test -f src/utils/supabase/server.ts
rg -n 'directUrl = env\("DIRECT_URL"\)' prisma/schema.prisma
rg -n ':6543|pgbouncer' src/lib/db.ts
```

Expected:
- Both `@supabase` packages still listed in `package.json`
- Both util files exist
- `directUrl` still present
- `db.ts` still contains `:6543` / `pgbouncer` helpers (unchanged)

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md
git commit -m "$(cat <<'EOF'
docs(spec): link Railway Postgres cutover implementation plan
EOF
)"
```

---

### Task 6: Final doc consistency pass (merge-ready)

**Files:**
- Read-only verify: all files from Tasks 1–5
- Optional touch: `docs/gates/P5-security-ops-checklist.md` or `docs/gates/P5-tier-a-checklist.md` **only if** they still claim Supabase as **required** production DB SoT (one-line SoT correction + link to cutover). Do **not** rewrite entire security checklist.

**Interfaces:**
- Consumes: all prior tasks
- Produces: green verification commands; PR-ready branch

- [ ] **Step 1: Scan gates for stale “운영 SoT는 Supabase” / required Transaction pooler as current SoT**

Run:

```bash
rg -n '운영 SoT는 Supabase|Transaction pooler|aic-seoul.*6543' docs/gates/P5-vercel-setup.md docs/gates/P5-railway-postgres-cutover.md .env.example .env.vercel.example README.md
```

Expected for **current SoT docs** (the files above):
- No “운영 SoT는 Supabase”
- No instructing Railway/production to use `:6543` Transaction pooler
- Cutover doc may still mention Supabase as **source** of dump (allowed)

If `docs/gates/P5-security-ops-checklist.md` still lists Supabase pooler as the only Production DB instruction, add a short note at the DB row:

```markdown
| `DATABASE_URL` / `DIRECT_URL` | ✅ | Railway 공개 URL (둘 다 동일). 컷오버: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md) |
```

and commit:

```bash
git add docs/gates/P5-security-ops-checklist.md
git commit -m "docs(gates): align security ops DB row with Railway SoT"
```

Skip this sub-step if that file already matches or is out of scope for a one-line fix.

- [ ] **Step 2: Confirm Supabase keys remain in both env examples**

Run:

```bash
rg -n 'NEXT_PUBLIC_SUPABASE_' .env.example .env.vercel.example
```

Expected: both keys in both files.

- [ ] **Step 3: Do not execute production dump** — leave a note in the PR body that operators follow `P5-railway-postgres-cutover.md` with real credentials outside the agent session.

- [ ] **Step 4: Open / update PR** from the feature branch (not `main`) summarizing Tasks 1–5 doc changes + operator cutover checklist pointer.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|---|---|
| Railway DB SoT + Vercel app | Tasks 3–4, Global Constraints |
| `DATABASE_URL` === `DIRECT_URL` | Tasks 1–3, runbook |
| Dump/restore documented, not agent-executed | Task 2, Task 6 Step 3 |
| Keep Supabase packages/env/utils | Tasks 1, 5 |
| No Prisma `directUrl` / `db.ts` change | Task 5 Step 2 |
| README + P5 + env examples | Tasks 1, 3, 4 |
| Rollback | Task 2 section 7 |
| Success criteria (docs) | Task 6 |

No TBD/placeholder steps. Insight table name is `InsightPost` (matches Prisma).
