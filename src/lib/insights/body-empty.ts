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
