# AIC Seoul Website

[The AI Collective](https://www.aicollective.com/) 서울 챕터 공식 웹사이트.  
월간 오프라인 모임·원데이 클래스·운영진 소개·인사이트·문의 창구와, 운영진용 Admin CMS를 포함합니다.

저장소: [saewookkangboy/aicseoul_site](https://github.com/saewookkangboy/aicseoul_site)

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
| **SEO / Meta** | `pageMetadata`·canonical/OG, 루트 metadata, sitemap·AI 친화 robots, Admin `noindex`, Insights Article metadata |
| **JSON-LD** | Organization / WebSite / BreadcrumbList / Article 빌더 + `JsonLd` 컴포넌트 |
| **GEO** | `/llms.txt`, `/llms-full.txt` 라우트 (AI 크롤러용 사이트 요약) |
| **브랜드·URL** | `getSiteUrl`, brand 상수, OG PNG, `NEXT_PUBLIC_SITE_URL` 문서화 |
| **SuperAdmin UI** | Users에서 SuperAdmin 승격·강등 (최대 3명), 결정 로직·단위 테스트·안내 UI |
| **P5 문서** | 출시 계획·콘텐츠 가이드·Vercel 셋업·Tier A 체크리스트 (`docs/gates/P5-*`) |
| **프로세스** | Superpowers×Gates 오버레이 (`docs/superpowers/`) |

---

## 구현된 기능

### 퍼블릭 사이트
- **Home** — 다크 히어로(KR/EN), 글로벌 통계, Why/What, People·Partner 티저, Final CTA
- **Meetups** — 월간 모임 5단계 스토리, 원데이 클래스 기록, 아카이브 사진벽
- **People** — 운영진 그리드(4/2열), `sortOrder` 반영, LinkedIn/웹사이트 선택 노출
- **Insights** — Featured + 카드 목록, TipTap HTML(기존 마크다운도 렌더), 썸네일 폴백
- **Contact** — 유형별 문의 폼 → DB 저장, honeypot, SiteSetting 기반 SLA/이메일 안내
- 공통 GNB(sticky) · Footer · Reveal 모션(`motion/react`) · 페이지 metadata · JSON-LD · breadcrumbs

### Admin (`/admin`)
- **Auth** — 이메일/비밀번호 회원가입·로그인(Auth.js Credentials), pending 대기 화면
- **권한** — SuperAdmin 최대 3명(env 화이트리스트 + UI 승격/강등), 모듈별 플래그(People/Meetups/Insights/Contact/Settings)
- **Users** — 승인·비활성·권한 편집 · SuperAdmin 승격/강등 (SuperAdmin)
- **People** — CRUD + DnD 순서 변경
- **Meetups** — CTA/클래스 CRUD, 아카이브 다중 업로드
- **Insights** — CMS(초안/발행), Featured 유일, TipTap 위지윅 본문
- **Contact Inbox** — 필터·상태(new/seen/done)·메모·CSV 내보내기
- **Settings** — 통계 수치·문의 이메일 등 key-value
- **미디어** — 로컬 디스크 업로드 + sharp→WebP; Cloudinary 어댑터(env 있으면 원격)
- **연동·품질 (P4)** — `sitemap`/`robots`/OG, Resend 문의 알림 헬퍼
- **SEO/GEO** — Admin 전체 noindex, 공개 페이지 structured data, `llms.txt`

### 데이터·인프라
- Prisma 스키마: User, Member, Meetup(+Photo), ArchivePhoto, InsightPost, ContactSubmission, SiteSetting, MediaAsset
- Docker Compose Postgres (호스트 포트 **5433**) · 프로덕션 DB는 Supabase Postgres (`aic-seoul`, Data API RLS 잠금)
- Auth.js + Prisma only (Supabase Auth/Storage 미사용) · CLI 마이그레이션은 `supabase/migrations`
- 시드: SuperAdmin + 샘플 Member/Meetup/Archive/Insights

---

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 · PRD 디자인 토큰 (Gothic A1 + Space Grotesk) |
| DB / ORM | PostgreSQL · Prisma |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt |
| UI | Phosphor Icons · motion · @dnd-kit · TipTap · react-markdown |
| 패키지 | pnpm |
| 배포 | Vercel (P5 · Preview/Production) |

---

## 요구 사항

- Node 20+
- pnpm 9+
- Docker (로컬 Postgres)

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
| SEO 점검 | `/sitemap.xml` · `/robots.txt` · `/llms.txt` |

기타 스크립트: `pnpm db:migrate` · `pnpm db:studio` · `pnpm build`

---

## 디렉터리 개요

```
src/
  app/(public)/     # Home, Meetups, People, Insights, Contact
  app/admin/        # Auth + Console CMS
  app/api/          # Auth route, 업로드 API
  components/       # 퍼블릭·Admin UI
  lib/              # auth, db, permissions, actions, queries, media, seo
prisma/             # schema, migrations, seed
docs/gates/         # 단계별 계획·검수·승인 기록 (P0~P5)
docs/superpowers/   # Superpowers 스펙·플랜 오버레이
supabase/           # Supabase CLI 로컬/원격 Postgres 설정
public/placeholders # 시드용 플레이스홀더 이미지
```

---

## 환경 변수

`.env.example` 참고. 프로덕션은 `.env.vercel.example` · `docs/gates/P5-vercel-setup.md` 참고.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Postgres (로컬 `localhost:5433`, 프로덕션 Supabase pooler) |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (선택) 향후 Storage 등. Auth는 Auth.js — Data API는 RLS로 잠금 |
| `NEXT_PUBLIC_SITE_URL` | SEO canonical/OG 절대 URL (로컬 `http://localhost:3000`, 프로덕션 `https://aickorea.com`) |
| `SUPERADMIN_EMAILS` | SuperAdmin 이메일 (최대 3, 쉼표 구분) |
| `SUPERADMIN_SEED_PASSWORD` | 시드 SuperAdmin 비밀번호 |
| `CONTACT_EMAIL_PLACEHOLDER` | 문의 이메일 시드값 |
| `CLOUDINARY_*` | 있으면 원격 업로드 (미설정 시 로컬) |
| `RESEND_API_KEY` / `RESEND_FROM` | Contact 알림 메일 |
| `NOTIFY_EMAILS` | 알림 수신 (비우면 SiteSetting contact.email) |
| `GEMINI_API_KEY` | 공개 페이지 CMS 한↔영 자동 번역 (없으면 원문 폴백) |
| `GEMINI_TRANSLATE_MODEL` | 번역 모델 (기본 `gemini-2.0-flash`) |

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
- [`docs/superpowers/`](./docs/superpowers/) — Superpowers×Gates 오버레이
- `AIC_Seoul_웹사이트_목업_최종_이정임.html` — 기획 목업 원본
