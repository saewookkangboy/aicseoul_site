import {
  HomeActivities,
  HomeFinalCta,
  HomeHero,
  HomePartner,
  HomePeopleTeaser,
  HomeReasons,
  HomeStats,
} from "@/components/home/sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: SITE_NAME,
  description:
    "AI 시대, 좋은 질문은 대화에서 나옵니다. AIC 서울 챕터 공식 사이트.",
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const settings = await getSiteSettingsMap();
  const linkedin = settings["social.linkedin"];

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(),
          organizationJsonLd({
            sameAs: linkedin ? [linkedin] : [],
          }),
        ]}
      />
      <HomeHero />
      <HomeStats
        members={settings["stats.members"] ?? "250K+"}
        cities={settings["stats.cities"] ?? "200+"}
        countries={settings["stats.countries"] ?? "50+"}
      />
      <HomeReasons />
      <HomeActivities />
      <HomePeopleTeaser />
      <HomePartner />
      <HomeFinalCta linkedin={settings["social.linkedin"]} />
    </>
  );
}
