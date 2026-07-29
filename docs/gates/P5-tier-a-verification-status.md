# P5 — Tier A / 인프라 검증 상태 (에이전트)

- 작성일: 2026-07-30
- 상태: **blocked_on_operator** (Tier A 콘텐츠·Cloudinary/Resend는 보류 — 운영자 액션)
- 선행: 보안 하드닝 [PR #10](https://github.com/saewookkangboy/aicseoul_site/pull/10) · CI [PR #11](https://github.com/saewookkangboy/aicseoul_site/pull/11)

## 에이전트가 확인·구현한 것

| 항목 | 결과 |
|---|---|
| 앱 rate limit / CSP / upload 검증 코드 | ✅ `main` (PR #10) |
| CI + `pnpm test` | ✅ (PR #11) |
| Insights 저장 시 sanitize · error/not-found | ✅ (PR #11) |
| JWT 권한 주기 갱신 · signup 초대 코드(env) · loading UI | ✅ (후속 PR) |
| `DATABASE_URL` / Auth / SuperAdmin env (문서상) | ✅ P5-security-ops-checklist 2026-07-29 기준 존재 |
| Cloudinary Production env | ⏸ 보류 (사용자 지시) |
| Resend / NOTIFY | ⏸ 보류 (사용자 지시 / 계정 필요) |
| Tier A 체크리스트 | ⏸ 보류 (사용자 지시) |

## 운영자 필수 (에이전트 불가)

1. Cloudinary 계정 생성 → Vercel Production에 `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` / `CLOUDINARY_FOLDER` 등록  
2. (권장) Resend → `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAILS`  
3. [P5-tier-a-checklist.md](./P5-tier-a-checklist.md) 실콘텐츠 수집·Admin 적재  
4. 채팅에 **「Tier A 준비 완료」** → G6b 배포·시드 진행

## 검증 스모크 (env 등록 후)

```bash
# 보안 헤더 (Preview/Prod URL)
curl -sI https://<host>/ko | rg -i 'x-frame-options|content-security-policy|x-content-type'

# Admin 업로드 → Cloudinary URL 반환 여부
# Contact 제출 → Resend 수신 (키 있을 때)
```
