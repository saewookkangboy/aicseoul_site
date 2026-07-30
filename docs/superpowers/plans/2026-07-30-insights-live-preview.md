# Insights Live Body Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin Insights 작성/수정 폼에서 TipTap 본문 옆(모바일은 탭)에 공개 상세와 동일한 `InsightBody` Preview를 ~200ms 디바운스로 보여 준다.

**Architecture:** TipTap HTML을 `InsightForm`으로 리프트하고 디바운스한 뒤, admin 래퍼 `InsightBodyPreview`가 공개 `InsightBody`를 재사용한다. iframe·별도 preview 라우트는 없다.

**Tech Stack:** Next.js App Router, React client components, TipTap, 기존 `InsightBody` + `sanitizeInsightHtml`, node:test

**Spec:** `docs/superpowers/specs/2026-07-30-insights-live-preview-design.md`

## Global Constraints

- Preview는 **본문만** (제목·카테고리·썸네일·요약·날짜·작성자 제외)
- 공개 `InsightBody` 재사용 — raw HTML 우회 렌더 금지 (`sanitizeInsightHtml` 경로만)
- 갱신 ~200ms 디바운스; 언마운트 시 타이머 clear
- 데스크톱 `lg+` 좌폼·우 Preview; 좁은 화면 `작성` | `미리보기` 탭(기본 `작성`)
- 공개 `/insights/[id]` UI 변경 없음
- feature branch + PR; `main`에 장수명 WIP 지양

---

## File map

| File | Role |
|------|------|
| `src/lib/insights/body-empty.ts` | 빈 TipTap HTML 판별 (에디터·Preview 공유) |
| `src/lib/insights/body-empty.test.ts` | 빈 HTML 단위 테스트 |
| `src/components/admin/insights/InsightBodyPreview.tsx` | 라벨·빈 상태·`InsightBody` 래퍼 |
| `src/components/admin/insights/RichTextEditor.tsx` | `onHtmlChange` + `isInsightBodyEmpty` 사용 |
| `src/components/admin/insights/InsightForm.tsx` | 디바운스 state, 2열/탭 레이아웃 |

---

### Task 1: `isInsightBodyEmpty` 유틸 + 테스트

**Files:**
- Create: `src/lib/insights/body-empty.ts`
- Create: `src/lib/insights/body-empty.test.ts`
- Modify: `src/components/admin/insights/RichTextEditor.tsx`

**Interfaces:**
- Produces: `isInsightBodyEmpty(html: string): boolean`
- Consumes: none

- [ ] **Step 1: Write the failing test**

Create `src/lib/insights/body-empty.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isInsightBodyEmpty } from "./body-empty";

describe("isInsightBodyEmpty", () => {
  it("treats blank and empty paragraphs as empty", () => {
    assert.equal(isInsightBodyEmpty(""), true);
    assert.equal(isInsightBodyEmpty("   "), true);
    assert.equal(isInsightBodyEmpty("<p></p>"), true);
    assert.equal(isInsightBodyEmpty("<p><br></p>"), true);
    assert.equal(isInsightBodyEmpty("<p><br/></p>"), true);
  });

  it("treats real content as non-empty", () => {
    assert.equal(isInsightBodyEmpty("<p>hello</p>"), false);
    assert.equal(isInsightBodyEmpty("<h2>Title</h2><p>x</p>"), false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec node --import tsx --test src/lib/insights/body-empty.test.ts`

Expected: FAIL (module not found / export missing)

(If the repo’s `pnpm test` runner auto-discovers `src/**/*.test.ts`, `pnpm test` also fails on this file until Step 3.)

- [ ] **Step 3: Implement `isInsightBodyEmpty`**

Create `src/lib/insights/body-empty.ts`:

```ts
/** TipTap / Insight 본문이 “비어 있음”으로 취급할지 판별 */
export function isInsightBodyEmpty(html: string): boolean {
  const normalized = html.replace(/\s/g, "");
  return (
    !normalized ||
    normalized === "<p></p>" ||
    normalized === "<p><br></p>" ||
    normalized === "<p><br/></p>"
  );
}
```

- [ ] **Step 4: Point `RichTextEditor` at the shared helper**

In `src/components/admin/insights/RichTextEditor.tsx`:

1. Add import:

```ts
import { isInsightBodyEmpty } from "@/lib/insights/body-empty";
```

2. Delete the local `isEditorEmpty` function.

3. Replace `const isEmpty = isEditorEmpty(html);` with:

```ts
  const isEmpty = isInsightBodyEmpty(html);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`

Expected: all pass, including `isInsightBodyEmpty` cases

- [ ] **Step 6: Commit**

```bash
git add src/lib/insights/body-empty.ts src/lib/insights/body-empty.test.ts src/components/admin/insights/RichTextEditor.tsx
git commit -m "$(cat <<'EOF'
refactor(insights): share empty TipTap body helper

EOF
)"
```

---

### Task 2: `InsightBodyPreview` 컴포넌트

**Files:**
- Create: `src/components/admin/insights/InsightBodyPreview.tsx`

**Interfaces:**
- Consumes: `InsightBody` from `@/components/insights/InsightBody`; `isInsightBodyEmpty` from `@/lib/insights/body-empty`
- Produces: `InsightBodyPreview({ html: string })`

- [ ] **Step 1: Create the preview wrapper**

Create `src/components/admin/insights/InsightBodyPreview.tsx`:

```tsx
import { InsightBody } from "@/components/insights/InsightBody";
import { isInsightBodyEmpty } from "@/lib/insights/body-empty";

type Props = {
  html: string;
};

export function InsightBodyPreview({ html }: Props) {
  const empty = isInsightBodyEmpty(html);

  return (
    <div className="flex h-full min-h-[20rem] flex-col rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="border-b border-[var(--color-border)] px-4 py-2.5 text-[11px] tracking-wide text-[var(--color-ink-muted)]">
        미리보기 · 공개 본문
      </p>
      <div
        className="flex-1 overflow-y-auto px-5 py-4"
        aria-live="polite"
        aria-busy={false}
      >
        {empty ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            본문을 작성하면 여기에 표시됩니다
          </p>
        ) : (
          <InsightBody body={html} />
        )}
      </div>
    </div>
  );
}
```

Note: `InsightBody`의 루트에 `mt-8`이 있다. Preview에서는 상단 여백이 과할 수 있으므로, **이 Task에서는 그대로 두고** 시각적으로 거슬리면 Task 4 커밋 전에 `InsightBody`에 optional `className`을 추가하지 말고 Preview 래퍼에서 `-mt-8`로 보정하거나, `InsightBody`에 `className?: string`을 합쳐 `mt-8`을 외부에서 덮어쓰게 한다. 권장: Preview에서만

```tsx
<div className="[&_.prose-aic]:mt-0">
  <InsightBody body={html} />
</div>
```

처럼 자식 `prose-aic`의 `mt-8`을 상쇄한다 (`InsightBody` 루트는 `prose-aic mt-8 ...`).

Update the non-empty branch to:

```tsx
          <div className="[&>div]:mt-0">
            <InsightBody body={html} />
          </div>
```

(`InsightBody` 최상위가 `div.prose-aic.mt-8`이므로 `[&>div]:mt-0`으로 Preview 안 여백을 맞춘다.)

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/insights/InsightBodyPreview.tsx
git commit -m "$(cat <<'EOF'
feat(admin): add InsightBodyPreview panel shell

EOF
)"
```

---

### Task 3: `RichTextEditor` `onHtmlChange`

**Files:**
- Modify: `src/components/admin/insights/RichTextEditor.tsx`

**Interfaces:**
- Consumes: `isInsightBodyEmpty` (Task 1)
- Produces: `Props.onHtmlChange?: (html: string) => void` — every TipTap `onUpdate`, pass `ed.getHTML()` (raw; parent debounces)

- [ ] **Step 1: Extend props and wire `onUpdate`**

Update the `Props` type:

```ts
type Props = {
  name: string;
  initialHtml?: string;
  required?: boolean;
  onHtmlChange?: (html: string) => void;
};
```

Update the component signature:

```ts
export function RichTextEditor({
  name,
  initialHtml = "",
  required,
  onHtmlChange,
}: Props) {
```

In `useEditor`, change `onUpdate` to:

```ts
    onUpdate: ({ editor: ed }) => {
      const next = ed.getHTML();
      setHtml(next);
      onHtmlChange?.(next);
    },
```

Do **not** put `onHtmlChange` in a way that recreates the editor every render if `useEditor` deps require stability — TipTap’s `useEditor` here already uses an options object without a dependency array in current code; keep the same pattern as today (no new `useEditor` dependency array unless the file already has one).

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/insights/RichTextEditor.tsx
git commit -m "$(cat <<'EOF'
feat(admin): emit TipTap HTML via onHtmlChange

EOF
)"
```

---

### Task 4: `InsightForm` 분할 레이아웃 + 디바운스 Preview

**Files:**
- Modify: `src/components/admin/insights/InsightForm.tsx`

**Interfaces:**
- Consumes: `RichTextEditor` `onHtmlChange`; `InsightBodyPreview`; `isInsightBodyEmpty` (optional, Preview handles empty)
- Produces: live Preview driven by debounced HTML (~200ms)

- [ ] **Step 1: Rewrite `InsightForm` with preview state and layout**

Replace `src/components/admin/insights/InsightForm.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { InsightBodyPreview } from "@/components/admin/insights/InsightBodyPreview";
import { RichTextEditor } from "@/components/admin/insights/RichTextEditor";
import {
  AdminPanel,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
import { looksLikeHtml } from "@/lib/sanitize-html";

const CATEGORIES = ["Meetup Recap", "Class Note", "Community"] as const;
const PREVIEW_DEBOUNCE_MS = 200;

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    title?: string;
    category?: string;
    summary?: string;
    body?: string;
    thumbnailUrl?: string | null;
    author?: string;
    publishedAt?: string;
    status?: "draft" | "published";
    isFeatured?: boolean;
  };
  submitLabel: string;
};

/** 기존 마크다운 시드를 TipTap HTML로 가볍게 감쌈 */
function bodyToEditorHtml(body?: string): string {
  if (!body?.trim()) return "";
  if (looksLikeHtml(body)) return body;
  return body
    .split(/\n\n+/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return "";
      return `<p>${lines.join("<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export function InsightForm({ action, initial, submitLabel }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const initialBodyHtml = bodyToEditorHtml(initial?.body);
  const [liveHtml, setLiveHtml] = useState(initialBodyHtml);
  const [previewHtml, setPreviewHtml] = useState(initialBodyHtml);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPreviewHtml(liveHtml);
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [liveHtml]);

  const tabBtn = (pane: "edit" | "preview", label: string) => (
    <button
      type="button"
      onClick={() => setMobilePane(pane)}
      aria-pressed={mobilePane === pane}
      className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
        mobilePane === pane
          ? "bg-[var(--color-ink)] text-white"
          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <AdminPanel>
      <div className="mb-4 flex gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 lg:hidden">
        {tabBtn("edit", "작성")}
        {tabBtn("preview", "미리보기")}
      </div>

      <form
        action={action}
        className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8"
      >
        <div
          className={`flex flex-col gap-4 ${
            mobilePane === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
          <label className={labelClass}>
            <span className={labelHintClass}>제목</span>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>카테고리</span>
            <input
              name="category"
              list="insight-categories"
              required
              defaultValue={initial?.category ?? "Community"}
              className={fieldClass}
            />
            <datalist id="insight-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>요약</span>
            <textarea
              name="summary"
              required
              rows={2}
              defaultValue={initial?.summary}
              className={fieldClass}
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className={labelHintClass}>본문</span>
            <p className="text-xs text-[var(--color-ink-muted)]">
              위지윅 에디터로 작성합니다. 굵게·제목·목록·링크 등을 툴바에서
              사용할 수 있습니다. 우측(또는 미리보기 탭)에서 공개 본문과 같은
              미리보기를 확인하세요.
            </p>
            <RichTextEditor
              name="body"
              required
              initialHtml={initialBodyHtml}
              onHtmlChange={setLiveHtml}
            />
          </div>
          <ImageUploadField
            module="insights"
            folder="insights"
            value={thumbnailUrl}
            onUploaded={setThumbnailUrl}
            label="썸네일 (선택)"
          />
          <label className={labelClass}>
            <span className={labelHintClass}>작성자</span>
            <input
              name="author"
              defaultValue={initial?.author ?? "AIC Seoul"}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>발행일</span>
            <input
              name="publishedAt"
              type="date"
              defaultValue={initial?.publishedAt}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>상태</span>
            <select
              name="status"
              defaultValue={initial?.status ?? "draft"}
              className={fieldClass}
            >
              <option value="draft">초안</option>
              <option value="published">발행</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initial?.isFeatured}
              className="accent-[var(--color-cta)]"
            />
            Featured (대표글 - 기존 Featured는 자동 해제)
          </label>
          <button type="submit" className={`${btnPrimaryClass} mt-2 w-fit`}>
            {submitLabel}
          </button>
        </div>

        <div
          className={`lg:sticky lg:top-6 ${
            mobilePane === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <InsightBodyPreview html={previewHtml} />
        </div>
      </form>
    </AdminPanel>
  );
}
```

- [ ] **Step 2: Run unit tests**

Run: `pnpm test`

Expected: all pass

- [ ] **Step 3: Manual smoke (local)**

1. `pnpm dev` → `/admin/insights/new` (로그인 필요)
2. lg 폭: 좌 폼 / 우 Preview; 본문에 H2·목록·링크 입력 후 ~200ms 내 Preview 갱신
3. 공개 상세(`/ko/insights/...`) 본문과 타이포·링크 색이 같은지 눈으로 비교
4. 뷰포트 `< lg`: `작성`/`미리보기` 탭 전환; 기본 `작성`
5. 본문 비우면 「본문을 작성하면 여기에 표시됩니다」

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/insights/InsightForm.tsx
git commit -m "$(cat <<'EOF'
feat(admin): live InsightBody preview beside TipTap

EOF
)"
```

---

### Task 5: PR 준비

**Files:** none (git / gh only)

- [ ] **Step 1: Ensure branch is pushed and open PR**

Base: current feature branch (include the design-spec commit if not yet on remote).

```bash
git push -u origin HEAD
gh pr create --title "feat(admin): Insights 본문 실시간 Preview" --body "$(cat <<'EOF'
## Summary
- TipTap 본문을 ~200ms 디바운스 후 공개와 동일한 `InsightBody`로 미리보기
- lg+ 좌폼·우 Preview; 좁은 화면 작성/미리보기 탭
- 빈 본문 판별을 `isInsightBodyEmpty`로 공유

## Spec
- `docs/superpowers/specs/2026-07-30-insights-live-preview-design.md`

## Test plan
- [ ] `pnpm test`
- [ ] `/admin/insights/new` 데스크톱 분할 Preview
- [ ] 모바일 탭 전환
- [ ] 빈 본문 empty copy
- [ ] H2/목록/링크가 공개 본문과 동일 스타일

EOF
)"
```

---

## Spec coverage (self-review)

| Spec item | Task |
|-----------|------|
| lg 좌/우 분할, max-w-2xl 제거 | Task 4 |
| 모바일 작성/미리보기 탭 | Task 4 |
| 본문만 Preview | Task 2, 4 |
| 라벨·빈 상태·aria-live | Task 2 |
| `onHtmlChange` + 폼 디바운스 200ms | Task 3, 4 |
| `InsightBody` 재사용 / sanitize | Task 2 |
| 빈 HTML 단위 테스트 | Task 1 |
| 공개 페이지 미변경 | (no task touches it) |
| iframe/메타 Preview 비범위 | (omitted) |

No placeholders left after self-review.
