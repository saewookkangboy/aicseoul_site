import type { Metadata } from "next";
import {
  HomeActivities,
  HomeFinalCta,
  HomeHero,
  HomePartner,
  HomePeopleTeaser,
  HomeReasons,
  HomeStats,
} from "@/components/home/sections";
import { getSiteSettingsMap } from "@/lib/queries/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description:
    "AI 시대, 좋은 질문은 대화에서 나옵니다. AIC 서울 챕터 공식 사이트.",
};

export default async function HomePage() {
  const settings = await getSiteSettingsMap();

  return (
    <>
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
