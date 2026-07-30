# Admin 이메일 초대 + 권한 UX — Design Spec

- 작성일: 2026-07-30
- 상태: **approved** (2026-07-30 사용자 스펙 검토 승인)
- 플랜: `docs/superpowers/plans/2026-07-30-admin-invite-permissions.md`
- 관련: P0 Admin 권한 모델, `/admin/users`, `ADMIN_SIGNUP_INVITE_CODE`, Resend, SuperAdmin max 3

## 1. 문제

운영진 온보딩이 공유 초대 코드 + 자기 가입 + 수동 승인·권한에 의존한다. SuperAdmin을 이메일로 초대하거나, 초대 시점에 역할을·모듈을 미리 지정하고, 초대 취소·재발송·사용 여부를 추적할 수단이 없다. `/admin/users`의 모듈 체크·승인은 동작하지만, 승인 시 초대 권한 원클릭 적용과 권한 프리셋이 없어 반복 작업이 많다.

## 2. 목표

1. SuperAdmin이 **이메일별 초대 링크**를 만들고 Resend로 발송하며, UI에서 링크를 복사할 수 있게 한다.
2. 초대 시 **역할(SuperAdmin / Operator)** 과 Operator용 **모듈 권한**을 사전 지정한다.
3. 초대의 **상태·재발송·취소·수락**을 DB로 추적한다.
4. `/admin/users`에서 **권한 프리셋**과 pending Operator의 **초대 권한으로 승인**을 제공한다.
5. 기존 공유 `ADMIN_SIGNUP_INVITE_CODE` 가입 경로는 **병행 유지**한다.

## 3. 확정 요구사항

| 항목 | 결정 |
|---|---|
| 초대 대상 | SuperAdmin · Operator 모두 (초대 시 역할 선택) |
| Operator 초대 | 모듈 권한 또는 프리셋으로 사전 지정 |
| 전달 | Resend 자동 발송 + Admin 링크 복사 |
| SuperAdmin 가입 후 | 즉시 `active` (한도는 초대 생성 시 잠금) |
| Operator 가입 후 | `pending` — SuperAdmin 승인 시 초대에 저장된 모듈 적용 |
| 공유 초대 코드 | 유지 (코드 가입 = 기존 pending + 수동 권한) |
| UI 배치 | `/admin/users` 상단 초대(폼+목록) · 하단 UsersTable (레이아웃 A) |
| 권한 UX | 프리셋 + 「초대 권한으로 승인」 |
| 추적 | `pending` / `accepted` / `cancelled` / `expired` + 재발송 카운트 |

## 4. 비범위

- 공개 사이트 멤버(비 Admin) 가입·권한
- Auth.js 이메일 매직링크 / Supabase Auth 전환
- 초대 전용 별도 라우트(`/admin/invites`) 분리
- 공유 `ADMIN_SIGNUP_INVITE_CODE` 제거
- Contact 알림 외 Resend 제품화(템플릿 플랫폼 등)
- JWT 즉시 강제 재발급(기존 “재로그인 권장” 문구 유지 가능)

## 5. 아키텍처

**접근:** `AdminInvite` 테이블 + `/admin/users` 확장. 서명 전용(DB 없음) 초대는 취소·재발송·한도 잠금이 어려워 채택하지 않는다.

| 단위 | 책임 |
|---|---|
| `AdminInvite` (Prisma) | 초대 원장: 이메일, 역할, 모듈, tokenHash, 상태, 만료, 발송·수락 메타 |
| `src/lib/admin-invite*.ts` | 토큰 생성/해시 검증, 한도·중복 가드, 상태 전이(순수 로직 우선) |
| `src/lib/actions/invites.ts` | create / resend / cancel (SuperAdmin only) |
| `src/lib/email/invite.ts` | Resend 초대 메일 (키 없으면 스킵, 호출측에서 복사 링크로 복구) |
| `src/lib/actions/auth.ts` | `?token=` 가입 분기 (초대 우선, 공유 코드와 공존) |
| `src/lib/actions/users.ts` | 승인 시 초대 권한 적용; 프리셋은 UI→기존 `updateUserPermissions` |
| `InvitePanel` + `UsersTable` | `/admin/users` UI |
| `users/page.tsx` | 초대 목록 + 사용자 목록 로드, SuperAdmin 전용 |

## 6. 데이터 모델

### 6.1 `AdminInvite`

| 필드 | 설명 |
|---|---|
| `id` | cuid |
| `email` | 소문자·trim 정규화 |
| `role` | `superadmin` \| `operator` |
| `permPeople` … `permSettings` | Operator 사전 권한; SuperAdmin 초대 시 저장값은 무시 |
| `tokenHash` | 평문 토큰은 저장하지 않음 (해시만) |
| `status` | `pending` \| `accepted` \| `cancelled` \| `expired` |
| `expiresAt` | 기본 생성 + 7일 |
| `invitedById` | FK → User (초대한 SuperAdmin) |
| `acceptedUserId` | FK → User, nullable |
| `acceptedAt` / `cancelledAt` | nullable |
| `lastSentAt` | 최초·재발송 시각 |
| `sendCount` | 발송 시도 횟수 (≥1 on create) |
| `createdAt` / `updatedAt` | 표준 |

인덱스 제안: `(email, status)`, `tokenHash` unique, `status` + `expiresAt`.

### 6.2 한도 규칙

SuperAdmin 초대 **생성** 시:

`count(User.role=superadmin) + count(AdminInvite.status=pending AND role=superadmin) < 3`

이어야 생성 허용. Operator 초대는 이 한도와 무관.

## 7. 흐름

### 7.1 초대 생성

1. SuperAdmin이 이메일·역할·(Operator) 모듈/프리셋 제출
2. 가드: 이메일 형식, SuperAdmin 한도, 동일 이메일 `pending` 초대 없음, 이미 동일 이메일 User가 있으면 거부(재초대 전 기존 계정 비활성/삭제 정책은 운영 판단)
3. 평문 토큰 생성 → `tokenHash` 저장, `status=pending`, `expiresAt`, `sendCount=1`, `lastSentAt=now`
4. Resend 발송 시도; 실패해도 레코드 유지
5. UI에 `/admin/signup?token=<plaintext>` 표시 + 복사

### 7.2 재발송 · 취소 · 만료

- **재발송:** `pending`이고 미만료만. 새 토큰 발급(이전 링크 무효화) 권장 → `tokenHash` 갱신, `sendCount++`, `lastSentAt`, Resend + 복사 UI. (대안: 동일 토큰 재전송은 평문 미보관으로 불가 → **재발급이 기본**)
- **취소:** `pending` → `cancelled` + `cancelledAt`. 이후 토큰 가입 거부
- **만료:** 가입/목록 조회 시 `expiresAt < now` 이면 `expired`로 갱신 가능. `expired`/`cancelled`/`accepted`는 재발송 불가(필요 시 새 초대 생성)

### 7.3 가입 (`/admin/signup?token=…`)

1. 토큰 해시 조회 → 없거나 비-pending → 거부
2. 만료면 `expired` 처리 후 거부
3. 가입 이메일 = 초대 이메일 **강제 일치**
4. 사용자 생성:
   - SuperAdmin: `role=superadmin`, `status=active`, 모듈 true(또는 무시)
   - Operator: `role=operator`, `status=pending`, 모듈은 가입 시점 **전부 false** (권한은 승인 시 초대에서 적용)
5. 초대 `accepted` + `acceptedUserId` + `acceptedAt`
6. 토큰 없이 공유 코드 경로: 기존 동작 유지

### 7.4 Operator 승인 · 프리셋

- pending Operator에 연결된 `accepted` 초대가 있으면 「초대 권한으로 승인」: 초대 모듈 플래그 복사 + `status=active`
- 프리셋 (UI → 체크박스 채움, 저장은 기존 액션):
  - **콘텐츠만:** Meetups + Insights
  - **전체 운영:** People + Meetups + Insights + Contact + Settings
  - **문의·설정:** Contact + Settings
- 공유 코드로 가입한 pending(초대 없음)은 수동 체크/프리셋 후 승인·저장

## 8. UI

`/admin/users` (SuperAdmin only), 레이아웃 A:

1. **새 초대** 폼
2. **초대 목록** — 이메일, 역할, 상태, 만료, `sendCount`/`lastSentAt`, 액션(복사 불가 시 재발송으로 새 링크, 재발송, 취소). `accepted`면 사용자 행 링크/표시
3. **사용자 테이블** — 기존 SuperAdmin 토글·모듈·승인/비활성 + 프리셋 + 초대 권한 승인

기존 Admin 시각 언어(토큰·배지·폼)를 따른다. 카드 남발·히어로 장식은 하지 않는다.

## 9. 이메일

- 기존 Contact용 Resend 설정(`RESEND_API_KEY`, `RESEND_FROM`) 재사용
- 본문: 챕터명, 역할 요약, 가입 링크, 만료일
- 키 없음/실패: 서버 로그 + UI에 “메일 미발송, 링크를 복사해 전달” 안내

## 10. 에러 · 가드

| 조건 | 결과 |
|---|---|
| 비 SuperAdmin 초대 API | Forbidden |
| SuperAdmin 한도 초과(초대 포함) | 생성 거부 |
| 동일 이메일 pending 초대 | 거부 + 재발송 안내 |
| 토큰 무효/취소/만료/사용됨 | 가입 거부 |
| 가입 이메일 ≠ 초대 이메일 | 거부 |
| Resend 실패 | 초대 유지, 복사·재발송 |
| 본인 역할 변경·마지막 SuperAdmin 강등 등 | 기존 users 가드 |

## 11. 테스트 (최소)

- 초대 생성 성공 / SuperAdmin 한도 실패 / 중복 pending 실패
- 재발송 시 새 토큰으로 이전 링크 무효
- 취소·만료 후 가입 거부
- SuperAdmin 토큰 가입 → active
- Operator 토큰 가입 → pending, 모듈 false
- 「초대 권한으로 승인」 → active + 초대 모듈
- 프리셋이 체크박스 값을 올바르게 채움(컴포넌트/단위)
- 공유 코드 가입 회귀

## 12. 성공 기준

- [ ] SuperAdmin이 Operator/SuperAdmin을 이메일 초대하고 링크 복사·재발송·취소할 수 있다
- [ ] 초대 목록에서 상태·발송 횟수·수락 여부를 볼 수 있다
- [ ] SuperAdmin 초대 수락 시 즉시 콘솔 접근, Operator는 pending 후 승인으로 초대 권한 적용
- [ ] 권한 프리셋과 초대 권한 승인이 `/admin/users`에서 동작한다
- [ ] 공유 초대 코드 가입이 깨지지 않는다
- [ ] SuperAdmin 실효 상한(계정+pending 초대) ≤ 3

## 13. 구현 시 주요 파일

- `prisma/schema.prisma` + migration
- `src/lib/admin-invite*.ts`, `src/lib/actions/invites.ts`, `src/lib/email/invite.ts`
- `src/lib/actions/auth.ts`, `src/lib/actions/users.ts`
- `src/components/admin/InvitePanel.tsx` (신규), `UsersTable.tsx`, `AuthForm.tsx` / signup page
- `src/app/admin/(console)/users/page.tsx`
- 단위 테스트: invite 상태·한도·승인 매핑
