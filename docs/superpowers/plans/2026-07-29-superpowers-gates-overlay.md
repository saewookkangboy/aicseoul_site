# Superpowers × Gates Overlay + WIP PR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게이트는 유지한 채 Superpowers PR 루프를 문서에 얹고, 워킹트리 WIP를 feature 브랜치 단일 PR로 올린다.

**Architecture:** 레포에 스킬을 벤더링하지 않는다. `PROCESS.md` / `gates/README.md` / `AGENTS.md`에 오버레이·PR 규칙만 추가한 뒤, 이미 작성된 P4/P5 문서·배포 설정·TipTap/People 코드 변경을 논리 커밋으로 묶고 `finishing-a-development-branch`로 Push+PR 한다.

**Tech Stack:** Git/GitHub (`gh`), pnpm, Next.js 16, Prisma, TipTap, isomorphic-dompurify, Cursor Superpowers 플러그인(외부)

## Global Constraints

- 접근안 **B**: 게이트 교체 금지, `skills/` 벤더링 금지
- 구현 반영은 **feature 브랜치 + PR**만 (임의 `main` merge 금지; finishing 메뉴에서 사용자 선택)
- 시크릿·`.env` 실값 커밋 금지; `.env.vercel.example`만 허용
- Production 배포·Tier A 적재는 이 플랜 범위 밖
- Spec: `docs/superpowers/specs/2026-07-29-superpowers-gates-overlay-design.md`
- 브랜치: `chore/superpowers-overlay-and-wip` · base: `main`

---

## File Structure

| Path | Responsibility |
|---|---|
| `docs/PROCESS.md` | Superpowers↔게이트 매핑 절 |
| `docs/gates/README.md` | PR-only main 규칙 + 현재 G6 위치 |
| `AGENTS.md` | Next.js 규칙 + Superpowers/게이트 포인터 |
| `docs/superpowers/README.md` | 오버레이 요약·스펙/플랜 경로 |
| `docs/gates/P4-*.md`, `P5-*.md` | 기존 WIP 게이트 문서 (내용 유지, 커밋만) |
| `vercel.json`, `.env.vercel.example`, `prisma/seed-production.ts` | 배포·시드 WIP |
| TipTap/People/sanitize 소스 | 기능 WIP (내용 유지, 검증·커밋) |

---

### Task 1: Feature 브랜치 생성

**Files:**
- None (git only)

**Interfaces:**
- Consumes: `main` at current HEAD (스펙 커밋 `docs: Superpowers×Gates…` 포함 가능)
- Produces: 로컬 브랜치 `chore/superpowers-overlay-and-wip`

- [ ] **Step 1: 상태 확인**

```bash
cd /Users/chunghyo/aic_website
git status -sb
git branch --show-current
```

Expected: `main` (또는 이미 목표 브랜치면 Step 3으로), 미커밋 WIP 다수

- [ ] **Step 2: 브랜치 생성·체크아웃**

```bash
git checkout -b chore/superpowers-overlay-and-wip
```

Expected: `Switched to a new branch 'chore/superpowers-overlay-and-wip'`

- [ ] **Step 3: 브랜치 확인**

```bash
git branch --show-current
```

Expected: `chore/superpowers-overlay-and-wip`

---

### Task 2: 프로세스 오버레이 문서

**Files:**
- Modify: `docs/PROCESS.md`
- Modify: `docs/gates/README.md`
- Modify: `AGENTS.md`
- Create: `docs/superpowers/README.md`

**Interfaces:**
- Consumes: Spec §2 매핑 표
- Produces: 에이전트가 읽을 Superpowers↔게이트·PR 규칙 문서

- [ ] **Step 1: `docs/PROCESS.md` 끝에 Superpowers 절 추가**

파일 끝(Admin 절 다음)에 아래를 **그대로** append:

```markdown

## Superpowers 오버레이

승인 게이트(`docs/gates/`)는 그대로다. 구현 사이클만 [Superpowers](https://github.com/obra/superpowers) 스킬로 정렬한다. 스킬 본문은 Cursor 플러그인에 두고 레포에 복사하지 않는다.

| 게이트 단계 | Superpowers 스킬 |
|---|---|
| Gn 계획 작성·승인 전 | `brainstorming` → `writing-plans` |
| 구현 | `using-git-worktrees`(권장) + `test-driven-development` / `subagent-driven-development` 또는 `executing-plans` |
| 구현 검수 직전 | `verification-before-completion` + `requesting-code-review` |
| 구현 완료·main 반영 | `finishing-a-development-branch` (**기본: Push + PR**) |

스펙·플랜: `docs/superpowers/specs/`, `docs/superpowers/plans/`
```

- [ ] **Step 2: `docs/gates/README.md` 게이트 규칙에 PR 규칙 추가**

「게이트 규칙」목록에 항목 5를 추가 (기존 1–4 유지):

```markdown
5. **구현은 feature 브랜치 + Pull Request로만 `main`에 반영한다.** `main`에 직접 장기간 WIP를 쌓지 않는다. 완료 시 Superpowers `finishing-a-development-branch`로 merge/PR/유지/폐기를 선택한다.
```

「현재 위치」블록은 이미 P5/Tier A면 유지. 없으면 Spec/기존 README와 동일하게 G6/P5 Tier A 대기로 맞춘다.

- [ ] **Step 3: `AGENTS.md`에 Superpowers 포인터 추가**

기존 Next.js 블록 **아래**에 append:

```markdown

<!-- BEGIN:superpowers-agent-rules -->
# Superpowers + Gates

- Before any task, check Superpowers skills (Cursor plugin: `superpowers`). Mandatory workflows, not suggestions.
- Project gates in `docs/gates/` and `docs/PROCESS.md` take precedence for phase approval. Do not start the next Phase without user 「승인」.
- Ship implementation via feature branch + PR (`finishing-a-development-branch`). Do not treat direct long-lived WIP on `main` as done.
- Overlay docs: `docs/superpowers/README.md`
<!-- END:superpowers-agent-rules -->
```

- [ ] **Step 4: `docs/superpowers/README.md` 생성**

```markdown
# Superpowers (프로젝트 오버레이)

이 레포는 [obra/superpowers](https://github.com/obra/superpowers) 스킬을 **벤더링하지 않는다**. Cursor에서 `/add-plugin superpowers`로 설치한다.

- 운영 프로세스: [`docs/PROCESS.md`](../PROCESS.md) — Superpowers 오버레이 절
- 승인 게이트: [`docs/gates/README.md`](../gates/README.md) — PR-only `main` 규칙
- 스펙: [`specs/`](./specs/)
- 플랜: [`plans/`](./plans/)

게이트(G0–G6)는 제품 승인용, Superpowers는 구현·PR 루프용이다.
```

- [ ] **Step 5: 문서 문구 스모크**

```bash
rg -n "finishing-a-development-branch|feature 브랜치|Superpowers 오버레이" docs/PROCESS.md docs/gates/README.md AGENTS.md docs/superpowers/README.md
```

Expected: 각 파일에 매칭 ≥1

- [ ] **Step 6: Commit**

```bash
git add docs/PROCESS.md docs/gates/README.md AGENTS.md docs/superpowers/README.md
git commit -m "$(cat <<'EOF'
docs: Superpowers×Gates 오버레이와 PR-only main 규칙 추가

EOF
)"
```

---

### Task 3: P4/P5 게이트 문서 커밋

**Files:**
- Create (already on disk): `docs/gates/P4-implementation-review.md`
- Create: `docs/gates/P5-plan.md`, `P5-content-guide.md`, `P5-vercel-setup.md`, `P5-tier-a-checklist.md`
- Modify: `docs/gates/README.md` (Task 2에서 커밋됐으면 추가 diff만; 없으면 함께)

**Interfaces:**
- Consumes: 디스크上的 기존 P4/P5 마크다운 (내용 편집 최소화)
- Produces: 게이트 문서가 브랜치 히스토리에 포함

- [ ] **Step 1: 시크릿 없음 확인**

```bash
rg -n "sk_live|API_SECRET|password\s*=\s*['\"][^'\"]+|DATABASE_URL=postgres" docs/gates/P4-implementation-review.md docs/gates/P5-*.md || true
```

Expected: 실비밀 매칭 없음 (예시면 OK)

- [ ] **Step 2: 스테이징·커밋**

```bash
git add docs/gates/P4-implementation-review.md \
  docs/gates/P5-plan.md \
  docs/gates/P5-content-guide.md \
  docs/gates/P5-vercel-setup.md \
  docs/gates/P5-tier-a-checklist.md
# README에 Task2 이후 추가 변경 있으면:
git add docs/gates/README.md
git commit -m "$(cat <<'EOF'
docs: P4 구현 검수와 P5 출시·Tier A 게이트 문서 추가

EOF
)"
```

---

### Task 4: 배포·시드·env 예시 커밋

**Files:**
- Create: `vercel.json`, `.env.vercel.example`, `prisma/seed-production.ts`
- Modify: `.gitignore`, `package.json`, `pnpm-lock.yaml`, `prisma/seed.ts` (배포/시드 관련분만; TipTap deps는 Task 5와 함께여도 됨 — **한쪽에만** 커밋)

**Interfaces:**
- Consumes: 기존 `vercel.json` / seed 스크립트
- Produces: Vercel·prod seed가 브랜치에 포함

- [ ] **Step 1: `.env` 실파일 제외 확인**

```bash
git status -u | rg '\.env($|\s)' || true
ls -la .env .env.local 2>/dev/null || true
```

Expected: 스테이징 대상에 `.env` / `.env.local` 없음. 있으면 `git restore --staged` 하고 커밋하지 말 것.

- [ ] **Step 2: 스테이징·커밋 (lockfile 포함)**

`package.json`에 TipTap과 `db:seed:prod`가 같이 있으면 **이 Task에서 `package.json`+lock을 넣지 말고** Task 5에서 기능과 함께 커밋한다. 이 Task는:

```bash
git add vercel.json .env.vercel.example prisma/seed-production.ts .gitignore prisma/seed.ts
# package.json에 seed:prod만 바뀌고 TipTap은 이미 main에 있으면 여기 포함:
# 판단: git diff package.json | head -80
git commit -m "$(cat <<'EOF'
chore: Vercel 설정·prod seed·env 예시 추가

EOF
)"
```

TipTap 의존성이 같은 `package.json` diff에 있으면 Step 2를 건너뛰고 Task 5에서 `vercel.json` 등과 함께 한 커밋으로 묶어도 된다. 그 경우 커밋 메시지:

```text
chore: Vercel·prod seed와 Insights TipTap 의존성 정리
```

---

### Task 5: TipTap / People / sanitize 코드 커밋

**Files:**
- Create: `src/components/admin/insights/RichTextEditor.tsx`
- Create: `src/components/insights/InsightBody.tsx`
- Create: `src/lib/sanitize-html.ts`
- Modify: `src/components/admin/insights/InsightForm.tsx`
- Modify: `src/app/(public)/insights/[id]/page.tsx`
- Modify: `src/components/admin/people/MemberForm.tsx`
- Modify: `src/components/people/PeopleGrid.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/sitemap.ts` (diff에 있으면)
- Modify: `package.json`, `pnpm-lock.yaml` (Task 4에서 안 넣었으면 여기)

**Interfaces:**
- Consumes: `sanitizeInsightHtml(dirty: string): string`, `looksLikeHtml(value: string): boolean`
- Produces: Admin Insights HTML 편집·퍼블릭 본문 렌더·People UI 변경이 브랜치에 포함

- [ ] **Step 1: sanitize export 존재 확인**

```bash
rg -n "export function sanitizeInsightHtml|export function looksLikeHtml" src/lib/sanitize-html.ts
```

Expected: 두 export 모두 존재

- [ ] **Step 2: 스테이징·커밋**

```bash
git add \
  src/lib/sanitize-html.ts \
  src/components/admin/insights/RichTextEditor.tsx \
  src/components/insights/InsightBody.tsx \
  src/components/admin/insights/InsightForm.tsx \
  src/app/\(public\)/insights/\[id\]/page.tsx \
  src/components/admin/people/MemberForm.tsx \
  src/components/people/PeopleGrid.tsx \
  src/app/globals.css \
  src/app/sitemap.ts \
  package.json pnpm-lock.yaml \
  vercel.json .env.vercel.example prisma/seed-production.ts .gitignore prisma/seed.ts 2>/dev/null || true

# Task 4를 스킵했다면 배포 파일도 위 add에 포함됨. 이미 커밋된 파일은 무시됨.
git status -sb
git commit -m "$(cat <<'EOF'
feat: Insights TipTap 에디터·HTML sanitize와 People UI 정리

EOF
)"
```

아직 untracked/modified가 배포 파일이면 같은 커밋에 넣거나 Task 4 메시지를 쓴 별도 커밋으로 처리.

---

### Task 6: 검증 (lint + build)

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: Tasks 2–5 커밋 결과
- Produces: PR 가능 여부 (실패 시 수정 커밋 후 재실행)

- [ ] **Step 1: Lint**

```bash
pnpm lint
```

Expected: exit 0. 실패 시 해당 파일만 최소 수정 후 `fix: lint …` 커밋.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: exit 0 (로컬 `DATABASE_URL`·migrate 필요 시 `.env` 사용; 실비밀은 커밋하지 않음). 실패 시 로그 원인 수정 후 재빌드·커밋.

- [ ] **Step 3: 워킹트리 깨끗함(또는 의도적 untracked만)**

```bash
git status -sb
```

Expected: 커밋할 WIP 없음. (로컬 `.env` untracked는 OK)

- [ ] **Step 4: 플랜·스펙이 브랜치에 있는지**

```bash
git log --oneline main..HEAD
ls docs/superpowers/plans/2026-07-29-superpowers-gates-overlay.md
```

Expected: Task 커밋들 + 스펙 커밋. 이 플랜 파일 미커밋이면:

```bash
git add docs/superpowers/plans/2026-07-29-superpowers-gates-overlay.md
git commit -m "docs: Superpowers overlay 구현 플랜 추가"
```

---

### Task 7: Push + Pull Request (finishing)

**Files:**
- None (git/gh)

**Interfaces:**
- Consumes: `chore/superpowers-overlay-and-wip` with passing lint/build
- Produces: GitHub PR URL; merge는 사용자 선택까지 보류

- [ ] **Step 1: finishing 스킬 절차 — 테스트 통과 확인**

Task 6 통과가 finishing Step 1을 대체한다. 실패면 PR 중단.

- [ ] **Step 2: Push**

```bash
git push -u origin HEAD
```

Expected: remote tracking set

- [ ] **Step 3: PR 생성**

```bash
gh pr create --title "chore: Superpowers 오버레이 + P4/P5·TipTap WIP" --body "$(cat <<'EOF'
## Summary
- Superpowers×Gates 오버레이 문서 (`PROCESS`, gates README, `AGENTS`, `docs/superpowers`)
- P4 검수·P5 출시/Tier A 게이트 문서
- Vercel·prod seed·env 예시
- Insights TipTap + HTML sanitize, People UI 정리

## Test plan
- [ ] `pnpm lint` / `pnpm build` 통과 확인
- [ ] Admin Insights 글 작성·저장·퍼블릭 본문 표시
- [ ] People 그리드/폼 회귀
- [ ] PR에 `.env` 실값 없음

EOF
)"
```

- [ ] **Step 4: 사용자에게 옵션 제시 (finishing 메뉴)**

Exact text:

```
Implementation complete. What would you like to do?

1. Merge back to main locally
2. Push and create a Pull Request  (이미 완료 — PR URL 공유)
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

Option 2가 이미 끝났으면 PR URL만 보고하고, merge(1)는 **사용자가 1을 고를 때만** 실행.

---

## Self-Review (plan author)

1. **Spec coverage:** §2 문서 → Task 2; §3 WIP → Tasks 3–5; §4 검증·PR → Tasks 6–7; 벤더링 금지 → Global Constraints. OK.
2. **Placeholders:** none.
3. **Consistency:** branch name `chore/superpowers-overlay-and-wip` throughout; sanitize exports named once.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-superpowers-gates-overlay.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — 태스크마다 새 서브에이전트 + 사이 리뷰  
2. **Inline Execution** — 이 세션에서 `executing-plans`로 배치 실행·체크포인트  

Which approach?
