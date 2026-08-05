# Railway Postgres 컷오버 (Vercel 앱 유지) — Design Spec

- 작성일: 2026-08-05
- 상태: **approved** (2026-08-05 사용자 설계 승인: A/B/A · 방식 1)
- 플랜: (구현 플랜 작성 예정) `docs/superpowers/plans/2026-08-05-railway-postgres-cutover.md`
- 관련: Prisma `DATABASE_URL` / `DIRECT_URL`, Vercel 배포, P5 환경설정, Supabase(호스팅 Postgres → 잔여 클라이언트만)

## 1. 문제

운영 Postgres가 Supabase Transaction/Session pooler에 묶여 있다. Vercel 빌드·런타임은 Prisma로 연결하며 `directUrl = env("DIRECT_URL")`이 필수다. DB를 Railway Postgres로 옮기되 **앱 호스팅은 Vercel에 유지**해야 한다. 환경 예시·게이트 문서는 여전히 Supabase pooler(`:6543` / `:5432` 분리)를 SoT로 적어 두어 Railway 컷오버와 불일치한다.

## 2. 목표

1. **호스팅 DB SoT를 Railway Postgres**로 바꾸고, Vercel env·레포 예제·P5 문서를 그에 맞게 갱신한다.
2. **기존 Supabase 데이터를 `pg_dump` / `pg_restore`(또는 동등)로 Railway에 복원**한다.
3. **`@supabase/*` 패키지·`src/utils/supabase/`·`NEXT_PUBLIC_SUPABASE_*`는 유지**한다 (제거·리팩터 없음).
4. Prisma 스키마의 `directUrl`과 `pnpm build`의 `prisma migrate deploy` 파이프라인은 유지한다.

## 3. 확정 요구사항

| 항목 | 결정 |
|---|---|
| 앱 호스팅 | Vercel 유지 |
| DB 호스팅 | Railway Postgres (공개 connection URL) |
| Supabase 클라이언트/env | 유지 (미사용 가능; 제거하지 않음) |
| 데이터 | Supabase → Railway 덤프/복원 |
| `DATABASE_URL` | Railway 공개 URL |
| `DIRECT_URL` | `DATABASE_URL`과 **동일 값** (Railway에 Supabase식 pooler 분리 없음) |
| Prisma `directUrl` | 스키마 변경 없음 |
| 코드 제거 | 없음 (방식 1) |
| dump 자동화 스크립트 | 필수 아님 — 운영 런북으로 수행 |

## 4. 비범위

- 앱을 Railway로 배포 이전
- Supabase 패키지·유틸·CSP `supabase.co` 제거
- Prisma에서 `directUrl` 삭제 또는 `db.ts`의 `:6543` 특수처리 삭제
- 이 작업 세션에서 운영 DB에 대한 실제 `pg_dump` 실행 (자격 증명·접근은 운영자; 레포에는 절차만)
- Auth.js / Cloudinary / Resend / 도메인 변경

## 5. 아키텍처

```
[Vercel Next.js + Prisma]
        │
        │ DATABASE_URL (= DIRECT_URL)
        │ public TCP + TLS
        ▼
[Railway Postgres]
        ▲
        │ 1회: pg_dump / pg_restore
[Supabase Postgres]  ──컷오버 후 보관 → 폐기
```

| 단위 | 책임 |
|---|---|
| Railway Postgres | 운영 스키마·데이터 SoT |
| Vercel env | `DATABASE_URL`, `DIRECT_URL` (동일), 기존 Auth/미디어/메일 |
| Prisma migrate | 스키마 SoT; 복원 후 이미 적용된 migration은 no-op |
| `.env*.example` + P5 docs | Railway URL 예시·컷오버 체크리스트 |
| Supabase 잔여 | 클라이언트 스텁/env 유지; DB SoT 아님 |

### 5.1 연결 URL 규칙

- Vercel은 Railway **Private Network에 붙을 수 없으므로** 반드시 **공개** Postgres URL을 사용한다.
- `sslmode=require`(또는 Railway가 제공하는 TLS 파라미터)를 유지한다.
- Supabase `:6543` + `pgbouncer=true` 패턴은 Railway URL에 적용하지 않는다.
- 로컬 Docker Postgres는 기존처럼 `DATABASE_URL` = `DIRECT_URL` (예: `localhost:5433`).

## 6. 컷오버 절차 (운영 런북 요약)

1. Railway에 Postgres 프로비저닝 (가능하면 Vercel `icn1`에 가까운 리전).
2. 공개 connection URL 확보.
3. Supabase에서 `pg_dump` (`--no-owner --no-acl` 권장; custom format 또는 plain SQL).
4. Railway로 `pg_restore` / `psql` 복원.
5. 검증: 주요 테이블 row count, SuperAdmin 로그인, Admin CMS 샘플 조회.
6. Vercel Production(및 필요 시 Preview)에 `DATABASE_URL` / `DIRECT_URL`을 Railway URL(동일 값)로 설정·재배포.
7. 빌드 로그에서 `prisma migrate deploy` 성공(또는 already applied) 확인.
8. Supabase DB는 읽기 전용/보관 후, 안정화 확인 뒤 폐기.

복원 전 Railway DB가 비어 있거나, dump가 스키마를 포함하는지 런북에 명시한다. Prisma migration history(`_prisma_migrations`)가 dump에 포함되면 migrate는 no-op이어야 한다.

## 7. 레포 변경 범위

| 파일 / 영역 | 변경 |
|---|---|
| `.env.example` | Railway/로컬 주석; Supabase pooler 문구 정리. `NEXT_PUBLIC_SUPABASE_*` 키 유지 |
| `.env.vercel.example` | Railway 공개 URL 예시; `DATABASE_URL`=`DIRECT_URL` 안내 |
| `docs/gates/P5-vercel-setup.md` | 호스팅 DB SoT → Railway; pooler 절을 Railway 규칙으로 교체; Supabase env는 “잔여·선택” |
| `README.md` | 스택·환경 변수: DB = Railway Postgres |
| `docs/gates/P5-railway-postgres-cutover.md` (신규) | dump/restore·검증·롤백 체크리스트 |
| `prisma/schema.prisma`, `src/lib/db.ts`, `@supabase/*` | **변경 없음** |

## 8. 롤백

- Vercel env를 이전 Supabase `DATABASE_URL` / `DIRECT_URL`로 되돌리고 재배포.
- Railway 복원본은 보관; Supabase를 즉시 삭제하지 않는다 (컷오버 후 안정화 기간).

## 9. 성공 기준

- [ ] Vercel Production이 Railway Postgres에 연결되어 빌드·런타임이 동작한다.
- [ ] 덤프/복원 후 핵심 데이터가 조회되고 SuperAdmin 로그인이 된다.
- [ ] 레포 env 예제·P5 문서가 Railway를 SoT로 기술한다.
- [ ] Supabase 클라이언트 패키지·env 키가 레포에 남아 있다.

## 10. 테스트 / 검증

- 로컬: `.env.example` 주석만으로도 로컬 Docker 흐름이 깨지지 않음 (`pnpm db:up` + migrate).
- 스테이징/Production: migrate deploy 로그, Admin login, 공개 페이지 DB 의존 경로(Meetups/People/Insights) 스모크.
- row count 샘플: `User`, `Member`, `Meetup`, `Insight`(또는 동등 핵심 테이블) 사전·사후 비교.
