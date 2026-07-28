# Superpowers × Gates 오버레이 + WIP PR 마무리

- 작성일: 2026-07-29
- 상태: draft (사용자 스펙 리뷰 대기)
- 접근안: **B** — 게이트 유지 + Superpowers 오버레이
- 관련: [obra/superpowers](https://github.com/obra/superpowers), `docs/PROCESS.md`, `docs/gates/`

---

## 1. 목적

1. **프로세스 업그레이드** — 기존 G0–G6 승인 게이트는 유지하고, 구현 사이클을 Superpowers 워크플로(브레인스토밍 → 계획 → 구현 → 검수 → **PR/마무리**)로 정렬한다.
2. **지금 작업 마무리** — `main` 워킹트리에 쌓인 P4/P5·에디터·배포 관련 미커밋 변경을 feature 브랜치 + Pull Request로 정리한다.

성공 기준:

- 에이전트/인간이 “게이트 승인 없이 다음 Phase 금지”와 “구현은 PR로만 main 반영”을 문서만으로 알 수 있다.
- Cursor Superpowers 플러그인 스킬을 레포에 벤더링하지 않고, `AGENTS.md` / `PROCESS.md`에 포인터·매핑만 둔다.
- 현재 WIP가 하나의 PR(또는 논리적으로 나눈 소수 PR)로 원격에 올라가고, merge 여부는 finishing 옵션으로 사용자가 고른다.

---

## 2. 프로세스 오버레이 (승인됨)

### 2.1 매핑

| 기존 게이트 단계 | Superpowers 스킬 |
|---|---|
| Gn 계획 작성·승인 전 | `brainstorming` → `writing-plans` |
| 구현 | `using-git-worktrees` (권장) + `test-driven-development` / `subagent-driven-development` 또는 `executing-plans` |
| 구현 검수 직전 | `verification-before-completion` + `requesting-code-review` |
| 구현 완료·main 반영 | **`finishing-a-development-branch`** (기본: Push + PR) |

### 2.2 문서 변경 (구현 시)

| 파일 | 변경 |
|---|---|
| `docs/PROCESS.md` | Superpowers 워크플로 한 절 + 위 매핑 표 |
| `docs/gates/README.md` | “구현은 feature 브랜치 + PR로만 `main` 반영” 규칙 |
| `AGENTS.md` | Next.js 규칙 아래: Superpowers 필수·게이트 우선순위 짧은 포인터 |
| `docs/superpowers/README.md` | (선택) 오버레이 요약·스펙/플랜 경로 |

### 2.3 하지 않음

- 게이트 문서를 Superpowers로 교체하지 않음
- `skills/` 를 레포에 복사·벤더링하지 않음
- Cursor `/add-plugin superpowers` 는 로컬/팀 안내만 (자동화 설치 스크립트 없음)

---

## 3. 현재 WIP → PR 범위 (승인됨)

### 3.1 포함

**게이트·출시 문서**

- `docs/gates/P4-implementation-review.md`
- `docs/gates/P5-plan.md`, `P5-content-guide.md`, `P5-vercel-setup.md`, `P5-tier-a-checklist.md`
- `docs/gates/README.md` (P5 위치 반영분 + PR 규칙 보강)

**배포·환경**

- `vercel.json`, `.env.vercel.example`
- `.gitignore` 관련 수정
- `prisma/seed-production.ts`, `prisma/seed.ts` 변경
- `package.json` / `pnpm-lock.yaml` (TipTap·sanitize 등)

**기능 코드**

- Admin Insights TipTap: `RichTextEditor.tsx`, `InsightForm.tsx`, `InsightBody.tsx`, `sanitize-html.ts`
- Insights 상세: `src/app/(public)/insights/[id]/page.tsx`
- People: `PeopleGrid.tsx`, `MemberForm.tsx`
- 스타일: `globals.css` (및 관련 수정분)
- 기타 동일 작업 트리에 있는 연관 파일 (`sitemap.ts` 등 diff에 있는 것)

**프로세스 오버레이 산출물**

- 본 스펙 + 구현 플랜
- `PROCESS.md` / `AGENTS.md` / `gates/README.md` / (선택) `docs/superpowers/README.md`

### 3.2 제외

- Production 배포·Neon/Cloudinary 실계정 설정 (Tier A 「준비 완료」 트리거 후)
- Phase 2 기능
- 비밀키·`.env` 실값 커밋

### 3.3 PR 전략

- 기본: **단일 PR** — “P4/P5 docs + TipTap/People 정리 + Superpowers 오버레이”
- 브랜치명 예: `chore/superpowers-overlay-and-wip`
- base: `main`
- merge는 finishing 메뉴에서 사용자가 선택 (에이전트가 임의 merge하지 않음)

---

## 4. 실행·검증·오류 처리 (승인됨)

### 4.1 실행 순서

1. 구현 플랜 작성 (`docs/superpowers/plans/…`) — `writing-plans`
2. feature 브랜치 생성 (worktree 권장, 불가 시 동일 클론에서 브랜치)
3. 프로세스 문서 반영 → WIP 스테이징·커밋(논리 단위 가능하면 분리)
4. `pnpm lint` / `pnpm build`(또는 프로젝트에 맞는 검증) 통과 확인
5. `finishing-a-development-branch`: Push + PR 옵션 실행
6. PR URL 반환; merge/유지/폐기는 사용자 선택

### 4.2 검증

- 린트·빌드 실패 시 PR 생성 중단, 수정 후 재시도
- PR에 시크릿 파일 없는지 스테이징 전 확인

### 4.3 오류·경계

- `main`에 이미 push된 커밋과 충돌 시: rebase/merge는 사용자 확인 후
- Tier A 미완이어도 **문서·코드 PR은 진행 가능** (배포는 별 트리거)

---

## 5. 범위 한 줄 요약

게이트는 그대로, Superpowers는 구현·PR 루프만 얹고, 지금 워킹트리 WIP를 feature PR 하나로 올린다.
