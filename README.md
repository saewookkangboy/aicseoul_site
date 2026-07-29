# AIC Seoul Website

[The AI Collective](https://www.aicollective.com/) 서울 챕터 공식 웹사이트.  
월간 오프라인 모임·원데이 클래스·운영진 소개·인사이트·문의 창구와, 운영진용 Admin CMS를 포함합니다.

저장소: [saewookkangboy/aicseoul_site](https://github.com/saewookkangboy/aicseoul_site)

| 역할 | 담당 |
|---|---|
| 기획 | 이중대 대표, 이정임 대표 |
| 개발 및 구현 | 박충효 ([chunghyo@troe.kr](mailto:chunghyo@troe.kr)) |

---

## 현재 진행 상태 (2026-07-30)

| Phase | 내용 | 상태 |
|---|---|---|
| **P0** | 착수 결정 (권한·스코프·디자인) | ✅ 승인 |
| **P1** | Next.js · Postgres · Auth · 토큰 · 셸 | ✅ 구현·검수 승인 |
| **P2** | 퍼블릭 5페이지 (Home / Meetups / People / Insights / Contact) | ✅ 구현·검수 승인 |
| **P3** | Admin CMS (People·Meetups·Insights·Contact·Settings·Users) | ✅ 구현·검수 승인 |
| **P4** | Cloudinary · Resend · SEO · CSV · a11y | ✅ 구현·검수 승인 |
| **P5** | MVP 출시 (Vercel · Tier A · Cloudinary · Resend) | 🔄 Vercel/보안 준비 완료 · **운영자 Track 대기** |

게이트 문서: `docs/gates/` · 프로세스: `docs/PROCESS.md` · 제품 요구: `PRD.md`

---

## 최신 업데이트 (2026-07-30)

| 영역 | 내용 |
|---|---|
| **KR/EN i18n** | `[locale]` 라우팅, CMS 필드 Gemini 자동 번역 + DB 캐시, 키 없으면 원문 폴백 |
| **번역 모델** | 기본 `gemini-3.5-flash` (`gemini-2.0-flash` 종료 대응) |
| **보안 (P5)** | 분산 rate limit(Postgres), CSP 강화, 업로드 검증, prod signup/업로드 fail-closed, 초대 코드 |
| **Auth** | JWT 권한 갱신, Admin signup 초대 코드, loading UI |
| **LinkedIn** | 챕터 LinkedIn Footer/Home CTA 상시 노출(URL 폴백) |
| **인프라** | Supabase Postgres-only · Data API RLS 잠금 · Auth.js-only · `DIRECT_URL` 마이그레이션 |
| **품질** | `/en` 풀/번역 안정화, 퍼포먼스 감사 리포트(`reports/`), CI·sanitize·error boundary |
| **SEO/GEO** | canonical/OG · JSON-LD · sitemap/robots · `llms.txt` · Admin `noindex` |

---

## 구현된 기능

### 퍼블릭 사이트
- **로케일** — `/ko`, `/en` (기본 KR), 공개 CMS 텍스트 한↔영 번역 캐시
- **Home** — 다크 히어로, 줄 단위 카피·한글 `word-break`, 글로벌 통계, Why/What, People·Partner 티저, Final CTA(+ LinkedIn)
- **Meetups** — 월간 모임 스토리, 원데이 클래스, 아카이브 사진벽
- **People** — 운영진 그리드, `sortOrder`, LinkedIn/웹사이트 선택 노출
- **Insights** — Featured + 목록, TipTap HTML(마크다운 호환), 썸네일 폴백
- **Contact** — 문의 폼 → DB, honeypot, rate limit, SiteSetting SLA/이메일
- 공통 GNB · Footer(챕터 LinkedIn) · Reveal 모션 · metadata · JSON-LD · breadcrumbs

### Admin (`/admin`)
- **Auth** — Credentials 가입·로그인, pending, **초대 코드**(프로덕션 필수), JWT 권한 갱신
- **권한** — SuperAdmin 최대 3명(env + UI 승격/강등), 모듈 플래그
- **Users / People / Meetups / Insights / Contact / Settings** — CRUD·DnD·CSV·TipTap 등
- **미디어** — Cloudinary(프로덕션 권장/필수) · 로컬은 개발용
- **보안** — rate limit, CSP, 업로드 MIME/크기 검증, Admin noindex

### 데이터·인프라
- Prisma: User, Member, Meetup(+Photo), ArchivePhoto, InsightPost, ContactSubmission, SiteSetting, MediaAsset, TranslationCache, RateLimit
- 로컬 Docker Postgres(포트 **5433**) · 호스팅은 Supabase Postgres (Data API 잠금, Auth.js 전용)
- 빌드: `prisma generate` → `migrate deploy` → `next build` (`DIRECT_URL`로 migrate)
- 시드: `pnpm db:seed` · `pnpm db:seed:prod`

---

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 · Gothic A1 + Space Grotesk |
| DB / ORM | PostgreSQL · Prisma 6 · Supabase(호스팅 Postgres) |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt |
| i18n | locale 라우팅 · Gemini 번역 캐시 |
| UI | Phosphor · motion · @dnd-kit · TipTap · react-markdown |
| 패키지 | pnpm |
| 배포 | Vercel (`icn1`, Preview/Production) · Web Analytics |

---

## 요구 사항

- Node 20+
- pnpm 9+
- Docker(로컬 Postgres) 또는 원격 `DATABASE_URL` / `DIRECT_URL`

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
| Admin | http://localhost:3000/admin/login |
| SuperAdmin | `.env`의 `SUPERADMIN_EMAILS` + `SUPERADMIN_SEED_PASSWORD` (시드 후 비밀번호 변경 권장) |
| SEO / GEO | `/sitemap.xml` · `/robots.txt` · `/llms.txt` |

기타: `pnpm db:migrate` · `pnpm db:studio` · `pnpm db:seed:prod` · `pnpm build` · `pnpm test`

---

## 디렉터리 개요

```
src/
  app/[locale]/(public)/  # Home, Meetups, People, Insights, Contact
  app/admin/              # Auth + Console CMS
  app/api/                # Auth, 업로드 API
  components/             # 퍼블릭·Admin UI
  lib/                    # auth, db, i18n, security, seo, media, …
  proxy.ts                # Admin 보호 등
prisma/                   # schema, migrations, seed
scripts/                  # vercel-build, DATABASE_URL 폴백
supabase/                 # CLI · remote schema
docs/gates/               # P0~P5 게이트
docs/superpowers/         # 스펙·플랜
reports/                  # 감사 리포트
public/placeholders
```

---

## 환경 변수

로컬: `.env.example` · 배포: `.env.vercel.example` · 상세: `docs/gates/P5-vercel-setup.md`  
**시크릿·프로젝트 ref·실계정 키는 README/커밋에 넣지 마세요.** Vercel·Supabase 대시보드에서만 관리합니다.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Prisma 런타임 (로컬 5433 / 프로덕션 pooler) |
| `DIRECT_URL` | 마이그레이션용 직접 연결(세션/5432) |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js |
| `NEXT_PUBLIC_SITE_URL` | canonical/OG 절대 URL |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (선택) 호스팅 메타 — Auth는 Auth.js |
| `SUPERADMIN_EMAILS` | SuperAdmin (최대 3) |
| `SUPERADMIN_SEED_PASSWORD` | 시드용 임시 비밀번호(프로덕션은 강한 값, 시드 후 교체) |
| `ADMIN_SIGNUP_INVITE_CODE` | Admin 가입 초대 코드(프로덕션 미설정 시 signup 비활성) |
| `CLOUDINARY_*` | 원격 업로드(프로덕션 권장/필수) |
| `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAILS` | 문의 알림 |
| `GEMINI_API_KEY` / `GEMINI_TRANSLATE_MODEL` | CMS 자동 번역(없으면 원문 폴백) |

`.env` / `.env.local`은 커밋하지 않습니다.

---

## 다음 단계 (P5 / G6)

1. 운영자 런북 — [`docs/gates/P5-tier-a-cloudinary-resend-runbook.md`](./docs/gates/P5-tier-a-cloudinary-resend-runbook.md) (Cloudinary · Resend · Tier A)
2. 채팅 **「Tier A 준비 완료」** → Production 배포·시드·스모크 → G6b 검수
3. 도메인 확정 시 DNS + `AUTH_URL` · Resend 도메인 인증

의도적 보류: Hero 장문 CMS, Insights 카테고리 필터 UI, 멤버 게시판, 결제/티켓팅.

---

## 문서

- [`PRD.md`](./PRD.md) — 제품 요구사항
- [`docs/PROCESS.md`](./docs/PROCESS.md) — 개발 프로세스
- [`docs/gates/`](./docs/gates/) — P0~P5 게이트
- [`docs/gates/P5-vercel-setup.md`](./docs/gates/P5-vercel-setup.md) — Vercel env·빌드
- [`docs/gates/P5-tier-a-checklist.md`](./docs/gates/P5-tier-a-checklist.md) — Tier A 체크리스트
- [`docs/gates/P5-security-ops-checklist.md`](./docs/gates/P5-security-ops-checklist.md) — 보안 운영 체크리스트
- [`docs/superpowers/`](./docs/superpowers/) — Superpowers×Gates 오버레이
- [`reports/`](./reports/) — 퍼포먼스 감사 등
- `AIC_Seoul_웹사이트_목업_최종_이정임.html` — 기획 목업 원본
