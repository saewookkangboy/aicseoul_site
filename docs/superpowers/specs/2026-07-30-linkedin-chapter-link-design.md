# AI Collective Seoul LinkedIn 챕터 링크 설계

**Date:** 2026-07-30  
**Status:** Approved (design dialogue)  
**Scope:** Footer + 홈 Final CTA에 챕터 LinkedIn 노출

## 1. 목표

AI Collective Seoul 공식 LinkedIn 회사 페이지를 사이트 테마에 맞는 아이콘·링크로 반영한다.

- URL: `https://www.linkedin.com/company/117154975`
- 전 페이지에서 Footer로 접근 가능
- 홈 Final CTA는 기존 텍스트 버튼을 유지하되 아이콘을 보강

## 2. 접근

기존 `SiteSetting` 키 `social.linkedin`을 단일 소스로 사용한다. Admin 설정·홈 JSON-LD `sameAs`·Final CTA와 경로를 맞춘다. URL을 컴포넌트에 하드코딩하지 않는다.

아이콘은 People 카드와 동일하게 `@phosphor-icons/react/ssr`의 `LinkedinLogo`를 사용한다. 공통 `SocialLink` 추출은 하지 않는다(CTA는 텍스트 버튼, Footer/People는 아이콘 버튼이라 형태가 다름).

## 3. 배치

### Footer (`SiteFooter`)

- `getSiteSettingsMap()`으로 `social.linkedin` 조회
- 값이 있을 때만 브랜드명 옆에 원형 아이콘 링크 노출
- People `ProfileLink`와 같은 톤: 원형, border, muted ink, hover 시 gold border / cream 배경 / 살짝 상승
- `aria-label`: `AI Collective Seoul LinkedIn`
- `target="_blank"` + `rel="noreferrer"`
- Admin 로그인 링크 위치·스타일은 변경하지 않음

### 홈 Final CTA (`HomeFinalCta`)

- 기존 “링크드인 팔로우” / “Follow on LinkedIn” 텍스트 버튼 유지
- 버튼 앞에 `LinkedinLogo` 아이콘 추가 (인라인 flex, gap)
- 다크 섹션 배경에 맞게 기존 cream/border 버튼 스타일 유지
- URL 없으면 버튼 전체 미노출 (현행)

### 범위 밖

- Header(GNB) LinkedIn 아이콘
- Contact 페이지 추가 소셜 블록
- People 멤버 카드 LinkedIn 동작 변경
- 새 SiteSetting 키 추가

## 4. 데이터 · 시드

| 항목 | 내용 |
|------|------|
| 키 | `social.linkedin` |
| 실 URL | `https://www.linkedin.com/company/117154975` |
| `prisma/seed.ts` | 플레이스홀더 `https://www.linkedin.com` → 실 URL로 갱신 |
| `prisma/seed-production.ts` | `SEED_LINKEDIN_URL` 우선, 없으면 빈 문자열 유지(실값은 Admin 또는 env) |
| 이미 배포된 DB | Admin → 설정에서 URL 입력, 또는 수동 SQL/시드 재실행 |

빈 문자열이면 Footer·CTA·JSON-LD `sameAs` 모두 링크를 넣지 않는다.

## 5. i18n · a11y

- CTA 문구는 기존 `ctaLinkedin` 키 재사용 (신규 카피 불필요)
- Footer 아이콘은 시각 라벨 없이 `aria-label`로 충분
- 외부 링크는 새 탭 + `rel="noreferrer"`

## 6. 성공 기준

- [ ] Footer에 LinkedIn 아이콘이 있고, 클릭 시 챕터 회사 페이지로 이동
- [ ] 홈 Final CTA LinkedIn 버튼에 아이콘 + 텍스트가 보이며 동일 URL
- [ ] `social.linkedin`이 비어 있으면 Footer·CTA 모두 숨김
- [ ] People 카드·Header·Contact 레이아웃 회귀 없음
- [ ] 로컬 시드 후 기본값이 실 URL

## 7. 구현 시 주요 파일

- `src/components/layout/SiteFooter.tsx` — settings 조회 + 아이콘
- `src/components/home/sections.tsx` — `HomeFinalCta` 아이콘
- `prisma/seed.ts` — 기본 URL
- (선택) `docs/gates/P5-content-guide.md` — 실 URL 예시 한 줄 갱신
