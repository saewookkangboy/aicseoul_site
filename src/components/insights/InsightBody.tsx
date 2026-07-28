import ReactMarkdown from "react-markdown";
import { looksLikeHtml, sanitizeInsightHtml } from "@/lib/sanitize-html";

const proseClass =
  "prose-aic mt-8 space-y-4 text-base leading-relaxed [&_a]:text-[var(--color-gold)] [&_a]:underline-offset-2 hover:[&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-gold)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--color-ink-muted)] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_hr]:my-8 [&_hr]:border-[var(--color-border)] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:text-[var(--color-ink)] [&_ul]:list-disc [&_ul]:pl-5";

export function InsightBody({ body }: { body: string }) {
  if (looksLikeHtml(body)) {
    const clean = sanitizeInsightHtml(body);
    return (
      <div
        className={proseClass}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return (
    <div className={proseClass}>
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}
