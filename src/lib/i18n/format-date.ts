import type { Locale } from "./config";

export function formatDate(
  locale: Locale,
  date: Date | string | null | undefined,
) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const tag = locale === "en" ? "en-US" : "ko-KR";
  const formatted = new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  if (locale === "ko") {
    return formatted.replace(/\. /g, ".").replace(/\.$/, "");
  }
  return formatted;
}
