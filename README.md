# AIC Seoul Website

[The AI Collective](https://www.aicollective.com/) 서울 챕터 공식 웹사이트.  
월간 오프라인 모임·원데이 클래스·운영진 소개·인사이트·문의 창구와, 운영진용 Admin CMS를 포함합니다.

저장소: [saewookkangboy/aicseoul_site](https://github.com/saewookkangboy/aicseoul_site)

| 역할 | 담당 |
|---|---|
| 기획 | 이중대 대표, 이정임 대표 |
| 개발 및 구현 | 박충효 ([chunghyo@troe.kr](mailto:chunghyo@troe.kr)) |

---

## 현재 진행 상태 (2026-07-29)

| Phase | 내용 | 상태 |
|---|---|---|
| **P0** | 착수 결정 (권한·스코프·디자인) | ✅ 승인 |
| **P1** | Next.js · Postgres · Auth · 토큰 · 셸 | ✅ 구현·검수 승인 |
| **P2** | 퍼블릭 5페이지 (Home / Meetups / People / Insights / Contact) | ✅ 구현·검수 승인 |
| **P3** | Admin CMS (People·Meetups·Insights·Contact·Settings·Users) | ✅ 구현·검수 승인 |
| **P4** | Cloudinary · Resend · SEO · CSV · a11y | ✅ 구현·검수 승인 |
| **P5** | MVP 출시 (Vercel · Tier A 자료 · 도메인) | 🔄 Vercel env 준비 완료 · **Tier A 수집 대기** |

게이트 문서: `docs/gates/` · 프로세스: `docs/PROCESS.md` · 제품 요구: `PRD.md`

---

## 최신 업데이트 (2026-07-29)

| 영역 | 내용 |
|---|---|
| **Admin UI** | taste-skill 기준 콘솔 재구성 — `AdminNav` 다크 사이드바, `AdminPageHeader`/`AdminPanel`/`AdminStat`/`AdminBadge` 등 공용 UI |
| **Insights CMS** | TipTap 위지윅 본문 (기존 마크다운 시드·공개 렌더 호환) |
| **퍼블릭 타이포** | 한글 `word-break: keep-all`, 홈 헤드라인 의도적 개행(`whitespace-pre-line`) |
| **인프라** | `middleware` → `proxy.ts`, Prisma `prisma.config.ts`, Vercel 빌드 시 Supabase `POSTGRES_*` → `DATABASE_URL` 폴백 |
| **Supabase** | `@supabase/ssr` 세션 갱신, remote schema 마이그레이션(`supabase/migrations`), Preview/Production env 가이드 |
| **P5 문서** | 출시 계획·콘텐츠 가이드·Vercel 셋업·Tier A 체크리스트 (`docs/gates/P5-*`) |
| **프로세스** | Superpowers×Gates 오버레이 (`docs/superpowers/`), feature 브랜치 + PR만 `main` 반영 |

---

## 구현된 기능

### 퍼블릭 사이트
- **Home** — 다크 히어로(KR/EN 카피), 글로벌 통계, Why/What, People·Partner 티저, Final CTA
- **Meetups** — 월간 모임 5단계 스토리, 원데이 클래스 기록, 아카이브 사진벽
- **People** — 운영진 그리드(4/2열), `sortOrder` 반영, LinkedIn/웹사이트 선택 노출
- **Insights** — Featured + 카드 목록, TipTap HTML(기존 마크다운도 렌더), 썸네일 폴백
- **Contact** — 유형별 문의 폼 → DB 저장, honeypot, SiteSetting 기반 SLA/이메일 안내
- 공통 GNB(sticky) · Footer · Reveal 모션(`motion/react`) · 기본 metadata · `sitemap`/`robots`

### Admin (`/admin`)
- **Auth** — 이메일/비밀번호 회원가입·로그인(Auth.js Credentials), pending 대기 화면
- **권한** — SuperAdmin 최대 3명(`SUPERADMIN_EMAILS`), 모듈별 플래그(People/Meetups/Insights/Contact/Settings)
- **Users** — 승인·비활성·모듈 권한 편집 (SuperAdmin)
- **People** — CRUD + DnD 순서 변경
- **Meetups** — CTA/클래스 CRUD, 아카이브 다중 업로드
- **Insights** — CMS(초안/발행), Featured 유일, TipTap 위지윅
- **Contact Inbox** — 필터·상태(new/seen/done)·메모·CSV 내보내기
- **Settings** — 통계 수치·문의 이메일 등 key-value
- **미디어** — 로컬 디스크 업로드 + sharp→WebP; Cloudinary 어댑터(env 있으면 원격)
- **연동·품질 (P4)** — `sitemap`/`robots`/OG, Resend 문의 알림 헬퍼
- **UI 셸** — 브랜드 톤 사이드바·패널·배지·필터 칩·빈 상태 컴포넌트

### 데이터·인프라
- Prisma 스키마: User, Member, Meetup(+Photo), ArchivePhoto, InsightPost, ContactSubmission, SiteSetting, MediaAsset
- Docker Compose Postgres (호스트 포트 **5433**) · Supabase Postgres(원격/Preview) 병행
- 빌드: `scripts/vercel-build.sh` (`prisma generate` → `migrate deploy` → `next build`)
- 시드: `pnpm db:seed` (로컬) · `pnpm db:seed:prod` (프로덕션용)

---

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 · PRD 디자인 토큰 (Gothic A1 + Space Grotesk) |
| DB / ORM | PostgreSQL · Prisma 6 · Supabase(옵션) |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt · Supabase SSR 세션 갱신 |
| UI | Phosphor Icons · motion · @dnd-kit · TipTap · react-markdown |
| 패키지 | pnpm |
| 배포 | Vercel (`icn1`, Preview/Production) |

---

## 요구 사항

- Node 20+
- pnpm 9+
- Docker (로컬 Postgres) 또는 원격 `DATABASE_URL`

---

## 빠른 시작

```bash
pnpm install
cp .env.example .env   # AUTH_SECRET, SUPERADMIN_* 등 로컬 값으로 교체
pnpm db:up
pnpm exec prisma migrate dev --name init   # 최초 마이그레이션
pnpm db:seed
pnpm dev
```

| 항목 | URL / 값 |
|---|---|
| 사이트 | http://localhost:3000 |
| Admin 로그인 | http://localhost:3000/admin/login |
| SuperAdmin (시드) | `.env`의 `SUPERADMIN_EMAILS` + `SUPERADMIN_SEED_PASSWORD` |
| 기본 시드 예시 | `admin1@aic-seoul.example` / `ChangeMeNow!1` |
| SEO 점검 | `/sitemap.xml` · `/robots.txt` |

기타 스크립트: `pnpm db:migrate` · `pnpm db:studio` · `pnpm db:seed:prod` · `pnpm build`

---

## 디렉터리 개요

```
src/
  app/(public)/        # Home, Meetups, People, Insights, Contact
  app/admin/           # Auth + Console CMS
  app/api/             # Auth route, 업로드 API
  components/          # 퍼블릭·Admin UI (admin/ui 디자인 시스템)
  lib/                 # auth, db, permissions, actions, queries, media, email
  proxy.ts             # Admin 보호 + Supabase 세션 (구 middleware)
prisma/                # schema, migrations, seed
prisma.config.ts       # Prisma 설정
scripts/               # vercel-build, DATABASE_URL 폴백, prisma generate
supabase/              # CLI 설정·remote schema 마이그레이션
docs/gates/            # P0~P5 게이트 (결정·계획·검수)
docs/superpowers/      # Superpowers 스펙·플랜 오버레이
public/placeholders    # 시드용 플레이스홀더 이미지
```

---

## 환경 변수

로컬: `.env.example` · 프로덕션/Preview: `.env.vercel.example` · 상세: `docs/gates/P5-vercel-setup.md`

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Postgres (로컬 기본 `localhost:5433`). Vercel에서는 `POSTGRES_PRISMA_URL` 등도 폴백 |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js (`AUTH_URL`은 metadataBase에도 사용) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase SSR 세션 (`/admin` proxy) |
| `SUPERADMIN_EMAILS` | SuperAdmin 이메일 (최대 3, 쉼표 구분) |
| `SUPERADMIN_SEED_PASSWORD` | 시드 SuperAdmin 비밀번호 |
| `CONTACT_EMAIL_PLACEHOLDER` | 문의 이메일 시드값 |
| `CLOUDINARY_*` | 있으면 원격 업로드 (미설정 시 로컬) |
| `RESEND_API_KEY` / `RESEND_FROM` | Contact 알림 메일 |
| `NOTIFY_EMAILS` | 알림 수신 (비우면 SiteSetting contact.email) |

`.env`는 커밋하지 않습니다.

---

## 다음 단계 (P5 / G6)

1. **Tier A 자료 수집** — [`docs/gates/P5-tier-a-checklist.md`](./docs/gates/P5-tier-a-checklist.md) 전부 체크
2. 채팅에 **「Tier A 준비 완료」** → Production 배포 + 시드/적재 → G6b 검수
3. (도메인 확정 시) Vercel Domain + DNS → `AUTH_URL`·Resend 도메인 인증

의도적 보류: Hero 장문 CMS, Insights 카테고리 필터 UI, 멤버 게시판, 결제/티켓팅.

---

## 문서

- [`PRD.md`](./PRD.md) — 제품 요구사항
- [`docs/PROCESS.md`](./docs/PROCESS.md) — 개발 프로세스
- [`docs/gates/`](./docs/gates/) — P0~P5 게이트 (결정·계획·검수)
- [`docs/gates/P5-vercel-setup.md`](./docs/gates/P5-vercel-setup.md) — Vercel env·빌드
- [`docs/gates/P5-tier-a-checklist.md`](./docs/gates/P5-tier-a-checklist.md) — Tier A 자료 체크리스트
- [`docs/superpowers/`](./docs/superpowers/) — Superpowers×Gates 오버레이
- `AIC_Seoul_웹사이트_목업_최종_이정임.html` — 기획 목업 원본
