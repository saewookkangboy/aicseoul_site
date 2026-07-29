# AIC 서울 웹사이트 — 검수·승인 게이트

단계별로 **검수안 제시 → 사용자 승인 → 다음 단계 착수** 순서로 진행한다.  
승인 없이 다음 단계 구현에 들어가지 않는다.

## 게이트 규칙

1. 각 단계 종료 시 `docs/gates/P{N}-*.md`에 산출물·결정·잔여 리스크를 기록한다.
2. 상태가 `pending_review`이면 구현/다음 단계 착수 금지.
3. 사용자가 채팅에서 **「승인」** (또는 동등한 명시)을 하면 상태를 `approved`로 바꾸고 다음 단계를 시작한다.
4. 수정 요청이 있으면 해당 게이트 문서를 갱신하고 다시 `pending_review`로 둔다.
5. **구현은 feature 브랜치 + Pull Request로만 `main`에 반영한다.** `main`에 직접 장기간 WIP를 쌓지 않는다. 완료 시 Superpowers `finishing-a-development-branch`로 merge/PR/유지/폐기를 선택한다.

## 단계 맵

| 게이트 | 단계 | 상태 파일 | 다음 착수 조건 |
|---|---|---|---|
| G0 | P0 착수 결정 확정 | [P0-decisions.md](./P0-decisions.md) | P0 승인 |
| G1 | P1 기반 구축 계획 | (P0 승인 후 작성) | G1 승인 후 구현 |
| G2 | P1 구현 검수 | (구현 후) | G2 승인 후 P2 |
| G3 | P2 퍼블릭 페이지 계획/검수 | … | … |
| G4 | P3 Admin 계획/검수 | … | … |
| G5 | P4 연동·품질 검수 | … | … |
| G6 | P5 MVP 출시 검수 | … | … |

## 현재 위치

**G6 / P5 — Vercel 환경 준비 완료 · Tier A · Cloudinary · Resend 대기**

| 문서 | 내용 |
|---|---|
| [P5-tier-a-cloudinary-resend-runbook.md](./P5-tier-a-cloudinary-resend-runbook.md) | **진행 런북 (Tier A + Cloudinary + Resend)** |
| [P5-tier-a-checklist.md](./P5-tier-a-checklist.md) | 자료 수집 체크리스트 |
| [P5-content-guide.md](./P5-content-guide.md) | DB 적재 스펙 |
| [P5-vercel-setup.md](./P5-vercel-setup.md) | GitHub→Vercel env·빌드 |
| [P5-plan.md](./P5-plan.md) | 출시 계획 (`approved`) |
| [P5-tier-a-verification-status.md](./P5-tier-a-verification-status.md) | 에이전트 검증 상태 |

다음 트리거: 런북 완료 후 사용자 **「Tier A 준비 완료」** → Production 배포·시드·스모크 → G6b 검수.
