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
          <div className="[&>div]:mt-0">
            <InsightBody body={html} />
          </div>
        )}
      </div>
    </div>
  );
}
