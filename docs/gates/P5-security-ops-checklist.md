# P5 — P0 보안 운영 점검 (Vercel / Supabase / Build)

- 작성일: 2026-07-29
- 상태: **P0 완료** (2026-07-29 사용자 「P0 보안 운영 완료」)
- 범위: 출시 직전 **플랫폼·env** 점검 (코드 Turnstile/Redis 아님)
- 예외: **`SUPERADMIN_SEED_PASSWORD` Vercel 삭제는 진행하지 않음** (사용자 지시)
- 선행: 앱 레벨 하드닝 스펙 `docs/superpowers/specs/2026-07-29-p5-security-hardening-design.md`
- 프로젝트: Vercel `aicseoul-site` · 호스팅 Postgres SoT → **Railway** (컷오버: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md); 과거 Supabase 점검 기록은 아래 유지)

---

## 1. 점검 결과 요약 (2026-07-29 감사)

| 영역 | 상태 | 비고 |
|---|---|---|
| Vercel Production 배포 | ✅ READY | 최신 prod 배포 빌드 성공 → **`pnpm build` 파이프라인 통과로 간주** |
| Supabase 프로젝트 | ✅ ACTIVE_HEALTHY | ap-northeast-2 |
| Data API 잠금 | ✅ 의도적 | RLS on + policy 없음 + anon/authenticated REVOKE (`supabase/migrations/20260729055042_lock_down_public_data_api.sql`) |
| Advisors `rls_enabled_no_policy` | ℹ️ INFO | Prisma-only 설계상 **정상**. WARN/ERROR 없음 |
| Production 필수 env | ⚠️ 시드 비번 잔류(유지) | `SUPERADMIN_SEED_PASSWORD` 삭제 **미실시** (사용자 지시) |
| Cloudinary / Resend | ⬜ 미설정 | 강력 권장, P0 블로커는 아님 |
| 로컬 `pnpm build` | ⬜ 미실행 | Docker daemon 미기동 (`localhost:5433` 도달 불가). Vercel READY로 대체 검증 |
| 앱 보안 하드닝 PR | ✅ MERGED | [PR #10](https://github.com/saewookkangboy/aicseoul_site/pull/10) (`feat/p5-security-hardening-v2`, 2026-07-30) |

---

## 2. Supabase 체크리스트

담당: _______________ · 점검일: 2026-07-29

- [x] 운영 Supabase 프로젝트 ACTIVE (이름·ref는 대시보드 확인)
- [x] Prisma SoT — Data API는 anon/authenticated 권한 회수 + RLS enable (policy 없음 = API 차단; `supabase/migrations/20260729055042_lock_down_public_data_api.sql`)
- [x] Security Advisor: WARN/ERROR 없음 (INFO만 = `rls_enabled_no_policy` × 10 테이블)
- [ ] Dashboard에서 **Database → Roles**: `aic_app`에 `BYPASSRLS` 유지 확인 (마이그레이션에 포함됨)
- [ ] **API Settings**: `service_role` 키가 Vercel/클라이언트에 노출되지 않음 (Publishable/anon만 public)
- [ ] DB 비밀번호·pooler URL이 Git/채팅에 커밋되지 않음
- [ ] (권장) 불필요 Marketplace Postgres / 타 프로젝트 Integration 없음

Advisor 재실행:

```text
Supabase MCP get_advisors(project_id=<YOUR_PROJECT_REF>, type=security)
```

---

## 3. Vercel Environment Variables

팀: `chunghyos-projects` · 프로젝트: `aicseoul-site` (Vercel project id는 대시보드에서만 확인)

### 3.1 Production — 키 존재 (2026-07-29 CLI)

| Key | Prod | 조치 |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | ✅ | Railway 공개 URL (둘 다 동일). 컷오버: [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md). 타 프로젝트 `POSTGRES_*` 혼입 금지 |
| `AUTH_SECRET` | ✅ | 유지 |
| `AUTH_URL` | ✅ | **2026-08-10**: Prod/Preview=`https://aickr.vercel.app`, Dev=`http://localhost:3000`. `aicseoul-site.vercel.app` 제거 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Prod=`https://aickr.vercel.app` (canonical). 예정 `https://aic.kr` |
| `SUPERADMIN_EMAILS` | ✅ | 실운영 메일 ≤3 |
| `SUPERADMIN_SEED_PASSWORD` | ⚠️ **잔류 (유지)** | 사용자 지시로 **삭제하지 않음**. 시드·운영 절차에서 강한 값·비번 변경은 별도 판단 |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `DATABASE_URL`과 동일 프로젝트인지 확인 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | publishable와 중복 가능 — 문서상 정리 권장 |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY` | ✅ 존재 | 서버 전용 복제본. **불필요하면 제거**해 혼선 방지 |
| `CONTACT_EMAIL_PLACEHOLDER` | ✅ | |
| `CLOUDINARY_*` | ❌ | 프로덕션 이미지용 강력 권장 |
| `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAILS` | ❌ | 문의 알림용 권장 |
| `GEMINI_API_KEY` / `GEMINI_TRANSLATE_MODEL` | ❌ | 공개 i18n CMS 번역용 권장 (키 없으면 원문 폴백) |

### 3.2 Preview

| Key | Preview | 조치 |
|---|---|---|
| `DATABASE_URL` | ✅ | **가능하면 Production과 분리**된 DB/브랜치 |
| `AUTH_SECRET` / `AUTH_URL` / `SUPERADMIN_EMAILS` | ✅ | Preview `AUTH_URL`=`https://aickr.vercel.app` (2차 별칭 Challenge 회피) |
| `SUPERADMIN_SEED_PASSWORD` | ⚠️ 잔류 (유지) | 삭제 미실시 — Production과 동일 정책 |

### 3.3 운영자 필수 액션 (P0 잔여)

1. [x] ~~Vercel에서 `SUPERADMIN_SEED_PASSWORD` 삭제~~ → **스킵** (사용자: 삭제 진행하지 않음)
2. [ ] SuperAdmin 로그인 → `/admin/account`에서 비밀번호 변경
3. [x] `AUTH_URL`이 실제 canonical URL과 일치하는지 확인 — **2026-08-10** `aickr.vercel.app`로 정리
3b. [x] Firewall Challenge 점검 — Attack Mode **Off**, System Mitigations Active. 1차 호스트 `aickr.vercel.app` 익명 200. 2차 `aicseoul-site.vercel.app`는 domain redirect→aickr 설정돼 있으나 익명 요청은 Challenge(429)가 redirect보다 선행. SEO/공개 링크는 `aickr`만 사용.
4. [ ] `DATABASE_URL` / `DIRECT_URL`이 Railway 공개 URL(동일 값)인지 재확인 — [P5-railway-postgres-cutover.md](./P5-railway-postgres-cutover.md)
5. [ ] (권장) Cloudinary + Resend 등록
6. [ ] (권장) 중복 `SUPABASE_*` 서버 키 정리

> `vercel env rm SUPERADMIN_SEED_PASSWORD …` 는 **실행하지 않음**.

---

## 4. `pnpm build` 검증

| 경로 | 결과 | 메모 |
|---|---|---|
| Vercel Production 배포 | ✅ READY | `dpl_t3s6vLBFiQ9fGTYNxXkeYjfP5xRF` 등 — migrate+next build 성공 |
| 로컬 worktree | ⬜ | Docker 미기동으로 `localhost:5433` P1001 |

로컬 재시도:

```bash
# Docker Desktop 기동 후
cd /Users/chunghyo/aic_website && docker compose up -d
cd .worktrees/p5-security-hardening   # 또는 main
set -a && source ../.env && set +a    # 경로에 맞게
pnpm build
```

---

## 5. 앱 하드닝 브랜치 (관련)

| 항목 | 상태 |
|---|---|
| `feat/p5-security-hardening` | 로컬 worktree `45cf340` — **origin/main 미포함** |
| 다음 | Push + PR → Preview에서 보안 헤더·rate limit 스모크 |

보안 코드가 Production에 올라가려면 별도 PR이 필요합니다. 본 P0 문서는 **이미 떠 있는** Vercel/Supabase 운영 면을 닫습니다.

---

## 6. P0 완료 기준

- [x] Supabase Advisor 확인 (INFO만, 설계와 일치)
- [x] Vercel prod 빌드 READY로 `pnpm build` 검증
- [x] P0 운영 완료 선언 (2026-07-29) — **시드 비번 env 삭제는 의도적 미실시**
- [ ] (선택·후속) `AUTH_URL` / `DATABASE_URL` 정합·Cloudinary·Resend
- [ ] (별도) `feat/p5-security-hardening` PR

다음 단계: P1은 스팸 관측 후 (Turnstile / 분산 rate limit).

**완료 문구:** 「P0 보안 운영 완료」 ✅
