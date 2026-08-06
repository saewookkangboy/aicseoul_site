# Admin 본인 계정·비밀번호·People 프로필 연동 — Design Spec

- 작성일: 2026-08-06
- 상태: **draft** (사용자 설계 방향 승인: A / Member 필드 1 / 비밀번호 현재 확인 필수 / User↔Member 1:1)
- 플랜: (승인 후) `docs/superpowers/plans/2026-08-06-admin-account-member-link.md`
- 관련: Auth.js Credentials, `/admin/users`, `Member` CMS, P5 운영 비밀번호 변경 절차

## 1. 문제

운영진이 가입·승인된 뒤 **본인 이름·비밀번호를 앱에서 바꿀 수 없다.** P5 운영 문서는 DB 업데이트·재가입을 안내한다. 또한 공개 People의 `Member` 소개(이름·bio·사진·링크)와 `User` 로그인 계정은 **스키마상 연결이 없어**, 본인 소개를 “내 계정”에서 함께 고칠 수 없다.

## 2. 목표

1. active 세션의 운영진이 **`/admin/account`** 에서 본인 표시 이름·비밀번호를 변경한다.
2. SuperAdmin이 User와 Member를 **1:1로 연결**하면, 해당 User가 본인 People 소개(공개 프로필 필드)를 같은 페이지에서 수정한다.
3. 비밀번호 변경은 **현재 비밀번호 확인** 후 새 비밀번호(및 확인)로만 허용한다.
4. 기존 `/admin/people` CMS·권한 모델·공개 People 페이지 동작을 깨지 않는다.

## 3. 확정 요구사항

| 항목 | 결정 |
|---|---|
| 접근 방식 | **A** — `/admin/account` 단일 페이지 |
| User↔Member | **1:1** — `User.memberId` optional unique FK → `Member` |
| 연결 UI | SuperAdmin만 `/admin/users`에서 연결·해제 |
| 계정 필드 | 이메일 **읽기 전용**; `User.name` 수정 가능 |
| 비밀번호 | 현재 비밀번호 + 새 비밀번호 + 확인; 최소 8자 (signup과 동일) |
| Member 본인 수정 | 연결 시에만: `nameKr`, `nameEn`, `bio`, 사진(`photoUrl`/`photoAssetId`), `linkedinUrl`, `websiteUrl` |
| Member 본인 제외 | `isVisible`, `isFounder`, `sortOrder` — 기존 People CMS(`/admin/people`)만 |
| 세션 | `status === active` 만 `/admin/account` 접근; pending은 기존 `/admin/pending` |
| Nav | AdminNav에 모듈 권한 무관 **「내 계정」** 링크 (로그아웃 근처) |

## 4. 비범위

- 이메일 변경·이메일 인증·비밀번호 재설정(forgot password) 메일 플로우
- 공개 사이트 비-Admin 회원 가입
- Member 없이 User만으로 공개 People 카드 자동 생성
- Operator가 타인 Member/User 연결
- JWT에 Member 필드 전부 실어 나르기 (서버에서 session user id로 조회)
- `/admin/settings`(사이트 CMS)에 계정 UI 혼입

## 5. 아키텍처

```
[AdminNav → /admin/account]
        │
        ├─ updateAccountProfile (User.name)
        ├─ changePassword (bcrypt verify current → hash new)
        └─ updateLinkedMemberProfile (if User.memberId)
                │
                ▼
        [Member: nameKr/nameEn/bio/photo/links]
                │
                ▼
        공개 /[locale]/people (기존 쿼리)

[SuperAdmin /admin/users]
        └─ linkUserMember / unlinkUserMember (memberId set/clear)
```

| 단위 | 책임 |
|---|---|
| Prisma `User.memberId` | Member 1:1 연결 (unique, nullable, onDelete SetNull) |
| `src/lib/actions/account.ts` | 본인 프로필·비밀번호·연결 Member 업데이트 (세션 user id만) |
| `src/lib/actions/users.ts` (확장) | SuperAdmin 연결·해제 |
| `/admin/account` | 폼 UI (계정 + 조건부 Member 섹션) |
| `UsersTable` / users page | Member 선택 드롭다운·연결 상태 표시 |
| 순수 플래너 (선택) | 비밀번호/연결 검증 — 단위 테스트 용이 |

### 5.1 연결 규칙

- 한 `Member`는 최대 한 `User`에만 연결 (`User.memberId` `@unique`).
- 이미 다른 User에 연결된 Member를 선택하면 거부(명확한 에러).
- Member 삭제 시 `User.memberId`는 `SetNull` → 계정은 유지, 소개 섹션은 “미연결” 안내.
- 연결 해제 시 Member 행은 삭제하지 않음.

### 5.2 보안

- 모든 account 액션은 `auth()` 세션의 `user.id`만 대상 (form의 userId 신뢰 금지).
- 비밀번호: `compare(current, passwordHash)` 실패 시 generic 에러; 성공 시 `hash(new, 12)`.
- Member 업데이트는 `user.memberId`가 가리키는 행만; form의 memberId로 타 행 갱신 불가.
- Rate limit: 비밀번호 변경에 login과 유사 IP(+user) 제한 권장 (기존 `RATE` 패턴 재사용).
- 업로드: 기존 `ImageUploadField` + people 모듈 업로드 경로 재사용 (권한: active 세션이면 본인 프로필용 허용 — 구현 시 upload route가 `permPeople`만 요구하면 **본인 계정 업로드용 예외 또는 account 전용 경로**를 플랜에서 명시).

## 6. 데이터 모델

```prisma
model User {
  // ...existing fields...
  memberId String? @unique
  member   Member? @relation(fields: [memberId], references: [id], onDelete: SetNull)
}

model Member {
  // ...existing fields...
  linkedUser User?
}
```

마이그레이션: nullable FK + unique index만. 기존 행 `memberId = null`.

## 7. UI / UX

### 7.1 `/admin/account`

1. **계정** — 이메일(readonly), 이름, 저장.
2. **비밀번호** — 현재 / 새 / 확인, 변경 버튼 (별도 submit 또는 섹션 분리).
3. **People 소개** — `memberId` 있으면 Member 폼(소개 필드만); 없으면 안내 문구.

성공 시 동일 페이지에 성공 메시지(또는 redirect with flash). 실패 시 인라인 에러.

### 7.2 `/admin/users` (SuperAdmin)

- 각 User 행(또는 상세)에 연결 Member 표시 + select(미연결 Member 목록; 이미 연결된 Member는 옵션에서 제외하거나 disabled).
- 연결 / 해제 액션.

## 8. 테스트

- 단위: 비밀번호 플래너(현재 불일치, 새 비밀번호 짧음, 확인 불일치); Member 연결 중복 거부.
- (가능 시) 액션 가드: 다른 userId로 Member 갱신 시도 불가 — 순수 함수로 id 일치 검사.

## 9. 구현 순서 (요약)

1. Prisma 마이그레이션 + 클라이언트 타입
2. account 액션 + 테스트
3. `/admin/account` 페이지 + Nav
4. users 연결 UI + SuperAdmin 액션
5. 업로드 권한 정합 (people 모듈 없이도 본인 사진 업로드 가능하도록)

## 10. 승인 체크리스트

- [x] 접근 A (`/admin/account`)
- [x] User↔Member 1:1 (`memberId`)
- [x] Member 본인 필드 = 소개 중심 (CMS 관리 플래그 제외)
- [x] 비밀번호 = 현재 비밀번호 확인 필수
- [x] 이메일 변경 비범위
- [ ] 사용자 스펙 파일 검토 승인 → 플랜 작성
