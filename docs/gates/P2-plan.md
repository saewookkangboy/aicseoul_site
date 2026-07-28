# G3 / P2 — 퍼블릭 5페이지 계획

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P2 계획 승인」)
- 선행: G2 / P1 구현 `approved`
- 목적: **계획만** 확정. 승인 후 퍼블릭 UI·데이터 연동 구현 → G3b 구현 검수

---

## 1. P2 목표

목업·PRD 5장 기준으로 **방문자가 보는 5페이지를 반응형으로 완성**한다.  
운영진 CMS UI(People DnD, Insights 에디터, Inbox UI, 사진 업로드 UI)는 **P3**.

| # | 산출물 | Done 기준 |
|---|---|---|
| 1 | Home | Hero(한·영)·통계·섹션·CTA, SiteSetting 연동 |
| 2 | Meetups | 정기 5단계 + 클래스 최신 1건 + 사진벽 메이슨리 |
| 3 | People | 4/2열 그리드, sortOrder, 역할 라벨 없음 |
| 4 | Insights | Featured + 최신순 목록(필터 UI 없음) + 썸네일 폴백 + 더보기 |
| 5 | Contact | 유형 안내 + 폼 → DB 저장 + 성공 피드백 |
| 6 | 시드 콘텐츠 | 데모 Member/Meetup/Archive/Insight (플레이스홀더 이미지 OK) |
| 7 | SEO 기초 | 페이지별 metadata title/description |
| 8 | 모션 | taste-skill dials(6/5/3) — 히어로·섹션 진입 2~3종 |

**P2에서 하지 않음:** Admin CRUD UI, Cloudinary 실연동, 이메일 알림(Resend), Insights 상세 고급 에디터(목록+간단 `/insights/[id]` 읽기만), 카테고리 필터 UI.

---

## 2. Design Read (taste-skill)

> Reading this as: **community chapter marketing site** for AI-curious professionals & partners, with an **editorial warm-stone + champagne-gold + vivid-orange CTA** language (PRD-locked aicollective tokens), leaning toward **asymmetric section rhythm, restrained scroll motion, no card-spam in hero**.

| Dial | 값 |
|---|---|
| DESIGN_VARIANCE | 6 |
| MOTION_INTENSITY | 5 |
| VISUAL_DENSITY | 3 |

가드: Inter/AI-purple 금지, 히어로에 카드·뱃지 오버레이 금지, CTA는 `--color-cta` 단일 accent, Phosphor 아이콘만.

---

## 3. 페이지별 구현 스펙

### 3.1 Home `/`
| 섹션 | 데이터 | 비고 |
|---|---|---|
| Hero | 카피 상수(+ 향후 SiteSetting 확장 여지) | 국문 H1 + 영문 서브, 언어토글 UI는 Home만(표시만, 전환 로직 MVP 최소) |
| Global stats | `stats.members/cities/countries` | SiteSetting |
| 3 Reason | 상수 (질문/현장/실험) | 카드 아닌 에디토리얼 블록 권장 |
| 무엇을 하나요 | 상수 3항 + 링크 | Meetups / Meetups / Contact |
| People 티저 | 텍스트+CTA | 카드 없음 |
| Partner | 텍스트+CTA → Contact | |
| Final CTA | Meetups + LinkedIn(`social.linkedin`) | |

### 3.2 Meetups `/meetups`
| 섹션 | 데이터 | 비고 |
|---|---|---|
| Intro | 상수 | 정기+클래스 두 축 |
| 정기 모임 5단계 | 하드코딩 | 네트워킹→…→Q&A |
| 신청 CTA | `meetup.ctaUrl` | 기본 `/contact` |
| 원데이 클래스 | Meetup `type=class` 최신 published 1건 | 없으면 빈 상태 문구 |
| 사진 벽 | ArchivePhoto 최신순 | CSS columns/masonry, 모바일 2열, 텍스트 없음 |

라우트 확장 여지: `/meetups`만 구현, 주석/폴더로 `classes`·`archive` 확장 가능 구조 유지.

### 3.3 People `/people`
- `Member` where `isVisible`, order by `sortOrder` asc
- 그리드 4 / 2열, 사진 3:4, 한글·영문·bio·링크(있을 때만)
- 역할 라벨 미노출

### 3.4 Insights `/insights`, `/insights/[id]`
- Featured: `isFeatured && published` 1건 (없으면 최신 1건으로 폴백하지 않음 — Featured 없으면 목록만)
- 목록: published, 최신순, 페이지당 9 + 「더 보기」(searchParams `page` 또는 cursor)
- 썸네일 없으면 골드/스톤 톤 블록 + 제목 폴백
- 상세: 본문 plain/markdown 간단 렌더(리치에디터는 P3)

### 3.5 Contact `/contact`
- 유형 안내 3종(카피) + 폼 4타입(partnership/education/community/other)
- Server Action → `ContactSubmission` create
- honeypot 필드(스팸 최소)
- SLA·이메일은 SiteSetting (`contact.sla`, `contact.email` 플레이스홀더)
- 성공 시 인라인 확인 메시지 (메일 발송은 P4)

---

## 4. 데이터·시드 전략

P3 Admin 전까지 **시드로 화면을 채운다**.

| 모델 | 시드 양 (제안) |
|---|---|
| Member | 8명 (placeholder 이미지 `/public/placeholders/…` 또는 picsum) |
| Meetup class | 1건 + 후기 Json + MeetupPhoto 2장 |
| ArchivePhoto | 8~12장 |
| InsightPost | Featured 1 + 일반 4 (일부 썸네일 null로 폴백 검증) |
| SiteSetting | P1 유지 + linkedin 플레이스홀더 URL 가능 |

실사진 교체는 P3/콘텐츠 게이트에서.

---

## 5. 컴포넌트·파일 맵 (제안)

```
src/components/home/Hero.tsx, Stats.tsx, …
src/components/meetups/FormatSteps.tsx, ClassHighlight.tsx, PhotoWall.tsx
src/components/people/MemberGrid.tsx
src/components/insights/FeaturedPost.tsx, PostCard.tsx, ThumbnailFallback.tsx
src/components/contact/ContactForm.tsx
src/lib/queries/*.ts          # prisma 조회
src/lib/actions/contact.ts    # 폼 submit
public/placeholders/…
```

모션: `motion/react`로 Hero fade/slide, 섹션 `whileInView` 1회 — Client leaf만.

---

## 6. SEO (P2 범위)

- 각 page `export const metadata` / `generateMetadata`(Insights 상세)
- OG는 공통 기본 이미지 1장(플레이스홀더) — 글별 OG는 P4 가능

---

## 7. 구현 순서 (승인 후)

1. 쿼리 헬퍼 + 시드 확장  
2. Home 섹션 순차  
3. Meetups (포맷 → 클래스 → 사진벽)  
4. People 그리드  
5. Insights 목록·상세·폴백  
6. Contact 폼 → DB  
7. metadata + 모션 폴리시  
8. 반응형·빌드 확인 → **G3b 구현 검수안**

---

## 8. 리스크

| 항목 | 대응 |
|---|---|
| 목업 카피 저작권/최종문안 | 목업 텍스트를 1차 반영, 운영진 수정은 P3 Settings/CMS |
| 이미지 라이선스 | placeholders만, 실사진은 P3 |
| 메이슨리 성능 | CSS columns + next/image sizes |

---

## 9. 승인 체크리스트

- [ ] P2 = 퍼블릭 5페이지 + 시드 + Contact DB (Admin CMS UI는 P3)에 동의
- [ ] Insights 필터 UI 없음 / Featured·폴백·더보기 포함에 동의
- [ ] 모임 CTA = SiteSetting `meetup.ctaUrl`(기본 Contact)에 동의
- [ ] 승인 후 위 순서로 구현 → 구현 검수 게이트에 동의

**승인 문구 예시:** `P2 계획 승인`  
**수정 시:** 변경점만 알려주시면 문서를 갱신합니다.
