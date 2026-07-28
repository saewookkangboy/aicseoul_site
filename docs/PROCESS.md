# AIC 서울 웹사이트 — 개발 프로세스 (운영본)

PRD.md의 제품 요구와 `docs/gates/`의 승인 게이트로 실행한다.

## 원칙

1. **과설계 금지** — 챕터 규모(운영진 ~13명, 월 1회 모임)에 맞춤
2. **게이트 필수** — 계획·구현·검수마다 사용자 승인
3. **P0 결정 우선** — `docs/gates/P0-decisions.md`가 스코프보다 우선
4. **디자인** — PRD 7장 토큰 + [taste-skill](https://github.com/Leonxlnx/taste-skill)

## 단계

```
G0 P0 결정 ──승인──▶ G1 P1 계획 ──승인──▶ P1 구현 ──검수──▶ G2
                                              │
                                              ▼
                         G3 P2 퍼블릭 ──▶ G4 P3 Admin ──▶ G5 P4 품질 ──▶ G6 MVP
```

| Phase | 내용 | 게이트 |
|---|---|---|
| P0 | 착수 결정 | G0 |
| P1 | Next.js·DB·Auth·토큰·배포 골격 | G1(계획) → G2(구현 검수) |
| P2 | 퍼블릭 5페이지 | G3 |
| P3 | Admin CMS + 권한 UI | G4 |
| P4 | 미디어·알림·SEO·a11y | G5 |
| P5 | 출시(도메인 확정 시 DNS) | G6 |
| P6 | Phase 2 확장 | 별도 |

## 스택 (PRD 제안, G1에서 확정)

Next.js · PostgreSQL · Auth(이메일/비번) · Cloudinary 또는 S3 · Resend(선택) · Vercel

## Admin (P0 확정안)

- 운영진 **회원가입** (이메일+비밀번호)
- 동일 자격으로 **로그인**
- **SuperAdmin 최대 3명**이 하위 운영진 권한 설정
- 공개 가입이 즉시 전체 권한을 갖지 않도록 **승인/권한 부여** 필수

## Superpowers 오버레이

승인 게이트(`docs/gates/`)는 그대로다. 구현 사이클만 [Superpowers](https://github.com/obra/superpowers) 스킬로 정렬한다. 스킬 본문은 Cursor 플러그인에 두고 레포에 복사하지 않는다.

| 게이트 단계 | Superpowers 스킬 |
|---|---|
| Gn 계획 작성·승인 전 | `brainstorming` → `writing-plans` |
| 구현 | `using-git-worktrees`(권장) + `test-driven-development` / `subagent-driven-development` 또는 `executing-plans` |
| 구현 검수 직전 | `verification-before-completion` + `requesting-code-review` |
| 구현 완료·main 반영 | `finishing-a-development-branch` (**기본: Push + PR**) |

스펙·플랜: `docs/superpowers/specs/`, `docs/superpowers/plans/`
