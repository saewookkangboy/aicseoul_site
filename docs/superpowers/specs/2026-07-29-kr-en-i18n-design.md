# KR/EN 공개 사이트 i18n — Design

날짜: 2026-07-29  
상태: 초안 (브레인스토밍 승인 반영)

## 1. 목표

공개 웹사이트 전체에 한국어/영어 전환을 제공한다. 헤더 `KR` / `EN`이 동작하며, URL 로케일이 소스 오브 트루스이고 쿠키가 선호를 기억한다. CMS 원문은 단일 언어로 유지하고, 표시 시 Gemini API로 자동 번역한 뒤 DB에 캐시한다.

## 2. 확정 결정

| 항목 | 선택 |
|---|---|
| 범위 | 공개 페이지 전부 (Home, Meetups, People, Insights, Contact) — CMS 포함 |
| Admin | 다국어 비대상 (기존 경로·한국어 UI 유지) |
| CMS 번역 | 원문만 저장 + 런타임 Gemini 번역 + `TranslationCache` |
| 정적 UI/카피 | 코드 내 `messages/ko` · `messages/en` 수동 사전 |
| 로케일 | URL `[locale]` + 쿠키 하이브리드 |
| 번역 API | Google Gemini (`GEMINI_API_KEY`) |
| 기본 locale | `ko` |
| 소스 언어 가정 | CMS·한국어 카피 = `ko` |

## 3. 아키텍처 · 라우팅

```
/                          → 쿠키 또는 Accept-Language → /ko | /en
/ko | /en                  Home
/ko|en/meetups|people|insights|contact|insights/[id]
/admin/*                   로케일 세그먼트 없음
```

- **소스 오브 트루스:** URL `[locale]` (`ko` | `en`)
- **쿠키:** `NEXT_LOCALE` — `/` 진입·헤더 토글 시 갱신
- **미들웨어:** 공개 경로에 locale 없으면 쿠키 → 기본 `ko`로 리다이렉트. `/admin`, `_next`, 정적 자산, API(필요 시) 제외
- **`<html lang>`:** 현재 locale
- **기존 URL** (`/meetups` 등): 미들웨어가 `/ko/meetups` 등으로 리다이렉트

접근안: **경량 커스텀 i18n** (next-intl 미도입). `[locale]` 레이아웃 + 메시지 모듈 + 서버 번역 헬퍼.

## 4. 데이터 · Gemini · 캐시

### 4.1 Prisma `TranslationCache`

| 필드 | 설명 |
|---|---|
| `id` | cuid |
| `sourceHash` | 원문 SHA-256 (정규화 후) |
| `sourceLang` | 기본 `ko` |
| `targetLang` | `en` (확장 여지) |
| `sourceText` | 원문(디버그·재검증, 길이 상한 가능) |
| `translatedText` | 번역 결과 |
| `provider` | `gemini` |
| `createdAt` / `updatedAt` | |

유니크: `(sourceHash, targetLang)`. 원문 변경 → 해시 변경 → 캐시 미스 → 재번역.

### 4.2 `translateCached(text, targetLang, opts?)`

1. `targetLang === sourceLang` 또는 빈 문자열 → 원문
2. 캐시 히트 → `translatedText`
3. `GEMINI_API_KEY` 없음 → 원문 폴백
4. Gemini 호출 → 저장 → 반환
5. 실패/타임아웃/빈 응답 → 원문 + 서버 로그

- **서버 전용** (클라이언트에 키 노출 금지)
- 페이지 내 다수 필드: `Promise.all` + 요청 스코프 메모이제이션으로 동일 문장 중복 호출 방지
- HTML 본문(Insights): 태그·속성 보존 지시 (프롬프트). TipTap HTML 입력 가정
- 기본 모델: `gemini-3.5-flash` (`GEMINI_TRANSLATE_MODEL`로 오버라이드; `gemini-2.0-flash`는 2026-06-01 종료)

### 4.3 환경 변수

| 변수 | 용도 |
|---|---|
| `GEMINI_API_KEY` | Gemini API 키. 없으면 원문 폴백 |
| `GEMINI_TRANSLATE_MODEL` | 선택. 기본 `gemini-3.5-flash` |

로컬: `.env` / `.env.local` (gitignore).  
템플릿: `.env.example`, `.env.vercel.example`.  
프로덕션: Vercel Project Env에 동일 키 등록.

**보안:** API 키를 채팅·커밋·클라이언트 번들에 넣지 않는다. 유출 시 Google AI Studio에서 키 재발급.

### 4.4 정적 메시지

- `src/lib/i18n/messages/ko.ts`, `en.ts` — Home/Meetups/Contact/푸터/폼 라벨·빈 상태 등
- Nav 브랜드 라벨(Meetups 등)은 양 언어 동일 유지 가능
- `formatDate(locale)` — `ko-KR` / `en-US`
- 기존 `copy.ts`는 메시지 모듈로 이관하거나 locale 선택 래퍼로 대체

### 4.5 CMS 필드 (EN일 때)

| 엔티티 | 필드 |
|---|---|
| People | `bio`; 이름은 기존 `nameEn` 우선, 없으면 `nameKr` |
| Meetups | `title`, `summary`, testimonials 텍스트 |
| Insights | `title`, `category`, `summary`, `body`; `author`는 선택 |

## 5. 헤더 UX

- **전 공개 페이지**에 `KR` / `EN` (Home-only 제한 해제)
- 활성 locale 강조, 비활성 muted
- 클릭: 동일 path의 locale만 치환 + 쿠키 갱신
- 접근성: 실제 링크/버튼 (`aria-hidden` 장식 제거)

## 6. 에러 · 테스트 · 롤아웃

### 실패 폴백

| 상황 | 동작 |
|---|---|
| 키 없음 / 쿼터 / 5xx | 해당 필드 원문, 서버 로그 |
| 빈·공백 응답 | 원문 |
| 타임아웃 | ~8s 후 원문 |
| 일부 필드만 실패 | 성공분만 번역, 페이지 전체 실패 금지 |

### 테스트

- 단위: `sourceHash` 안정성, locale path 헬퍼, 메시지 키
- 통합(모킹): 캐시 미스 → Gemini mock → 저장 → 히트 시 API 미호출
- 스모크: `/`→`/ko`, 헤더 토글, `/en/meetups` 렌더, `/admin` 비로케일

### 롤아웃

1. `TranslationCache` 마이그레이션 + `[locale]` 라우트 이전
2. 정적 메시지 ko/en
3. CMS `translateCached` 연결
4. Vercel에 `GEMINI_API_KEY` 설정 (없어도 원문 폴백으로 배포 가능)
5. 구 URL은 미들웨어가 `/ko/...`로 리다이렉트

### 성공 기준

- 헤더 `KR`/`EN`이 전 공개 페이지에서 locale URL + 쿠키를 바꿈
- EN에서 정적 UI·카피가 영어
- EN에서 CMS가 번역(키 있을 때) 또는 원문 폴백(키 없을 때)
- Admin·기본 SEO(ko) 동작 유지

## 7. 비범위

- Admin UI 번역
- 번역 품질 수동 검수 CMS / 사전 워밍 잡
- hreflang 고급 SEO CMS (필요 시 후속)
- KO 외 소스 언어 자동 감지
- next-intl 도입

## 8. 구현 다음 단계

`writing-plans`로 `docs/superpowers/plans/2026-07-29-kr-en-i18n.md` 작성 후 feature 브랜치에서 구현·PR.
