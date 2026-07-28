# G2 / P1 — 구현 검수

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P1 구현 승인」)
- 선행: G1 / P1 계획 `approved`

---

## 1. 구현 요약

P1 계획 산출물을 코드로 반영했습니다. `pnpm build` 성공.

| # | 산출물 | 상태 |
|---|---|---|
| 1 | Next.js App Router + Tailwind v4 | ✅ |
| 2 | PRD 디자인 토큰 + Gothic A1 / Space Grotesk | ✅ |
| 3 | GNB sticky + Footer | ✅ |
| 4 | Prisma 스키마 + migrate (`init`) | ✅ |
| 5 | Auth.js Credentials (가입/로그인/로그아웃) | ✅ |
| 6 | SuperAdmin 시드 (env 최대 3) | ✅ |
| 7 | `/admin` 가드 + pending 화면 | ✅ |
| 8 | 모듈 권한 헬퍼 + `/admin/users` UI | ✅ |
| 9 | 미디어 stub | ✅ |
| 10 | `.env.example` · README · docker-compose | ✅ |
| 11 | SiteSetting 시드 (문의 플레이스홀더 포함) | ✅ |

---

## 2. 로컬 검증 방법

```bash
pnpm install
cp .env.example .env   # AUTH_SECRET 설정
pnpm db:up             # Postgres → localhost:5433
pnpm exec prisma migrate dev
pnpm db:seed
pnpm dev
```

| URL | 기대 |
|---|---|
| http://localhost:3000 | Home 플레이스홀더 + GNB/Footer |
| /meetups 등 | 스텁 페이지 |
| /admin/login | 로그인 폼 |
| /admin/signup | 가입 → pending (비 SuperAdmin) |
| 시드 계정 로그인 | `/admin` 대시보드 + `/admin/users` |

**시드 SuperAdmin (기본 `.env.example`)**  
- `admin1@aic-seoul.example` / `admin2@…` / `admin3@…`  
- 비밀번호: `SUPERADMIN_SEED_PASSWORD` (예: `ChangeMeNow!1`)

---

## 3. 주요 경로

```
src/app/(public)/…          퍼블릭 셸·스텁
src/app/admin/(auth)/…      login · signup · pending
src/app/admin/(console)/…   dashboard · users
src/lib/auth.ts             Auth.js
src/lib/permissions.ts      권한
src/styles/tokens.css       PRD 팔레트
prisma/schema.prisma        도메인 + User
docker-compose.yml          Postgres :5433
```

---

## 4. 의도적 잔여 / 이슈

| 항목 | 설명 |
|---|---|
| 퍼블릭 본문 | P2 — 스텁만 |
| Admin CRUD | P3 |
| Cloudinary | stub만 (인터페이스 준비) |
| Next.js middleware 경고 | v16에서 `proxy` 권장 — 동작은 정상, P2에서 이관 검토 |
| Prisma 6 | Prisma 7 adapter 복잡도 회피 위해 고정 |
| 로컬 PG 포트 | 호스트 5432 점유 → Docker **5433** |

---

## 5. 승인 시 다음 단계

**G3 / P2 계획** 작성 → 승인 후 퍼블릭 5페이지 실구현.

---

## 6. 승인 체크리스트

- [ ] `pnpm build` / 로컬 기동 OK
- [ ] SuperAdmin 로그인·users 권한 UI OK
- [ ] 일반 가입 → pending 흐름 OK
- [ ] P1 범위(콘텐츠/CMS 미포함)에 동의

**승인 문구:** `P1 구현 승인` 또는 `G2 승인`  
**수정 시:** 변경점만 알려주시면 반영 후 재검수합니다.
