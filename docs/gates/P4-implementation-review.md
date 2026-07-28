# G5b / P4 — 연동·품질 구현 검수

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P4 구현 승인」)
- 선행: G5 / P4 계획 `approved`
- 검증: `pnpm build` 성공

---

## 1. 구현 요약

| # | 산출물 | 상태 |
|---|---|---|
| 1 | Cloudinary 어댑터 (없으면 로컬) | ✅ |
| 2 | Resend 문의 알림 (키 없으면 스킵) | ✅ |
| 3 | sitemap.xml / robots.txt | ✅ |
| 4 | 기본 OG + Insights 글별 OG | ✅ |
| 5 | Organization JSON-LD | ✅ |
| 6 | Contact CSV 내보내기 | ✅ |
| 7 | `.env.example` / README 갱신 | ✅ |
| 8 | next/image remotePatterns (Cloudinary) | ✅ |

---

## 2. 확인

```bash
pnpm build   # 통과
pnpm dev
```

| 항목 | URL / 방법 |
|---|---|
| sitemap | http://localhost:3000/sitemap.xml |
| robots | http://localhost:3000/robots.txt |
| CSV | Admin → 문의함 → CSV 내보내기 |
| Resend | `RESEND_API_KEY` 설정 후 Contact 제출 → 수신함 |
| Cloudinary | `CLOUDINARY_*` 설정 후 Admin 업로드 → CDN URL |

키 없이도 빌드·로컬 업로드·문의 DB 저장은 동작해야 함.

---

## 3. 잔여 (P5)

- Vercel 프로덕션 배포·env
- 커스텀 도메인 DNS (미확정)
- Resend 실발신 도메인 인증
- 프로덕션에서는 Cloudinary 권장 (서버리스 디스크 ephemeral)

---

## 4. 승인 시 다음

**G6 / P5 MVP 출시 계획** 작성.

**승인 문구:** `P4 구현 승인`
