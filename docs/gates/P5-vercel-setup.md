# P5 — Vercel + GitHub 환경설정 (배포 전 준비)

- 작성일: 2026-07-28
- 저장소: https://github.com/saewookkangboy/aicseoul_site
- 팀: TROE (`chunghyos-projects`)
- 상태: **환경 준비 완료 · Tier A 수집 후 Production 배포**

---

## 1. GitHub → Vercel 연결

대시보드에서 (권장):

1. [Vercel New Project](https://vercel.com/new) → Import `saewookkangboy/aicseoul_site`
2. Framework: **Next.js** (자동 감지)
3. Root Directory: `.`
4. Build Command: `pnpm build` (repo `vercel.json` / package.json과 동일)
5. Install Command: `pnpm install`
6. Node: **20.x**

CLI로 링크할 때:

```bash
cd /Users/chunghyo/aic_website
vercel link --yes --scope chunghyos-projects
# Project name 제안: aicseoul-site
```

---

## 2. 빌드 파이프라인 (이미 repo에 반영)

| 항목 | 값 |
|---|---|
| `vercel.json` | `framework: nextjs`, region `icn1` |
| `pnpm build` | `prisma generate && prisma migrate deploy && next build` |
| `postinstall` | `prisma generate` |
| `sharp` | **dependencies** (서버 업로드 폴백용) |

→ Production에 `DATABASE_URL`과 `DIRECT_URL`(동일 Railway 공개 URL)이 있어야 빌드 시 migrate가 성공합니다.

---

## 3. Vercel Environment Variables

**Production + Preview**에 넣을 것 (Preview는 DB를 분리하는 것이 이상적).

### 필수

| Key | Example / 생성 | Notes |
|---|---|---|
| `DATABASE_URL` | Railway Postgres **공개** URL (`sslmode=require` 등) | Prisma Client 런타임. Private Network URL은 Vercel에서 사용 불가 |
| `DIRECT_URL` | **`DATABASE_URL`과 동일** | `prisma migrate`용. Railway에는 Supabase식 `:6543`/`:5432` 분리가 없음 |
| `AUTH_SECRET` | `openssl rand -base64 32` | 필수 |
| `AUTH_URL` | Prod/Preview: `https://aickr.vercel.app` · Dev: `http://localhost:3000` | canonical과 일치. `aicseoul-site.vercel.app` 사용 금지(2차 별칭·Challenge) |
| `NEXT_PUBLIC_SITE_URL` | `https://aickr.vercel.app` | sitemap/canonical/OG/llms. 예정 커스텀 `https://aic.kr` |
| `SUPERADMIN_EMAILS` | `a@…,b@…,c@…` | 최대 3, 실운영 메일 |
| `SUPERADMIN_SEED_PASSWORD` | 강한 임시 비번 | 시드 후 즉시 변경 |

### Supabase 잔여 env (선택 · DB SoT 아님)

Auth.js + Prisma. Supabase Auth/Storage 미사용. 호스팅 Postgres SoT는 **Railway**.

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 잔여 클라이언트용. 비워 둬도 됨. 키는 템플릿에 유지 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 동일 |

Vercel Marketplace의 타 프로젝트 `POSTGRES_*`가 `DATABASE_URL`을 오염시키지 않게 Integration/변수를 점검한다.

### 강력 권장 (프로덕션 이미지·알림)

| Key | Notes |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Vercel 디스크 ephemeral → **Cloudinary 권장** |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `CLOUDINARY_FOLDER` | `aic-seoul` |
| `RESEND_API_KEY` | 없으면 문의 알림 스킵 |
| `RESEND_FROM` | 도메인 전: `AIC Seoul <onboarding@resend.dev>` |
| `NOTIFY_EMAILS` | 수신 운영진 (비우면 Settings `contact.email`) |
| `GEMINI_API_KEY` | 공개 KR/EN CMS 자동 번역 (없으면 EN도 원문 폴백) |
| `GEMINI_TRANSLATE_MODEL` | 선택. 기본 `gemini-3.5-flash` |

### 선택 (시드 시)

| Key | Notes |
|---|---|
| `CONTACT_EMAIL_PLACEHOLDER` | Settings 초기 문의메일 |
| `SEED_STATS_MEMBERS` 등 | `seed-production`용 |

로컬 템플릿: `.env.example`  
프로덕션 시드: `pnpm db:seed:prod` (SuperAdmin + Settings만)

---

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

---

## 5. 배포 게이트 (이번 합의)

```
[환경설정: 지금] → [Tier A 자료 수집: 대기] → [Vercel Production 배포 + 시드 + Admin 적재]
```

**지금은 Production 배포를 실행하지 않습니다.**  
Tier A가 모이면 G6b로 배포·스모크를 진행합니다.

체크리스트: [P5-tier-a-checklist.md](./P5-tier-a-checklist.md)  
콘텐츠 스펙: [P5-content-guide.md](./P5-content-guide.md)  
보안 운영(P0): [P5-security-ops-checklist.md](./P5-security-ops-checklist.md)  
DB 컷오버: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md)

---

## 6. Tier A 완료 후 실행 순서 (예약)

1. Vercel 프로젝트 Import + env 등록  
2. Production Deploy  
3. `DATABASE_URL=prod pnpm db:seed:prod`  
4. SuperAdmin 로그인 → 비밀번호 변경  
5. Admin으로 Tier A 적재 (Settings → People → Archive → Class → Insights)  
6. Contact 테스트 + (Resend) 알림 확인  
7. G6b 출시 검수안 제출  

---

## 7. GitHub 연동 확인

- Remote: `origin` → `saewookkangboy/aicseoul_site` (`main`)
- Vercel Git Integration: Import 시 자동 (push → Preview/Production)
