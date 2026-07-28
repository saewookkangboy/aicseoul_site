# G4b / P3 — Admin CMS 구현 검수

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P3 구현 승인」)
- 선행: G4 / P3 계획 `approved`
- 검증: `pnpm build` 성공

---

## 1. 구현 요약

| 모듈 | 상태 |
|---|---|
| Admin 네비(권한 필터) | ✅ |
| 업로드 API + sharp→webp (`public/uploads`) | ✅ |
| Settings | ✅ |
| People CRUD + DnD 순서 | ✅ |
| Meetups CTA / 클래스 / 사진벽 | ✅ |
| Insights CMS + Featured 유일 + 마크다운 상세 | ✅ |
| Contact Inbox (필터·상태·메모) | ✅ |
| 대시보드 위젯 | ✅ |

---

## 2. 확인 방법

```bash
pnpm db:up && pnpm dev
# SuperAdmin: admin1@aic-seoul.example / ChangeMeNow!1
```

| 경로 | 확인 |
|---|---|
| `/admin` | 미확인 문의·최근 글·클래스 |
| `/admin/people` | DnD 후 `/people` 순서 반영 |
| `/admin/meetups` · `/archive` | CTA·클래스·다중 업로드 |
| `/admin/insights` | 작성·Featured·퍼블릭 반영 |
| `/admin/contact` | 폼 제출분 상태 변경 |
| `/admin/settings` | 통계/이메일 변경 → Home/Contact |

---

## 3. 잔여 (P4)

- Resend 실메일 알림
- Cloudinary (프로덕션 ephemeral disk 대응)
- CSV 내보내기
- Hero 장문 CMS

---

## 4. 승인 시 다음

**G5 / P4 연동·품질 계획** 작성.

**승인 문구:** `P3 구현 승인`
