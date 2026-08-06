# P5 — DB 콘텐츠 적재 가이드 (이미지 · 텍스트)

- 작성일: 2026-07-28
- 대상: MVP 소프트 런치 / 프로덕션 시드·Admin 입력
- 원칙: **최소 세트로 먼저 공개 → Admin으로 보강**

---

## 0. 코드 vs DB (어디를 고치나)

| 콘텐츠 | 저장 위치 | 출시 시 작업 |
|---|---|---|
| Home Hero·Why·What·People티저·Partner 카피 | **코드** `src/lib/i18n/messages/ko.ts` · `en.ts` | 배포 필요. (구 `copy.ts`는 제거됨) |
| 정기 모임 5단계 라벨 | **코드** i18n messages (meetups) | 고정 포맷 — DB 불필요 |
| Contact 유형 안내 카피 | **코드** i18n messages (contact) | 고정 |
| 글로벌 통계 3종 | **DB** `SiteSetting` | Admin → 설정 |
| 문의 이메일·SLA·LinkedIn·모임 CTA | **DB** `SiteSetting` | Admin → 설정 |
| 운영진 People | **DB** `Member` | Admin → People |
| 원데이 클래스 | **DB** `Meetup` (type=class) | Admin → Meetups |
| 사진벽 | **DB** `ArchivePhoto` | Admin → 사진벽 |
| Insights 글 | **DB** `InsightPost` | Admin → Insights |
| SuperAdmin | **DB** `User` | env 시드 후 `/admin/account`에서 비밀번호 변경 |

→ **이미지·운영 텍스트의 “적재” = SiteSetting + Member + Meetup + Archive + Insights.**

---

## 1. 소프트 우선순위 (추천)

### Tier A — 소프트 런치 최소 (없으면 빈 화면·어색함)

1. **SiteSetting** 실값(또는 명확한 플레이스홀더)
2. **People** 실제 운영진 전원(또는 공개 동의자) + 사진
3. **ArchivePhoto** 8장 이상 (사진벽이 비면 Meetups가 허전함)
4. **InsightPost** Featured 1 + 일반 2 이상
5. **Meetup class** published 1건 (없으면 “아직 없음” 문구로도 가능)

### Tier B — 공개 직후 1주

6. Insights 4~6편으로 목록 채우기  
7. 클래스 사진·후기 보강  
8. 사진벽 12~20장  

### Tier C — 여유 있을 때

9. Home 카피 미세 조정(코드)  
10. OG 기본 이미지 PNG 교체(`public/og-default.svg` → 브랜드 PNG)

---

## 2. SiteSetting (텍스트) 추천값

Admin `/admin/settings` 또는 시드.

| key | 추천 | 메모 |
|---|---|---|
| `stats.members` | 본부 **최신 공식** (예: `250K+`) | PRD 11-1 확인 전엔 현행 유지 + 주석 |
| `stats.cities` | 공식 (예: `200+`) | 동일 |
| `stats.countries` | 공식 (예: `50+`) | 동일 |
| `contact.email` | 실주소 확보 전: `hello@aic-seoul.example` 유지 / 확보 후 실메일 | UI에 그대로 노출됨 |
| `contact.sla` | 실제 응답 기준 (예: `3~5일`) | 운영진 합의 후 |
| `social.linkedin` | `https://www.linkedin.com/company/117154975` | 없으면 빈 문자열 → Footer·Final CTA에서 링크 숨김 |
| `meetup.ctaUrl` | 외부 신청(Luma 등) 있으면 그 URL, 없으면 `/contact` | P0 기본 Contact |

**추천 시드 정책 (P5-A):** Settings만 실값으로 upsert, 데모 Member/Insights는 Admin으로 교체.

---

## 3. People (Member) — 텍스트 · 이미지

### 텍스트 필드

| 필드 | 추천 규칙 | 예시 |
|---|---|---|
| `nameKr` | 실명 (동의) | 이정임 |
| `nameEn` | 로마자 표기 통일 | Jeongim Lee |
| `bio` | **20~28자** 내외, 역할 라벨 금지 | `AIC 서울 챕터를 시작했습니다` |
| `linkedinUrl` / `websiteUrl` | 본인 동의분만, 없으면 비움 | |
| `isFounder` | 내부 참고용만 (화면 미노출) | 창립자 true |
| `isVisible` | 활동 종료는 false | |
| `sortOrder` | 기여도 순 수동 (가나다 X) | DnD로 확정 |

**권장 인원:** 공개 동의 전원. 최소 **6명**, 이상적 **12~13명**(PRD).

### 이미지

| 항목 | 추천 |
|---|---|
| 비율 | **3:4** (세로) |
| 해상도 | 짧은 변 ≥ 900px (업로드 시 1200px로 리사이즈됨) |
| 톤 | 비슷한 조명/배경(밝은 단색 또는 현장) — “AI 톤 통일” |
| 포맷 | JPEG/PNG → 업로드 후 WebP |
| 파일명 | `people-{nameEn}.jpg` 등 |
| 라이선스 | 본인 촬영·초상권 동의 |

Cloudinary 폴더 제안: `aic-seoul/people`

---

## 4. Meetups — 클래스 · 사진벽

### 4.1 원데이 클래스 (`Meetup` type=class) — 최소 1건

| 필드 | 추천 |
|---|---|
| title | 실제 클래스 주제 (예: 프롬프트/업무 적용형 제목) |
| date | 실제 진행일 |
| headcount | 실제 인원 |
| summary | 2~4문장, “무엇을 다뤘는지” |
| testimonials | **실후기 1~2문장** (익명 가능: “참가자”) |
| status | `published` |
| photos | **1~3장**, 현장 와이드/그룹, 크롭 강제 없음 |

이미지가 없으면 텍스트만으로도 섹션은 동작하지만, **사진 1장 이상**을 Tier A에 넣는 것을 권장.

### 4.2 사진벽 (`ArchivePhoto`)

| 항목 | 추천 |
|---|---|
| 장수 | 소프트 런치 **8~12장**, 이후 20장+ |
| 비율 | 자유 (메이슨리) — 세로·가로 섞기 |
| 해상도 | 긴 변 ≥ 1200px |
| 내용 | 네트워킹·토론·발제·클래스 현장 (얼굴 노출은 동의) |
| 정렬 | 최신순 자동 — 업로드 순서만 신경 |
| 금지 | 텍스트 오버레이 합성본(벽은 사진만) |

Cloudinary 폴더: `aic-seoul/archive`

---

## 5. Insights (`InsightPost`) — 텍스트 · 썸네일

### 최소 구성 (Tier A)

| # | 용도 | category | 썸네일 | Featured |
|---|---|---|---|---|
| 1 | 대표 모임 기록 | Meetup Recap | 있으면 16:9, 없어도 OK(폴백) | **true** |
| 2 | 클래스 후기 | Class Note | 선택 | false |
| 3 | 커뮤니티 안내 | Community | 없어도 폴백 검증용 | false |

### 텍스트 가이드

| 필드 | 추천 |
|---|---|
| title | 검색·공유 고려, 35자 전후 |
| summary | 1~2문장 (카드 2줄) |
| body | 마크다운, 400~1200자부터 |
| author | `AIC Seoul` 또는 실작성자 이름 |
| status | 공개분 `published` |
| isFeatured | **전 사이트 1건만** |

썸네일: 16:9 또는 16:10, 긴 변 ≥ 1400px. 없으면 골드/다크 폴백이 제목을 보여 주므로 **무리해서 만들지 않아도 됨**(PRD).

Cloudinary 폴더: `aic-seoul/insights`

---

## 6. 이미지 일괄 준비 체크리스트

운영진에게 요청할 때:

```
[ ] People: 인당 3:4 세로 1장 + 한글/영문/한줄소개/링크(선택) + 노출 동의
[ ] Archive: 현장 사진 8장+ (초상권 OK)
[ ] Class: 주제·일자·인원·요약·후기 1~2·사진 1~3
[ ] Insights: Featured 초안 1 + 추가 2 (마크다운)
[ ] Settings: 통계 공식값, 문의메일/SLA, LinkedIn, 신청 CTA URL
[ ] SuperAdmin: 실이메일 3명 + 초기 비번(배포 후 변경)
```

---

## 7. 적재 방법 (추천 워크플로)

1. 프로덕션 DB migrate  
2. SuperAdmin 시드 (실이메일)  
3. Admin 로그인 → **Settings** 먼저  
4. **People** 등록 + DnD 순서  
5. **사진벽** 일괄 업로드  
6. **클래스** 1건  
7. **Insights** Featured + 2편  
8. Contact 테스트 1건 → Inbox·(Resend) 확인  

데모 picsum/`public/placeholders`는 **프로덕션에 남기지 말 것** — 소프트 런치 전에 교체 또는 `isVisible`/삭제.

---

## 8. 현재 로컬 시드와의 관계

로컬 `prisma/seed.ts`는 데모용(가상 이름·picsum 계열 placeholders).  
**프로덕션 추천:** 시드 = SuperAdmin(+Settings)만, 위 Tier A는 Admin으로 실데이터 적재.

---

## 9. 다음 액션

P5 배포 실행 시 위 Tier A 자료를 받으면:

1. Neon/Vercel DB + env  
2. SuperAdmin 시드  
3. (선택) Settings SQL/시드 upsert  
4. 나머지는 Admin UI로 적재  

자료가 아직이면 **vercel.app + Settings 플레이스홀더 + People 일부**로 소프트 런치 가능.
