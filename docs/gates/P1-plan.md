# G1 / P1 — 기반 구축 계획

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P1 계획 승인」)
- 선행: G0 / P0 `approved`
- 목적: **계획만** 확정. 승인 후에야 스캐폴딩·코드 구현 착수 (G2에서 구현 검수)

---

## 1. P1 목표 (이번 구현 범위)

P1은 “빈 앱이 돌아가는 골격”까지다. 퍼블릭 페이지 완성·Admin CRUD UI는 **P2/P3**.

| # | 산출물 | Done 기준 |
|---|---|---|
| 1 | Next.js App Router 프로젝트 | `pnpm dev` 기동, `/` 플레이스홀더 |
| 2 | 디자인 토큰 + 폰트 | PRD 7장 CSS 변수, Gothic A1 + Space Grotesk (`next/font`) |
| 3 | 공통 셸 | GNB(sticky) + Footer 스켈레톤 (링크만, 페이지 본문 최소) |
| 4 | PostgreSQL + ORM 스키마 | User/권한 + PRD 도메인 테이블 마이그레이션 가능 |
| 5 | Auth | 회원가입·로그인·로그아웃 (이메일+비밀번호) |
| 6 | SuperAdmin 시드 | env 화이트리스트 최대 3명 |
| 7 | Admin 가드 | `/admin` 미인증→로그인, 미승인→대기 화면 |
| 8 | 권한 헬퍼 | 모듈 플래그 체크 유틸 (UI는 P3에서 완성) |
| 9 | 미디어 어댑터 스텁 | 업로드 인터페이스 + 로컬/Cloudinary 중 하나 연결 |
| 10 | 환경변수·배포 | `.env.example`, Vercel 프로젝트 연결 가능 상태 |
| 11 | Site settings 시드 | 문의 이메일 플레이스홀더 등 key-value |

**P1에서 하지 않음:** Home~Contact 실콘텐츠, People DnD, Insights 에디터, Contact Inbox UI, 실 이메일 발송 본구현(스텁 OK).

---

## 2. 기술 스택 확정안

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** | PRD·AIC 글로벌 정합, RSC/ISR |
| 스타일 | **Tailwind CSS v4** + CSS variables | taste-skill 기본, 토큰 잠금 용이 |
| ORM | **Prisma** | 스키마 가독성·마이그레이션·Auth 연동 사례 풍부 |
| DB | **PostgreSQL** | PRD; 로컬은 Docker 또는 Neon/Supabase 개발 DB |
| Auth | **Auth.js (NextAuth v5)** Credentials | 이메일+비밀번호, 소셜 불필요 |
| 비밀번호 | **bcrypt** (또는 argon2) | Credentials 해시 |
| 이미지 | **Cloudinary** (1순위) | 리사이즈/WebP 부담 적음; 계정 없으면 P1은 로컬 stub |
| 배포 | **Vercel** | PRD |
| 패키지 매니저 | **pnpm** | 잠금파일 일관성 |
| 아이콘 | **@phosphor-icons/react** | taste-skill 권장, lucide 지양 |
| 모션 | **motion** (`motion/react`) | P2에서 사용; P1은 의존성만 설치해도 됨 |

### 대안 (승인 시 교체 가능)
- ORM: Drizzle — 원하면 G1 수정 후 진행
- 이미지: S3+CDN — Cloudinary 계정 없을 때

---

## 3. 권한·Auth 설계

### 3.1 가입 흐름 (권장안 A — G1에서 확정 요청)

```
공개 /admin/signup
  → User 생성 (status: pending, 모든 모듈 false)
  → SuperAdmin이 /admin/users 에서 approve + 모듈 권한 부여
  → status: active 후 해당 모듈만 접근
```

| 옵션 | 설명 | 추천 |
|---|---|---|
| **A. 공개 가입 + 승인** | 운영진이 직접 가입, SuperAdmin이 승인 | **채택 제안** (P0 “전체 운영진 회원가입”과 정합) |
| B. 초대 링크만 | SuperAdmin이 이메일 초대 | 보안↑, UX 마찰↑ — Phase 2 후보 |

### 3.2 SuperAdmin 3명
- env: `SUPERADMIN_EMAILS=a@x.com,b@x.com,c@x.com` (최대 3)
- 시드/첫 로그인 시 해당 이메일이면 `role=superadmin`, `status=active`, 전 권한
- SuperAdmin 수는 애플리케이션에서 **3명 초과 승격 불가**
- SuperAdmin만 `role` 변경·권한 편집·유저 승인/비활성 가능

### 3.3 모듈 권한 플래그

```ts
type PermissionFlags = {
  people: boolean;
  meetups: boolean;
  insights: boolean;
  contact: boolean;
  settings: boolean;   // Site settings — 기본 SuperAdmin만
  users: boolean;      // 유저·권한 관리 — SuperAdmin만 true 고정
};
```

- `role: 'superadmin' | 'operator'`
- `superadmin` → 플래그 무시하고 전체 허용
- `operator` → 플래그가 true인 모듈만

### 3.4 스키마 (Auth 관련)

```
User
  id, email (unique), passwordHash
  name
  role: superadmin | operator
  status: pending | active | disabled
  permPeople, permMeetups, permInsights, permContact, permSettings (bool)
  createdAt, updatedAt, lastLoginAt
```

> `users` 권한은 role===superadmin으로만 판단 (컬럼 불필요).

---

## 4. 도메인 스키마 (P1에서 테이블 생성, CRUD는 이후)

PRD 10장 + P0 반영:

| 모델 | 주요 필드 |
|---|---|
| Member | nameKr, nameEn, bio, photoUrl, linkedinUrl, websiteUrl, sortOrder, isFounder, isVisible |
| Meetup | type(monthly\|class), title, date, headcount, summary, testimonials(Json), status |
| MeetupPhoto | meetupId, imageUrl, sortOrder |
| ArchivePhoto | imageUrl, meetupId?, createdAt |
| InsightPost | title, category, summary, body, thumbnailUrl?, author, publishedAt?, isFeatured, status(draft\|published) |
| ContactSubmission | type, name, org?, email, message, status(new\|seen\|done), memo?, createdAt |
| SiteSetting | key (unique), value (string/Json) |
| MediaAsset (optional) | url, publicId, width, height, alt, createdBy |

시드 `SiteSetting` 예:
- `stats.members` / `stats.cities` / `stats.countries`
- `contact.email` = `hello@aic-seoul.example`
- `contact.sla` = `3~5일` (플레이스홀더)
- `social.linkedin` = ``

---

## 5. 라우트 맵 (P1에서 만드는 것)

```
/                     → 플레이스홀더 Home (토큰·GNB 검증용)
/meetups|people|insights|contact  → 스텁 또는 “준비중” (링크만 동작)
/admin/login
/admin/signup
/admin/pending        → 미승인 안내
/admin                → 대시보드 셸 (카드 placeholder)
/admin/users          → SuperAdmin 전용: 목록·승인·권한 토글 (P1 최소 UI)
```

P2/P3에서 채울 경로: `/admin/people`, `/meetups`, `/insights`, `/contact`, `/settings`, `/media`

미들웨어: `/admin/*` (login/signup 제외) 세션 필수.

---

## 6. 디자인 시스템 (P1 산출)

### Design Read
> community chapter marketing site · editorial warm-stone + champagne-gold · aicollective.com · Next + Tailwind tokens · restrained motion

### Dials
`VARIANCE 6 / MOTION 5 / DENSITY 3`

### 파일
- `src/styles/tokens.css` — PRD HEX → CSS variables
- `src/app/globals.css` — Tailwind + 토큰 import
- `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`
- 언어 토글 UI는 Home 전용 자리만 (동작은 P2)

### taste-skill 가드 (P1부터 적용)
- Inter / AI-purple / 크림+테라코타 기본 금지 (브랜드 잠금 스톤·오렌지는 PRD 예외로 허용)
- 카드 남용 금지; 셸은 border/여백 위주
- 아이콘 Phosphor 단일 패밀리

---

## 7. 폴더 구조 (제안)

```
aic_website/
  prisma/schema.prisma
  prisma/seed.ts
  src/
    app/
      (public)/layout.tsx, page.tsx, meetups/…, people/…, insights/…, contact/…
      admin/(auth)/login, signup
      admin/(console)/layout.tsx, page.tsx, users/page.tsx
      api/auth/[...nextauth]/route.ts
    components/layout/, ui/
    lib/auth.ts, db.ts, permissions.ts, media/
    styles/tokens.css
  docs/gates/
  .env.example
```

---

## 8. 환경변수 (`.env.example`)

```
DATABASE_URL=
AUTH_SECRET=
SUPERADMIN_EMAILS=                 # 쉼표 구분, 최대 3
CONTACT_EMAIL_PLACEHOLDER=hello@aic-seoul.example
CLOUDINARY_CLOUD_NAME=             # optional in P1
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# RESEND_API_KEY=                  # P4
```

---

## 9. 구현 순서 (G1 승인 후)

1. `create-next-app` + Tailwind v4 + pnpm
2. tokens + 폰트 + Header/Footer
3. Prisma 스키마 + migrate + seed (settings + optional superadmin)
4. Auth.js Credentials (signup/login/logout)
5. middleware + `/admin` 셸 + `/admin/users` 최소 권한 UI
6. media stub
7. `.env.example` + README 개발 기동 절차
8. G2 검수안 제출

예상 작업량: 1 집중 세션 단위로 끊고, 막히면 중간 보고.

---

## 10. 리스크 · 오픈 포인트

| 항목 | 대응 |
|---|---|
| Cloudinary 계정 없음 | P1 로컬 `/public/uploads` stub, 인터페이스로 교체 |
| DB 로컬 환경 | Docker Compose postgres 또는 Neon free |
| SuperAdmin 이메일 미정 | 개발용 더미 3개 env, 실계정은 나중에 교체 |
| Auth.js v5 API 변동 | 공식 Credentials 패턴 문서 기준으로 고정 |

### G1에서 선택해 주실 것 (기본값 = 굵게)

1. 가입 방식: **A 공개가입+승인** / B 초대만  
2. ORM: **Prisma** / Drizzle  
3. 이미지: **Cloudinary 우선 (없으면 stub)** / S3만  
4. 로컬 DB: **Docker Postgres** / Neon 원격  

기본값으로 진행해도 되면 「P1 계획 승인」만으로 충분합니다.

---

## 11. 승인 체크리스트

- [ ] P1 범위(골격만, 콘텐츠/CRUD UI 제외)에 동의
- [ ] 스택 확정안(또는 위 선택 변경)에 동의
- [ ] Auth·SuperAdmin 3·모듈 권한 설계에 동의
- [ ] 승인 후 위 구현 순서대로 코드 착수 → **G2 구현 검수**에 동의

**승인 문구 예시:** `P1 계획 승인`  
**수정 시:** 변경점만 알려주시면 이 문서를 갱신 후 재검수합니다.
