# P5 — Tier A 자료 수집 체크리스트

소프트 런치 / Production 적재 전 **전부 체크**되면 배포 진행.

담당: _______________ · 목표일: _______________

---

## Settings (텍스트)

- [ ] `stats.members` 본부 공식값
- [ ] `stats.cities` 본부 공식값
- [ ] `stats.countries` 본부 공식값
- [ ] `contact.email` (실주소 또는 당분간 플레이스홀더 유지 합의)
- [ ] `contact.sla` (예: 3~5일) 운영 합의
- [ ] `social.linkedin` 실 URL (없으면 비움 합의)
- [ ] `meetup.ctaUrl` (`/contact` 또는 Luma 등 외부 URL)

## People

- [ ] 공개 인원 목록 (최소 6, 목표 12~13)
- [ ] 인당: 한글명 / 영문명 / 한 줄 소개(20~28자)
- [ ] 인당: 3:4 사진 + 초상권 동의
- [ ] LinkedIn·웹사이트 (동의분만)
- [ ] 노출 순서(sort) 초안

## Archive 사진벽

- [ ] 현장 사진 8장 이상 (긴 변 ≥1200px)
- [ ] 초상권·사용 동의

## 원데이 클래스 (1건+)

- [ ] 제목 / 일자 / 인원 / 요약
- [ ] 후기 1~2
- [ ] 현장 사진 1~3

## Insights

- [ ] Featured 글 1 (Meetup Recap 권장)
- [ ] 추가 published 2편 (썸네일 선택)
- [ ] 본문 (CMS 위지윅 / TipTap HTML)

## SuperAdmin · 인프라 (배포 직전)

- [ ] SuperAdmin 실이메일 최대 3
- [ ] 호스팅 Postgres `DATABASE_URL` (Supabase/Neon 등)
- [ ] Cloudinary — [런북 Track C](./P5-tier-a-cloudinary-resend-runbook.md#track-c--cloudinary)
- [ ] Resend — [런북 Track R](./P5-tier-a-cloudinary-resend-runbook.md#track-r--resend)

---

## 완료 시

통합 실행 순서·스모크는 **[P5-tier-a-cloudinary-resend-runbook.md](./P5-tier-a-cloudinary-resend-runbook.md)** 를 따른다.

채팅에 **「Tier A 준비 완료」** 라고 보내 주세요.  
→ G6b: Production 배포 + 시드(필요 시) + 스모크 검수.

> Insights 본문은 TipTap 위지윅(HTML)입니다. 기존 마크다운 본문은 공개 페이지에서 계속 렌더됩니다.
