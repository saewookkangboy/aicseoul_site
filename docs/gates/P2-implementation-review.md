# G3b / P2 — 퍼블릭 구현 검수

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P2 구현 승인」)
- 선행: G3 / P2 계획 `approved`
- 검증: `pnpm build` 성공

---

## 1. 구현 요약

| # | 산출물 | 상태 |
|---|---|---|
| 1 | Home (Hero·통계·Why·What·People·Partner·Final CTA) | ✅ |
| 2 | Meetups (5단계·클래스 1건·사진벽) | ✅ |
| 3 | People (4/2열, sortOrder, 링크 선택 노출) | ✅ |
| 4 | Insights 목록·상세·Featured·썸네일 폴백·더보기 | ✅ |
| 5 | Contact 폼 → DB + honeypot + SLA/이메일 설정 | ✅ |
| 6 | 시드 (Member 8, Class 1, Archive, Insights 5) | ✅ |
| 7 | 페이지 metadata | ✅ |
| 8 | Reveal 모션 (motion/react) | ✅ |

---

## 2. 로컬 확인

```bash
pnpm db:up
pnpm db:seed
pnpm dev
```

| URL | 확인 포인트 |
|---|---|
| `/` | 다크 히어로, 통계, 섹션 리듬, Home만 KR/EN |
| `/meetups` | 5단계, 클래스 기록, 메이슨리 사진 |
| `/people` | 8명 그리드, 역할 라벨 없음 |
| `/insights` | Featured + 카드 폴백(썸네일 없는 글) |
| `/insights/[id]` | 상세 본문 |
| `/contact` | 제출 후 성공 메시지, DB `ContactSubmission` |

---

## 3. 잔여 (의도적)

- Admin CMS CRUD / DnD / Inbox UI → **P3**
- Cloudinary·Resend → **P4**
- Insights 카테고리 필터 UI → Phase 2
- 실사진·실카피 교체 → 콘텐츠/P3

---

## 4. 승인 시 다음

**G4 / P3 Admin CMS 계획** 작성.

**승인 문구:** `P2 구현 승인`  
**수정 시:** 변경점만 알려주세요.
