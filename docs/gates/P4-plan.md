# G5 / P4 — 연동·품질 계획

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P4 계획 승인」)
- 선행: G4b / P3 구현 `approved`
- 목적: **계획만** 확정. 승인 후 연동·품질 마감 → G5b 구현 검수 → (이후) G6 MVP 출시

---

## 1. P4 목표

프로덕션에 올려도 깨지지 않는 **미디어·알림·SEO·접근성·보안** 마감.  
도메인 DNS는 여전히 미확정(P0) → **Vercel 프리뷰/프로덕션 URL** 기준으로 검증.

| # | 산출물 | Done 기준 |
|---|---|---|
| 1 | Cloudinary 어댑터 | env 있으면 업로드→Cloudinary, 없으면 로컬 유지 |
| 2 | Contact 이메일 알림 | Resend로 `contact.email` 또는 `NOTIFY_EMAILS`에 신규 문의 알림 |
| 3 | SEO | `sitemap.xml`, `robots.txt`, 기본 OG, Insights 글별 OG |
| 4 | 접근성 패스 | People/Archive alt, 폼 label, CTA 대비(흰 글씨 on orange) 재확인 |
| 5 | 성능 | `next/image` remotePatterns(Cloudinary), 퍼블릭 페이지 revalidate 전략 |
| 6 | 보안 폴리시 | 업로드 mime/size 재확인, Admin rate 최소, `.env.example` 정리 |
| 7 | (선택) Inbox CSV | Contact 목록 CSV 다운로드 — **기본 포함 제안** |
| 8 | 운영 README | Vercel env 체크리스트, Cloudinary/Resend 설정 절차 |

**P4에서 하지 않음:** 커스텀 도메인 DNS(P5), Hero 장문 CMS, Insights 카테고리 필터 UI, 멤버 게시판, 결제.

---

## 2. Cloudinary

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=aic-seoul   # optional
```

- `getMediaUploader()`: 자격 증명 있으면 Cloudinary SDK 업로드(+자동 포맷), 없으면 기존 `localDiskUploader`
- `next.config` `images.remotePatterns`: `res.cloudinary.com`
- 기존 `/placeholders/*`, `/uploads/*` 로컬 URL은 그대로 동작
- **계정 없을 때:** 어댑터 코드만 넣고 로컬로 빌드·검수 통과 (실계정은 P5 전 권장)

---

## 3. Resend 알림

```
RESEND_API_KEY=
RESEND_FROM=AIC Seoul <onboarding@resend.dev>   # 도메인 확정 전 Resend 테스트 발신
NOTIFY_EMAILS=admin1@…,ops@…                    # 비우면 SiteSetting contact.email
```

- Contact `submitContactAction` 성공 후 비동기/await 발송
- 실패 시: DB 저장은 유지, `console.error` + (선택) Admin 대시보드에 “알림 실패”는 과도 → 로그만
- 본문: 유형·이름·이메일·메시지 요약 + Admin Inbox 딥링크(`AUTH_URL/admin/contact/[id]`)

도메인 미확정이므로 **Resend 샌드박스/테스트 from** 허용. 실발신 도메인은 P5.

---

## 4. SEO / OG

| 항목 | 내용 |
|---|---|
| `app/sitemap.ts` | `/`, meetups, people, insights, contact + published insight URLs |
| `app/robots.ts` | allow `/`, disallow `/admin` |
| 공통 OG | `openGraph` / `twitter` 기본 이미지 `public/og-default.png` (간단 생성 또는 플레이스홀더) |
| Insights | `generateMetadata`에 `openGraph.images` = thumbnail 또는 폴백 |
| JSON-LD | Organization 최소 1회(Home) — 선택이나 권장 |

---

## 5. 접근성·품질

- People `alt={`${nameKr} 프로필`}` 유지·보강
- Archive 사진: 장식 이미지면 `alt=""` 유지 + 부모에 섹션 제목으로 맥락
- Contact/Admin 폼: label 연결 점검
- CTA 버튼: 흰 텍스트 + `#FF640D` 대비 문서화(이미 사용 중)
- `prefers-reduced-motion`: Reveal 컴포넌트 기존 대응 유지

---

## 6. 캐시·성능

| 페이지 | 전략 |
|---|---|
| 퍼블릭 콘텐츠 | `revalidate = 60` 또는 태그 `revalidatePath` 유지(P3 액션) + 선택적 `revalidateTag` |
| Admin | `force-dynamic` 유지 |
| 이미지 | Cloudinary transform URL 또는 sharp 로컬 결과 |

과도한 ISR 리팩터는 하지 않음.

---

## 7. CSV (포함 제안)

- `/admin/contact` → “CSV 내보내기” (현재 필터 반영)
- `permContact` 필요
- 필드: createdAt, type, status, name, org, email, message

원치 않으면 승인 시 “CSV 제외”라고만 적어 주세요.

---

## 8. 구현 순서 (승인 후)

1. Cloudinary 어댑터 + next/image remotePatterns  
2. Resend 헬퍼 + Contact 액션 연동  
3. sitemap / robots / OG  
4. CSV 내보내기  
5. a11y·env 문서 점검  
6. 빌드 + 수동 QA → **G5b 검수안**

---

## 9. 환경변수 (추가분 `.env.example`)

```
# P4
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=aic-seoul
RESEND_API_KEY=
RESEND_FROM="AIC Seoul <onboarding@resend.dev>"
NOTIFY_EMAILS=
```

키 없어도 앱은 기동·로컬 업로드·알림 스킵으로 동작해야 함.

---

## 10. 승인 체크리스트

- [ ] Cloudinary = env 있을 때만 사용, 없어도 P4 완료 가능에 동의
- [ ] Resend = 신규 문의 알림, from은 테스트 도메인 허용에 동의
- [ ] SEO sitemap/robots/OG 포함에 동의
- [ ] Contact CSV 포함(또는 제외 지시)에 동의

**승인 문구:** `P4 계획 승인`  
**수정 시:** 변경점만 알려주세요.
