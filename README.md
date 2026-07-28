# AIC Seoul Website

[The AI Collective](https://www.aicollective.com/) 서울 챕터 공식 웹사이트.  
월간 오프라인 모임·원데이 클래스·운영진 소개·인사이트·문의 창구와, 운영진용 Admin CMS를 포함합니다.

저장소: [saewookkangboy/aicseoul_site](https://github.com/saewookkangboy/aicseoul_site)

---

## 현재 진행 상태 (2026-07-28)

| Phase | 내용 | 상태 |
|---|---|---|
| **P0** | 착수 결정 (권한·스코프·디자인) | ✅ 승인 |
| **P1** | Next.js · Postgres · Auth · 토큰 · 셸 | ✅ 구현·검수 승인 |
| **P2** | 퍼블릭 5페이지 (Home / Meetups / People / Insights / Contact) | ✅ 구현·검수 승인 |
| **P3** | Admin CMS (People·Meetups·Insights·Contact·Settings·Users) | ✅ 구현·검수 승인 |
| **P4** | Cloudinary · Resend · SEO · CSV · a11y | ✅ 구현 → **검수 대기 (G5b)** |
| **P5** | MVP 출시 (도메인 DNS) | ⏳ 대기 |

게이트 문서: `docs/gates/` · 프로세스: `docs/PROCESS.md` · 제품 요구: `PRD.md`

---

## 구현된 기능

### 퍼블릭 사이트
- **Home** — 다크 히어로(KR/EN), 글로벌 통계, Why/What, People·Partner 티저, Final CTA
- **Meetups** — 월간 모임 5단계 스토리, 원데이 클래스 기록, 아카이브 사진벽
- **People** — 운영진 그리드(4/2열), `sortOrder` 반영, LinkedIn/웹사이트 선택 노출
- **Insights** — Featured + 카드 목록, 마크다운 상세, 썸네일 폴백
- **Contact** — 유형별 문의 폼 → DB 저장, honeypot, SiteSetting 기반 SLA/이메일 안내
- 공통 GNB(sticky) · Footer · Reveal 모션(`motion/react`) · 페이지 metadata

### Admin (`/admin`)
- **Auth** — 이메일/비밀번호 회원가입·로그인(Auth.js Credentials), pending 대기 화면
- **권한** — SuperAdmin 최대 3명(env 화이트리스트), 모듈별 플래그(People/Meetups/Insights/Contact/Settings)
- **Users** — 승인·비활성·권한 편집 (SuperAdmin)
- **People** — CRUD + DnD 순서 변경
- **Meetups** — CTA/클래스 CRUD, 아카이브 다중 업로드
- **Insights** — CMS(초안/발행), Featured 유일, 마크다운 본문
- **Contact Inbox** — 필터·상태(new/seen/done)·메모·CSV 내보내기
- **Settings** — 통계 수치·문의 이메일 등 key-value
- **미디어** — 로컬 디스크 업로드 + sharp→WebP; Cloudinary 어댑터(env 있으면 원격)
- **연동·품질 (P4)** — `sitemap`/`robots`/OG, Resend 문의 알림 헬퍼

### 데이터·인프라
- Prisma 스키마: User, Member, Meetup(+Photo), ArchivePhoto, InsightPost, ContactSubmission, SiteSetting, MediaAsset
- Docker Compose Postgres (호스트 포트 **5433**)
- 시드: SuperAdmin + 샘플 Member/Meetup/Archive/Insights

---

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 · PRD 디자인 토큰 (Gothic A1 + Space Grotesk) |
| DB / ORM | PostgreSQL · Prisma |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt |
| UI | Phosphor Icons · motion · @dnd-kit · react-markdown |
| 패키지 | pnpm |
| 배포 예정 | Vercel (P4/P5) |

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

기타 스크립트: `pnpm db:migrate` · `pnpm db:studio` · `pnpm build`

---

## 디렉터리 개요

```
src/
  app/(public)/     # Home, Meetups, People, Insights, Contact
  app/admin/        # Auth + Console CMS
  app/api/          # Auth route, 업로드 API
  components/       # 퍼블릭·Admin UI
  lib/              # auth, db, permissions, actions, queries, media
prisma/             # schema, migrations, seed
docs/gates/         # 단계별 계획·검수·승인 기록
public/placeholders # 시드용 플레이스홀더 이미지
```

---

## 환경 변수

`.env.example` 참고.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Postgres (로컬 기본 `localhost:5433`) |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js |
| `SUPERADMIN_EMAILS` | SuperAdmin 이메일 (최대 3, 쉼표 구분) |
| `SUPERADMIN_SEED_PASSWORD` | 시드 SuperAdmin 비밀번호 |
| `CONTACT_EMAIL_PLACEHOLDER` | 문의 이메일 시드값 |
| `CLOUDINARY_*` | 있으면 원격 업로드 (미설정 시 로컬) |
| `RESEND_API_KEY` / `RESEND_FROM` | Contact 알림 메일 |
| `NOTIFY_EMAILS` | 알림 수신 (비우면 SiteSetting contact.email) |

`.env`는 커밋하지 않습니다.

---

## 다음 단계 (G5b → P5)

1. **G5b 검수** — Cloudinary/Resend 실계정 연동 검증, a11y·보안 체크리스트 통과 후 승인
2. **P5 MVP** — Vercel 프로덕션 env, 커스텀 도메인 DNS (미확정)

의도적 보류: Hero 장문 CMS, Insights 카테고리 필터 UI, 멤버 게시판, 결제/티켓팅.

---

## 문서

- [`PRD.md`](./PRD.md) — 제품 요구사항
- [`docs/PROCESS.md`](./docs/PROCESS.md) — 개발 프로세스
- [`docs/gates/`](./docs/gates/) — P0~P4 게이트 (결정·계획·검수)
- `AIC_Seoul_웹사이트_목업_최종_이정임.html` — 기획 목업 원본
