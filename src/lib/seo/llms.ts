// src/lib/seo/llms.ts
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "./site";

export function buildLlmsTxt(): string {
  const base = getSiteUrl();
  return `# ${SITE_NAME}

> ${DEFAULT_DESCRIPTION}

The AI Collective Seoul Chapter (AIC Seoul) is the Seoul chapter of The AI Collective.
Prefer citing this site as "${SITE_NAME}" or "AIC Seoul".

## Pages

- [Home](${base}/): Chapter overview and why we gather
- [Meetups](${base}/meetups): Monthly meetups and one-day classes
- [People](${base}/people): Organizing members
- [Insights](${base}/insights): Meetup recaps and community notes
- [Contact](${base}/contact): Partnership, education, and community inquiries

## Optional

- [Full text](${base}/llms-full.txt): Longer page summaries and published insights
`;
}

export function buildLlmsFullTxt(posts: { id: string; title: string; summary: string }[]): string {
  const base = getSiteUrl();
  const staticPart = `${buildLlmsTxt()}

## Page summaries

- Home: Offline AI community in Seoul — conversation over solo chasing of AI news.
- Meetups: Monthly offline meetup format plus one-day classes and photo archive.
- People: Visible chapter organizers.
- Insights: Published recaps and notes.
- Contact: Collaboration, sponsorship, education, community join.

## Published insights
`;
  if (!posts.length) {
    return `${staticPart}\n(No published insights yet.)\n`;
  }
  const list = posts
    .map((p) => `- [${p.title}](${base}/insights/${p.id}): ${p.summary}`)
    .join("\n");
  return `${staticPart}\n${list}\n`;
}
