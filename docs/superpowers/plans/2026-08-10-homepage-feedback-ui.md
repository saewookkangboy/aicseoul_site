# Homepage Feedback UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이정임 홈페이지 피드백(P0→P2)을 반영해 정렬·CTA·섹션 구분·밋업 프로세스·멤버 페이지를 개선한다.

**Architecture:** i18n 메시지와 퍼블릭 섹션 컴포넌트를 우선 수정하고, 멤버 단체 사진은 `SiteSetting` + Admin 설정 업로드로 운영한다. DB 스키마 변경은 하지 않는다.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind, Phosphor icons, Prisma `SiteSetting`, existing Admin `ImageUploadField`

## Global Constraints

- 피처 브랜치 + PR로 머지 (`main` 직접 장기 WIP 금지)
- 디자인: 그림자·카드 남용 금지, 약한 패널·포인트 CTA(`--color-cta`) 사용
- `bioEn` 컬럼 추가 금지 — EN bio는 `translateCached` 유지
- 스펙: `docs/superpowers/specs/2026-08-10-homepage-feedback-ui-design.md`

---

## File map

| File | Change |
|---|---|
| `src/lib/i18n/messages/ko.ts` / `en.ts` | nav 영문, peopleEyebrow, people lead, meetup eyebrows, EN subheadline |
| `src/components/home/sections.tsx` | hero center, stats icons, panels, CTAs |
| `src/components/meetups/sections.tsx` | 2-col process, i18n eyebrows |
| `src/components/people/PeopleGrid.tsx` | group photo + list |
| `src/app/[locale]/(public)/people/page.tsx` | pass groupPhotoUrl |
| `src/lib/actions/cms.ts` | settings keys + revalidate people |
| `src/app/admin/(console)/settings/page.tsx` (+ client form) | group photo upload |
| `prisma/seed.ts` / `seed-production.ts` | optional empty key note (설정만) |
| `docs/gates/P5-content-guide.md` | `people.groupPhotoUrl` 한 줄 추가 |

---

### Task 1: P0 — i18n + CTA + People eyebrow

**Files:** `messages/ko.ts`, `messages/en.ts`, `home/sections.tsx`

- [x] EN `home.subheadline`을 영문 보조 문장으로 교체
- [x] KR `nav.*`를 영문 라벨로 통일
- [x] `home.peopleEyebrow` 추가 (`Members`)
- [x] `HomePeopleTeaser`에 eyebrow + filled CTA
- [x] `HomeActivities` CTA를 버튼 스타일로 통일
- [x] 타입 `Messages`에 `peopleEyebrow` 반영

**Verify:** 타입체크, KR/EN 홈 People·Activities CTA 육안

---

### Task 2: P1 — Hero center + Stats icons + Why/What panels

**Files:** `home/sections.tsx`

- [x] `HomeHero` 콘텐츠를 `items-center text-center` 블록으로
- [x] `HomeLine`에 align 옵션 또는 히어로 전용 중앙 클래스
- [x] Stats에 Phosphor `Users` / `Buildings` / `GlobeHemisphereWest` (또는 동등)
- [x] Reasons·Activities 3열을 약한 패널(`bg`+`border`+padding)로

**Verify:** 데스크톱 히어로 중앙, Stats 아이콘, 섹션 구분감

---

### Task 3: P1 — Meetups process 2-column

**Files:** `meetups/sections.tsx`, messages

- [x] `monthlyEyebrow` / `classEyebrow` i18n
- [x] `MonthlyFormat`을 `md:grid-cols-2`로: 좌 카피+CTA, 우 단계 세로 리스트+아이콘
- [x] 모바일 스택·접근성(순서) 확인

**Verify:** `/meetups` KR/EN

---

### Task 4: P2 — People group photo + list + Admin

> **2026-08-10 사용자 요청으로 rollback:** 퍼블릭 People·Admin 단체사진·관련 i18n/설정 키는 원복. 개별 카드 그리드 유지.

- [ ] ~~`people.groupPhotoUrl` …~~ (rolled back)
- [ ] ~~Admin 설정 단체 사진~~ (rolled back)
- [ ] ~~PeopleGrid 리스트형~~ (rolled back)
- [ ] ~~people lead 카피~~ (rolled back)
- [ ] ~~P5 content guide~~ (rolled back)

---

### Task 5: Verify + finish branch

- [x] `pnpm lint` / `pnpm tsc --noEmit` (프로젝트 스크립트에 맞게)
- [ ] finishing-a-development-branch: 테스트 확인 후 PR 옵션 제시
