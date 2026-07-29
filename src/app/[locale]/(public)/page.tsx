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
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";
import { resolveChapterLinkedinUrl } from "@/lib/social/linkedin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getMessages(locale);
  return pageMetadata({
    title: SITE_NAME,
    description: t.seo.homeDescription,
    path: localizedPath(locale, "/"),
    absoluteTitle: true,
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const settings = await getSiteSettingsMap();
  const linkedin = resolveChapterLinkedinUrl(settings["social.linkedin"]);

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(),
          organizationJsonLd({
            sameAs: [linkedin],
          }),
        ]}
      />
      <HomeHero locale={locale} t={t.home} />
      <HomeStats
        locale={locale}
        t={t.home}
        members={settings["stats.members"] ?? "250K+"}
        cities={settings["stats.cities"] ?? "200+"}
        countries={settings["stats.countries"] ?? "50+"}
      />
      <HomeReasons locale={locale} t={t.home} />
      <HomeActivities locale={locale} t={t.home} />
      <HomePeopleTeaser locale={locale} t={t.home} />
      <HomePartner locale={locale} t={t.home} />
      <HomeFinalCta locale={locale} t={t.home} linkedin={linkedin} />
    </>
  );
}
