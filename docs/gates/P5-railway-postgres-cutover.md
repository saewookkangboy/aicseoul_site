# P5 — Railway Postgres cutover (Vercel app retained)

- 작성일: 2026-08-05
- 스펙: `docs/superpowers/specs/2026-08-05-railway-postgres-cutover-design.md`
- 상태: 운영 런북 (에이전트가 프로덕션 dump를 대신 실행하지 않음)

## 전제

- 앱: Vercel
- DB SoT (컷오버 후): Railway Postgres **공개** URL
- `DATABASE_URL`과 `DIRECT_URL`은 **동일** 값
- Supabase 클라이언트 env/패키지는 레포에 잔류 (제거하지 않음)
- 스키마 SoT: Prisma (`_prisma_migrations`가 dump에 포함되면 복원 후 `migrate deploy`는 no-op)

## 0. 컷오버 전 기록

Supabase(직접/Session `:5432`, **not** Transaction `:6543`)에서:

```sql
SELECT 'User' AS t, COUNT(*) FROM "User"
UNION ALL SELECT 'Member', COUNT(*) FROM "Member"
UNION ALL SELECT 'Meetup', COUNT(*) FROM "Meetup"
UNION ALL SELECT 'InsightPost', COUNT(*) FROM "InsightPost";
```

결과를 이 문서나 운영 노트에 붙여 둔다. Vercel의 기존 `DATABASE_URL` / `DIRECT_URL` 값을 안전한 곳에 백업(롤백용).

## 1. Railway Postgres 프로비저닝

1. Railway 프로젝트에 Postgres 플러그인/서비스 추가
2. 리전: 가능하면 Vercel `icn1`에 가까운 리전
3. **Public Networking / TCP Proxy** 활성화 → 공개 connection URL 복사
4. URL에 TLS 파라미터 유지 (`sslmode=require` 등 Railway 문서 따름)
5. Private Network 전용 URL은 Vercel에서 사용하지 말 것

## 2. Dump (Supabase → 파일)

로컬에 `pg_dump` 설치 후 (비밀번호는 셸 히스토리/채팅에 남기지 말 것):

```bash
# Prefer Session/direct host :5432 (not pooler :6543)
export SRC='postgresql://USER:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require'
pg_dump "$SRC" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file=aic-seoul-supabase.dump
```

## 3. Restore (파일 → Railway)

```bash
export DEST='postgresql://USER:PASSWORD@HOST:PORT/railway?sslmode=require'
# Empty target DB preferred. If objects already exist, drop/recreate DB first on Railway.
pg_restore \
  --dbname="$DEST" \
  --no-owner \
  --no-acl \
  --verbose \
  aic-seoul-supabase.dump
```

Plain SQL alternate: `pg_dump --format=plain` then `psql "$DEST" -f dump.sql`.

## 4. 복원 검증

```bash
psql "$DEST" -c "SELECT 'User' AS t, COUNT(*) FROM \"User\"
UNION ALL SELECT 'Member', COUNT(*) FROM \"Member\"
UNION ALL SELECT 'Meetup', COUNT(*) FROM \"Meetup\"
UNION ALL SELECT 'InsightPost', COUNT(*) FROM \"InsightPost\";"
```

섹션 0 수치와 일치해야 한다. `_prisma_migrations` 행 존재도 확인.

## 5. Vercel env 컷오버

1. Production (필요 시 Preview): `DATABASE_URL` = Railway 공개 URL
2. 동일 값으로 `DIRECT_URL` 설정
3. `NEXT_PUBLIC_SUPABASE_*`는 비워 두거나 기존 값 유지 (삭제하지 않음)
4. Redeploy Production
5. 빌드 로그: `prisma migrate deploy` 성공 또는 already applied
6. 스모크: `/admin/login` SuperAdmin, Meetups / People / Insights 공개·Admin 샘플

## 6. 안정화 · Supabase 보관

- 최소 안정화 기간 동안 Supabase 프로젝트를 **삭제하지 않음** (읽기 전용/보관)
- 문제 없으면 이후 폐기

## 7. 롤백

1. Vercel `DATABASE_URL` / `DIRECT_URL`을 섹션 0에서 백업한 Supabase 값으로 복구
2. Redeploy
3. Railway DB는 보관 (즉시 삭제 금지)

## 체크리스트

- [ ] 사전 row count 기록
- [ ] Railway 공개 URL 확보
- [ ] dump / restore 완료
- [ ] 사후 row count 일치
- [ ] Vercel env 교체 + redeploy
- [ ] migrate + Admin/공개 스모크
- [ ] 롤백 절차 숙지 · Supabase 미삭제
