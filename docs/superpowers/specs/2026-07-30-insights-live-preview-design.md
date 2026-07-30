# Admin Insights 본문 실시간 Preview 설계

**Date:** 2026-07-30  
**Status:** Approved (design dialogue)  
**Scope:** Admin Insights 작성/수정 폼 — 본문 TipTap 옆 공개와 동일한 본문 Preview

## 1. 목표

글 작성·수정 중 TipTap에 입력하는 본문을, 공개 Insights 상세의 **본문 영역**과 같은 렌더로 옆에서 확인한다.

- 레이아웃: 데스크톱 좌측 폼 / 우측 Preview 분할; 좁은 화면은 탭 전환
- Preview 범위: **본문만** (제목·카테고리·썸네일·요약·날짜·작성자 제외)
- 갱신: ~200ms 디바운스 후 반영

## 2. 접근

공개 상세가 이미 쓰는 `InsightBody`(`sanitizeInsightHtml` / 마크다운 분기 / `prose-aic`)를 Admin Preview에서 **재사용**한다. iframe·별도 preview 라우트·TipTap 읽기전용 미러는 쓰지 않는다.

## 3. 레이아웃

### 데스크톱 (`lg` 이상)

- `InsightForm`을 2열 그리드(대략 1:1, 또는 에디터 열을 약간 넓게)로 구성
- 좌: 기존 필드 + TipTap; 우: sticky 스크롤 Preview 패널
- 폼의 `max-w-2xl` 단일 열 제한은 Preview 분할을 위해 제거하거나 Preview 열 밖으로 재구성

### 좁은 화면

- `작성` | `미리보기` 세그먼트/탭
- 한 번에 한쪽만 표시; 기본은 `작성`

### Preview 패널 UI

- 작은 라벨: 「미리보기 · 공개 본문」
- 빈 본문(`""`, `<p></p>`, `<p><br></p>` 등): 「본문을 작성하면 여기에 표시됩니다」
- 내용 영역은 `InsightBody`만 렌더; `aria-live="polite"`

## 4. 컴포넌트·데이터 흐름

| 단위 | 역할 |
|------|------|
| `RichTextEditor` | `onHtmlChange?: (html: string) => void` 추가. hidden `body` 제출 유지 |
| `InsightForm` | 본문 HTML state 보유; TipTap 갱신 → ~200ms 디바운스 → Preview state; 초기값 `bodyToEditorHtml(initial?.body)` |
| `InsightBodyPreview` (신규, admin) | 라벨·빈 상태·패널 래퍼; 본문은 `@/components/insights/InsightBody` |
| `InsightBody` | 변경 없음 — Preview·공개 공유 |
| 공개 `/insights/[id]` | 변경 없음 |

디바운스 타이머는 언마운트 시 clear한다. Preview는 디바운스된 HTML만 받아 렌더한다(매 키입력 DOM 전체 sanitize 반복 최소화).

## 5. 보안

Preview도 공개와 동일하게 `sanitizeInsightHtml` 경로만 탄다. Admin에서 raw HTML을 우회 렌더하지 않는다.

## 6. 테스트

- 빈 HTML 판별 및/또는 디바운스 헬퍼에 대한 가벼운 단위 테스트
- `InsightBody` sanitize는 기존 경로 재사용 — 필수 E2E는 두지 않음

## 7. 비범위

- 제목·썸네일·요약·메타·영문 번역 Preview
- iframe / 별도 preview URL
- TipTap 에디터 스타일을 Preview에 복제
- 공개 Insights 상세 UI 변경
- Featured·상태 필드와 Preview의 연동

## 8. 성공 기준

1. lg+에서 에디터와 Preview가 나란히 보이고, 본문 입력 후 ~200ms 내 Preview가 갱신된다.
2. Preview 타이포·링크·제목·목록 스타일이 공개 상세 본문과 동일 컴포넌트 경로로 일치한다.
3. 좁은 화면에서 탭으로 작성/미리보기를 전환할 수 있다.
4. 빈 본문에서 Preview가 깨지지 않고 빈 상태 문구를 보인다.
