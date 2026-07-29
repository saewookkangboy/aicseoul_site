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

→ Production에 `DATABASE_URL`이 있어야 빌드 시 migrate가 성공합니다.

---

## 3. Vercel Environment Variables

**Production + Preview**에 넣을 것 (Preview는 DB를 분리하는 것이 이상적).

### 필수

| Key | Example / 생성 | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase `aic-seoul` pooler (`aic_app.…@…pooler…:5432`, `sslmode=require`) | Prisma SoT. **다른 프로젝트의 `POSTGRES_*`를 넣지 말 것** |
| `AUTH_SECRET` | `openssl rand -base64 32` | 필수 |
| `AUTH_URL` | `https://<project>.vercel.app` | 커스텀 도메인 확정 시 교체 |
| `SUPERADMIN_EMAILS` | `a@…,b@…,c@…` | 최대 3, 실운영 메일 |
| `SUPERADMIN_SEED_PASSWORD` | 강한 임시 비번 | 시드 후 즉시 변경 |

### Supabase (Postgres 호스트 only)

Auth.js + Prisma 스택. Supabase Auth/Storage는 사용하지 않음. Data API는 RLS로 잠김.

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cjlapwteqeiweznomnez.supabase.co` (`aic-seoul`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dashboard publishable key (동일 프로젝트) |

Vercel Marketplace로 **다른** Supabase 프로젝트가 붙으면 `POSTGRES_*`가 `DATABASE_URL` 폴백을 오염시킬 수 있음 → Integration 해제 또는 해당 변수 삭제.

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

### 선택 (시드 시)

| Key | Notes |
|---|---|
| `CONTACT_EMAIL_PLACEHOLDER` | Settings 초기 문의메일 |
| `SEED_STATS_MEMBERS` 등 | `seed-production`용 |

로컬 템플릿: `.env.example`  
프로덕션 시드: `pnpm db:seed:prod` (SuperAdmin + Settings만)

---

## 4. 호스팅 DB (Supabase `aic-seoul`)

1. 프로젝트: `cjlapwteqeiweznomnez` (ap-northeast-2)
2. Session pooler connection → Vercel `DATABASE_URL` (`aic_app` 권장)
3. 스키마 변경 SoT: **Prisma migrate**. RLS/권한만 `supabase/migrations`
4. DDL(인덱스 등)이 `aic_app`에서 owner 오류면 Dashboard SQL / MCP로 적용 후 `prisma migrate resolve --applied`
5. 로컬 시드:

```bash
DATABASE_URL="<prod>" pnpm db:seed:prod
```

> 예전 문서의 Neon 예시는 동일하게 `DATABASE_URL`만 맞으면 동작합니다. 현재 운영 SoT는 Supabase입니다.

---

## 5. 배포 게이트 (이번 합의)

```
[환경설정: 지금] → [Tier A 자료 수집: 대기] → [Vercel Production 배포 + 시드 + Admin 적재]
```

**지금은 Production 배포를 실행하지 않습니다.**  
Tier A가 모이면 G6b로 배포·스모크를 진행합니다.

체크리스트: [P5-tier-a-checklist.md](./P5-tier-a-checklist.md)  
콘텐츠 스펙: [P5-content-guide.md](./P5-content-guide.md)

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
