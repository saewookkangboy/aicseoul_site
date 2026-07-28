# SuperAdmin 역할 설정 UI — Design Spec

- 작성일: 2026-07-29
- 상태: **approved** (2026-07-29 사용자 승인)
- 관련: P0 Admin 권한 모델, `/admin/users`, `updateUserPermissions`

## 1. 문제

서버 액션 `updateUserPermissions`에는 `promoteSuperadmin` 경로가 있으나, `/admin/users`의 `UsersTable` UI에는 모듈 권한만 노출되어 SuperAdmin 승격·강등을 화면에서 할 수 없다.

## 2. 목표

SuperAdmin이 **다른 사용자**의 역할을 SuperAdmin ↔ Operator로 변경하고, 강등 시 모듈 권한을 같은 제출에서 지정할 수 있게 한다.

## 3. 확정 요구사항

| 항목 | 결정 |
|---|---|
| 승격 | Operator → SuperAdmin |
| 강등 | SuperAdmin → Operator |
| 강등 시 모듈 권한 | 같은 폼에서 함께 지정 (C안) |
| 본인 역할 변경 | 불가 (A안) |
| SuperAdmin 상한 | 최대 3명 (기존) |
| SuperAdmin 하한 | 최소 1명 (마지막 SuperAdmin 강등 거부) |
| 접근 | `/admin/users` — SuperAdmin만 (기존) |

## 4. 비범위

- `SUPERADMIN_EMAILS` env 화이트리스트 변경
- Prisma 스키마 변경
- Users 페이지 외 Admin UI 개편
- 승인/비활성 플로우 변경 (기존 유지)

## 5. 아키텍처

기존 `updateUserPermissions`를 확장하고 `UsersTable`에 SuperAdmin 토글을 추가한다. 역할 전용 액션 분리·모달 재구성은 하지 않는다.

| 단위 | 책임 |
|---|---|
| `src/lib/actions/users.ts` | 가드 + 승격/강등 + 모듈 권한 저장 |
| `src/components/admin/UsersTable.tsx` | `currentUserId` prop으로 본인 행 판별; SuperAdmin 체크 + 모듈 권한 한 폼 제출, 에러 표시 |
| `src/app/admin/(console)/users/page.tsx` | `currentUserId` 전달; 안내 문구(승격/강등·최대 3·본인 불가) 보강 |

## 6. UI · 데이터 흐름

### 6.1 행별 UI

- **본인 행:** 역할·모듈 읽기 전용. 안내: “본인 역할은 변경할 수 없습니다.”
- **타인 행:** 편집 폼
  - 체크박스 `SuperAdmin` (`role === "superadmin"`이면 기본 체크)
  - 모듈 권한 5개 (People / Meetups / Insights / Contact / Settings)
  - SuperAdmin 체크 시: 모듈 체크박스 비활성 + 전부 켜진 표시
  - SuperAdmin 해제 시: 모듈 체크박스 편집 가능 → 제출 값으로 저장
  - 「권한 저장」 제출

### 6.2 클라이언트 → 서버 매핑

제출 시:

- `permPeople` / `permMeetups` / `permInsights` / `permContact` / `permSettings`
- `promoteSuperadmin` = (체크됨 && 기존 role이 operator)
- `demoteSuperadmin` = (!체크됨 && 기존 role이 superadmin)

역할 변경이 없으면 operator에 대해 모듈 권한만 갱신. 기존이 superadmin이고 체크 유지면 모듈은 전부 `true`로 유지.

### 6.3 서버 흐름

1. 세션 확인 — SuperAdmin만 허용
2. 대상 사용자 조회
3. `userId === session.user.id` → 거부
4. `promoteSuperadmin && demoteSuperadmin` → 거부
5. 승격: SuperAdmin 수 `< 3`일 때만 `role = superadmin`, 모듈 전부
6. 강등: SuperAdmin 수 `> 1`일 때만 `role = operator` + 제출 모듈 플래그
7. pending이면 `status = active` (기존 동작 유지)
8. `revalidatePath("/admin/users")`

## 7. 에러 · 가드

| 조건 | 메시지/결과 |
|---|---|
| 비로그인 / 비 SuperAdmin | Forbidden |
| 본인 `userId` | 본인 역할은 변경할 수 없습니다 |
| 승격 시 이미 3명 | SuperAdmin은 최대 3명입니다 |
| 강등 시 마지막 1명 | 최소 1명의 SuperAdmin이 필요합니다 |
| 승격·강등 동시 | 잘못된 요청 |
| 대상 없음 | User not found |

UI: 모달 없이 해당 행/폼 하단 짧은 에러 문구.

## 8. 테스트 (최소)

- 승격 성공 (예: SuperAdmin 2명일 때) → 모듈 전부 true
- 승격 실패 (이미 3명)
- 강등 성공 → operator + 지정 모듈 권한
- 강등 실패 (마지막 1명 SuperAdmin)
- 본인 변경 실패
- operator 모듈만 변경 (역할 유지) 성공

## 9. 구현 메모

- 기존 `promoteSuperadmin?: boolean`에 `demoteSuperadmin?: boolean` 추가
- 세션 JWT에 role이 캐시되므로, 강등/승격된 사용자는 **재로그인 또는 세션 갱신** 전까지 옛 권한이 남을 수 있음 → MVP에서는 문서/안내로 충분; 강제 세션 무효화는 비범위
- 배포: feature branch + PR (`finishing-a-development-branch`)
