# G4 / P3 — Admin CMS 계획

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P3 계획 승인」)
- 선행: G3b / P2 구현 `approved`
- 목적: **계획만** 확정. 승인 후 Admin CRUD 구현 → G4b 구현 검수

---

## 1. P3 목표

비개발자 운영진이 **코드 없이** 퍼블릭 콘텐츠를 관리할 수 있게 한다.  
P1의 Auth·권한·`/admin/users`를 확장하고, PRD 6장 CMS를 채운다.

| # | 모듈 | Done 기준 | 필요 권한 |
|---|---|---|---|
| 1 | 대시보드 | 미확인 문의 수, 최근 Insights, 최신 클래스 요약 | 로그인 active |
| 2 | People | CRUD + 3:4 업로드 + **DnD 순서** + 노출 토글 | `people` |
| 3 | Meetups | CTA URL + 클래스 CRUD(사진 1~3) + 사진벽 다중 업로드/삭제 | `meetups` |
| 4 | Insights | CRUD + 마크다운 본문 + 선택 썸네일 + Featured 1건 + draft/published | `insights` |
| 5 | Contact Inbox | 목록·유형필터·상태·메모·상세 | `contact` |
| 6 | Settings | 통계·SLA·문의메일·LinkedIn·meetup CTA | `settings` (또는 SuperAdmin) |
| 7 | 미디어 | 공통 업로드 API (로컬 disk → public/uploads) | 해당 모듈 |
| 8 | 네비 가드 | 권한 없는 모듈 메뉴 숨김 + 서버 액션 재검증 | 공통 |

**P3에서 하지 않음 (P4):** Resend 실메일 알림, Cloudinary 전환(계정 있으면 어댑터만 교체 가능하도록 인터페이스 유지), CSV보내기, 리치 WYSIWYG(마크다운이면 충분), Insights 발행 예약.

---

## 2. 라우트 맵

```
/admin                      대시보드
/admin/users                SuperAdmin 전용 (기존)
/admin/people               목록 + DnD
/admin/people/new
/admin/people/[id]/edit
/admin/meetups              CTA + 클래스 목록
/admin/meetups/classes/new
/admin/meetups/classes/[id]
/admin/meetups/archive      사진벽 업로드/삭제
/admin/insights
/admin/insights/new
/admin/insights/[id]/edit
/admin/contact              Inbox 목록
/admin/contact/[id]         상세·상태·메모
/admin/settings             SiteSetting 폼
```

사이드/탑 네비: 권한 있는 항목만 표시.

---

## 3. 모듈별 스펙

### 3.1 대시보드
- `ContactSubmission` status=`new` 건수 (강조)
- Insights published 최근 3
- Meetup class 최신 1 요약
- 권한 없는 위젯은 숨기거나 “권한 없음” 대신 아예 미표시

### 3.2 People (`permPeople`)
| 필드 | 규칙 |
|---|---|
| photo | 업로드, 미리보기 3:4 가이드(강제 크롭 X, 가이드만) |
| nameKr / nameEn | 필수 |
| bio | max ~40자 가이드(PRD 25자 내외 → UI 힌트 40) |
| linkedin / website | 선택, 빈값이면 퍼블릭 미노출 |
| isVisible | 토글 |
| sortOrder | **@dnd-kit** 목록 DnD → 저장 시 일괄 업데이트 |

삭제: hard delete 또는 isVisible=false 권장(기본은 비노출 토글, 삭제는 확인 다이얼로그).

### 3.3 Meetups (`permMeetups`)
- **CTA:** `SiteSetting meetup.ctaUrl` 인라인 편집
- **클래스:** title, date, headcount, summary, testimonials(텍스트 2칸 → Json 배열), status, photos 1~3
- **Archive:** multi-file input + drag zone, 최신순 그리드, 개별 삭제, 크롭 없음
- 퍼블릭 Meetups는 기존 쿼리 그대로 소비

### 3.4 Insights (`permInsights`)
- 필드: title, category(select + 커스텀 문자열 허용), summary, body(**textarea 마크다운**), thumbnail optional, author, publishedAt, status, isFeatured
- Featured ON 시 기존 Featured 자동 OFF (유일 제약)
- 목록: draft 배지, 최신순
- 퍼블릭 상세는 기존 plain/`whitespace-pre-wrap` 유지(마크다운 렌더는 선택 — P3에서 `react-markdown` 추가 권장)

### 3.5 Contact Inbox (`permContact`)
- 필터: type, status
- 상세: 본문 + memo + status 변경 (new/seen/done)
- 이메일 알림: **로그 stub** (`console` 또는 내부 메모) — 실발송 P4
- CSV: 제외

### 3.6 Settings (`permSettings` / SuperAdmin)
- stats.members/cities/countries
- contact.email, contact.sla
- social.linkedin
- meetup.ctaUrl (Meetups에도 중복 노출 OK)

Hero 장문 카피 CMS화는 **P3 제외**(상수 유지). 통계·링크·CTA만.

---

## 4. 미디어 업로드 (P3)

| 항목 | 결정 |
|---|---|
| 저장 | `public/uploads/{yyyy}/{uuid}-{safeName}` |
| API | `POST /api/admin/upload` (auth + 모듈 권한 헤더/쿼리) |
| 제한 | 이미지 mime만, max 8MB, 확장자 화이트리스트 |
| 최적화 | sharp로 max-width 1600 + webp 변환(가능 시) |
| Cloudinary | `getMediaUploader()` 어댑터 — env 있으면 전환, 없으면 로컬 |

`next.config` images: `/uploads/**` 허용.

---

## 5. 권한 강제

```
layout / page: auth() → status active → canAccessModule
Server Action 진입부: 동일 체크, 실패 시 throw
```

SuperAdmin = 전 모듈. `/admin/users`는 SuperAdmin만(기존).

---

## 6. UI 톤

- 퍼블릭과 동일 토큰, 다만 Admin은 **밀도↑** (DENSITY ~6), 카드는 테이블·폼 중심
- 장식 모션 최소, DnD 피드백만
- Phosphor 아이콘

---

## 7. 의존성 추가 (승인 후)

- `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities`
- `sharp` (업로드 리사이즈)
- `react-markdown` (Insights 퍼블릭 렌더, 선택)

---

## 8. 구현 순서 (승인 후)

1. Admin 셸 네비 + 권한 필터 + upload API  
2. Settings  
3. People CRUD + DnD  
4. Meetups CTA/클래스/아카이브  
5. Insights CMS + Featured 유일  
6. Contact Inbox  
7. 대시보드 위젯  
8. 빌드·수동 QA → **G4b 검수안**

---

## 9. 리스크

| 항목 | 대응 |
|---|---|
| Vercel 서버리스 로컬 디스크 ephemeral | 로컬/Docker는 OK; 프로덕션은 **P4 Cloudinary 필수**로 문서화 |
| DnD 모바일 | 데스크톱 우선, 모바일은 위/아래 버튼 보조 |
| 대용량 다중 업로드 | 파일당 순차 업로드 + 진행 표시 |

---

## 10. 승인 체크리스트

- [ ] P3 = Admin CMS 위 8모듈, 메일/Cloudinary 실연동은 P4에 동의
- [ ] 업로드 = 로컬 `public/uploads` (+ sharp) 우선에 동의
- [ ] Insights = 마크다운 textarea (풀 WYSIWYG 아님)에 동의
- [ ] Hero 장문 CMS 제외(통계·링크만 Settings)에 동의

**승인 문구:** `P3 계획 승인`  
**수정 시:** 변경점만 알려주시면 문서를 갱신합니다.
