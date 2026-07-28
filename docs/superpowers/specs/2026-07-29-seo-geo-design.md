# SEO · GEO · Meta 전면 보강

- 작성일: 2026-07-29
- 상태: **approved** (2026-07-29 사용자 「스펙 승인」)
- 접근안: **1** — 중앙 SEO 모듈 + 페이지 메타 헬퍼
- 범위: A(실무 풀세트) + B(GEO) + C(메타 집중)
- 선행: P4 SEO 기초 (`sitemap` / `robots` / OG / Organization JSON-LD) 존재
- 관련: `PRD.md` SEO/OG, `docs/gates/P4-plan.md` §4

---

## 1. 목적

퍼블릭 사이트 전체에 **검색 엔진(SEO) + 생성형 AI 엔진(GEO) + 메타 태그**를 일관된 규칙으로 보강한다.

성공 기준:

- 모든 공개 페이지에 canonical · title · description · OG · Twitter가 빠짐없이 나간다.
- Insights 상세는 Article OG + Article JSON-LD를 가진다.
- `/llms.txt`(및 `/llms-full.txt`)로 AI 크롤러가 사이트 정체성·핵심 URL을 읽을 수 있다.
- Site URL은 Auth와 분리된 env로 관리되고, 예정 도메인 `https://aic.kr`로 교체 가능하다.
- Admin · API는 noindex / disallow를 유지한다.

---

## 2. URL · 환경변수

| 우선순위 | 소스 | 용도 |
|---|---|---|
| 1 | `NEXT_PUBLIC_SITE_URL` | SEO canonical, sitemap, robots, OG url, JSON-LD, llms.txt |
| 2 | `AUTH_URL` | fallback (로컬·과도기) |
| 3 | `http://localhost:3000` | 둘 다 없을 때 |

- 예정 프로덕션 도메인: **`https://aic.kr`** (미연결 시 Vercel URL을 `NEXT_PUBLIC_SITE_URL`에 두고, DNS 확정 후 교체).
- `AUTH_URL`은 Auth.js 콜백·쿠키용으로 유지. SEO base와 역할을 분리한다.
- `.env.example` / `.env.vercel.example` / README에 `NEXT_PUBLIC_SITE_URL`과 `aic.kr` 주석을 추가한다.

헬퍼: `src/lib/seo/site.ts` → `getSiteUrl()`, 브랜드 상수(`SITE_NAME`, 기본 description 등).

---

## 3. 아키텍처

```
src/lib/seo/
  site.ts          # getSiteUrl, 브랜드 상수
  metadata.ts      # pageMetadata({ title, description, path, image?, type? })
  json-ld.ts       # organization, website, breadcrumb, article 빌더
src/components/seo/
  JsonLd.tsx       # <script type="application/ld+json">
src/app/
  layout.tsx       # 루트 metadata + Organization JSON-LD
  robots.ts        # 검색·AI 크롤러 규칙
  sitemap.ts       # getSiteUrl() 사용
  llms.txt/route.ts
  llms-full.txt/route.ts
```

페이지는 `pageMetadata(...)`만 호출해 Metadata를 export한다. JSON-LD는 페이지(또는 layout)에서 `JsonLd`로 삽입한다.

Admin SEO CMS·다국어 hreflang·Event 스키마는 **비범위**.

---

## 4. 메타 태그 · OG / Twitter

### 4.1 루트 (`layout.tsx`)

- `metadataBase` = `getSiteUrl()`
- `title.default` = `AI Collective Seoul`
- `title.template` = `%s · AI Collective Seoul`
- `description` = 브랜드 한 줄 (기존 카피 정리)
- `keywords` = `AI Collective`, `AIC Seoul`, `AI 커뮤니티`, `서울 AI` 등 소수
- `authors` / `creator` / `publisher` = AI Collective Seoul
- `robots` = index, follow (+ googleBot 세부)
- `openGraph` / `twitter` 기본값 (locale `ko_KR`, siteName, 기본 이미지)
- `icons` · `themeColor` (브랜드 톤)
- Search Console 등 검증: `GOOGLE_SITE_VERIFICATION` env가 있을 때만 `verification.google` 설정 (키 없으면 생략)

### 4.2 페이지별

| 경로 | title | notes |
|---|---|---|
| `/` | `title.absolute` = 브랜드명 | `"Home · …"` 약화 방지 |
| `/meetups` | Meetups | canonical `/meetups` |
| `/people` | People | canonical `/people` |
| `/insights` | Insights | canonical `/insights` |
| `/insights/[id]` | 글 제목 | article · publishedTime · thumbnail OG |
| `/contact` | Contact | canonical `/contact` |
| `/admin/*` | 기존 | `robots: { index: false, follow: false }` 보강 |

`pageMetadata`가 각 경로에 `alternates.canonical`, `openGraph.url` / images, `twitter`를 일괄 채운다.

### 4.3 OG 이미지

- 기본: `public/og-default.png` (1200×630). SVG 단독 의존 제거 (SNS 미지원 대비). 기존 SVG는 폴백·디자인 소스로 남겨도 됨.
- Insights: `thumbnailUrl` 우선, 없으면 기본 PNG.

---

## 5. JSON-LD

| 스키마 | 위치 | 필드 |
|---|---|---|
| `Organization` | Root | name, url, description, logo, sameAs(설정에 LinkedIn 등 있으면) |
| `WebSite` | Home | name, url, inLanguage `ko`, publisher |
| `BreadcrumbList` | Meetups, People, Insights, Contact, 글 상세 | Home → 현재 |
| `Article` | Insights 상세 | headline, description, image, datePublished, dateModified, author(Organization) |

- FAQPage: 공개 FAQ 카피가 없으면 **제외**.
- Event: 일정 CMS 약함 → **제외**.

---

## 6. GEO

### 6.1 `llms.txt`

- 라우트: `src/app/llms.txt/route.ts` (`Content-Type: text/plain; charset=utf-8`)
- 내용: 사이트 정체성, 핵심 페이지 URL+한 줄 설명, 인용 시 권장 명칭, Contact 안내
- Site URL은 `getSiteUrl()` 사용

### 6.2 `llms-full.txt`

- 정적 페이지 요약 + published Insights 목록(제목·URL·summary). `DATABASE_URL` 없으면 정적만.

### 6.3 `robots.ts`

- `*` : allow `/`, disallow `/admin`, `/api`
- AI 크롤러(GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended 등): **명시적 allow** (차단하지 않음)
- `sitemap` = `${getSiteUrl()}/sitemap.xml`

### 6.4 콘텐츠 원칙

- 시맨틱 HTML(h1, article) 유지
- AI용 숨은 키워드 스팸·복제 텍스트 금지

---

## 7. sitemap

- `getSiteUrl()`로 base 교체
- 정적 5경로 + published insight URLs (기존 로직 유지, DB 없으면 정적만)

---

## 8. 구현 순서 (플랜에서 상세화)

1. `src/lib/seo/*` + `JsonLd` 컴포넌트
2. env 예시 · `getSiteUrl`로 layout / sitemap / robots 전환
3. 루트·페이지 metadata 적용 + 홈 absolute title
4. OG PNG 추가, Insights generateMetadata 보강
5. JSON-LD 삽입
6. `llms.txt` / `llms-full.txt` 라우트
7. robots AI allow · admin noindex
8. 빌드·수동 확인 (`/sitemap.xml`, `/robots.txt`, `/llms.txt`, 페이지 head)

출하: feature 브랜치 + PR (`finishing-a-development-branch`).

---

## 9. 비범위

- Admin에서 페이지 SEO 필드 편집
- 다국어 / hreflang
- Event · FAQPage 스키마 (카피·CMS 준비 전)
- 커스텀 도메인 DNS 설정 자체 (P5; env만 준비)
- Google/Bing 콘솔 등록 대행 (env 훅만)

---

## 10. 검수 체크리스트

- [ ] `NEXT_PUBLIC_SITE_URL` 설정 시 sitemap·canonical·llms 링크가 해당 호스트
- [ ] 홈 title이 브랜드 absolute
- [ ] 각 공개 페이지에 description + OG + Twitter + canonical
- [ ] Insights 상세 Article OG + Article JSON-LD
- [ ] `/llms.txt`, `/llms-full.txt` 200 + text/plain
- [ ] robots: admin/api disallow, AI bots allow
- [ ] `pnpm build` 통과
