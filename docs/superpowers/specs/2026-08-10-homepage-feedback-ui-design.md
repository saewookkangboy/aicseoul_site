# AIC 홈페이지 피드백 UI · 콘텐츠 개선 — Design Spec

- 작성일: 2026-08-10
- 상태: **approved** (2026-08-10 사용자: 스펙/플랜 저장 후 P0부터 구현 지시)
- 플랜: `docs/superpowers/plans/2026-08-10-homepage-feedback-ui.md`
- 출처: 이정임 「AIC 홈페이지 피드백」(디자인·사용성)

## 1. 문제

공개 사이트는 카피·구조가 갖춰졌으나, 피드백 기준으로 **좌측 쏠림**, **섹션 구분감 부족**, **CTA 위계 불일치**, **밋업 프로세스 우측 공백**, **멤버 페이지 개별 카드/플레이스홀더**, **EN 히어로 한국어 서브라인**이 남아 있다.

## 2. 목표

1. 피드백 체크리스트의 **P0 → P1 → P2**를 단계적으로 반영한다.
2. 기존 최소주의 톤을 유지하되, 구분감·CTA·스캔성을 높인다.
3. 필요 시 Admin(설정·People)을 함께 수정해 운영진이 단체 사진을 올릴 수 있게 한다.

## 3. 확정 결정

| 항목 | 결정 |
|---|---|
| 히어로 정렬 | **히어로만** 중앙 정렬(카피·CTA). 하위 섹션은 기존 좌측 정렬 유지 |
| KR 상단 네비 | **영문 라벨**로 통일 (`Meetups` / `People` / `Insights` / `Contact`) |
| EN 히어로 `subheadline` | 한국어 제거 → **영문 보조 문장** (KR만 한·영 페어 유지) |
| Why / What 3열 | 그림자 없는 **약한 패널**(배경·패딩·테두리) + 제목 굵기 강화. 카드 남용 금지 |
| Stats | Phosphor 아이콘 3종(멤버·도시·개국) |
| People 티저 | eyebrow `Members` + CTA를 파트너십과 같은 **filled 포인트 버튼** |
| 활동·중간 CTA | 텍스트 링크 → 포인트 위계 버튼(또는 filled/outline 통일) |
| 밋업 프로세스 | 데스크톱 **2열**: 좌 카피+CTA, 우 단계 리스트(+아이콘). 모바일은 스택 |
| 멤버 페이지 | ~~개별 대형 사진 카드 → 단체 사진+리스트~~ → **2026-08-10 rollback: 개별 카드 그리드 유지** |
| 단체 사진 | ~~`people.groupPhotoUrl`~~ → **rollback (미적용)** |
| 멤버 bio EN | 기존 `translateCached` 유지 (별도 `bioEn` 컬럼은 이번 범위 밖) |

## 4. 비범위

- 홈 장문 카피 전면 재작성
- Insights / Contact 페이지 구조 개편
- Member `bioEn` DB 컬럼 추가
- 실제 단체 사진 촬영·촬영 일정 관리(운영 작업)

## 5. 아키텍처

| 단위 | 책임 |
|---|---|
| `src/lib/i18n/messages/{ko,en}.ts` | 네비·eyebrow·CTA·EN subheadline·people 카피 |
| `src/components/home/sections.tsx` | 히어로 정렬, Stats 아이콘, Why/What 패널, CTA 스타일 |
| `src/components/meetups/sections.tsx` | 프로세스 2열 레이아웃, eyebrow i18n |
| `src/components/people/PeopleGrid.tsx` | 단체 사진 + 리스트 |
| `SiteSetting` + Admin settings | `people.groupPhotoUrl` |
| `updateSettingsAction` | 허용 키 확장 + `/people` revalidate |

## 6. 우선순위

- **P0**: EN subheadline, KR nav 영문, People eyebrow, CTA 버튼 통일
- **P1**: 히어로 중앙, Stats 아이콘, Why/What 패널, 밋업 2열
- **P2**: 멤버 단체사진+리스트 + Admin 설정

## 7. 성공 기준

- [ ] KR/EN 홈에서 People 티저에 Members(또는 동등) eyebrow와 filled CTA가 보인다
- [ ] EN 히어로에 한국어 서브라인이 없다
- [ ] KR 네비가 영문이다
- [ ] Why/What·밋업·멤버가 피드백 이슈를 해소한 UI로 보인다
- [ ] Admin 설정에서 단체 사진 URL을 저장하면 `/people`에 반영된다
