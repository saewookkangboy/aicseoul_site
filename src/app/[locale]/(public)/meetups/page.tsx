import {
  ClassHighlight,
  MeetupsIntro,
  MonthlyFormat,
  PhotoWall,
} from "@/components/meetups/sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { translateCached } from "@/lib/i18n/translate";
import {
  getArchivePhotos,
  getLatestClassMeetup,
  getSiteSettingsMap,
} from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getMessages(locale);
  return pageMetadata({
    title: "Meetups",
    description: t.seo.meetupsDescription,
    path: localizedPath(locale, "/meetups"),
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function MeetupsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const [settings, meetup, photos] = await Promise.all([
    getSiteSettingsMap(),
    getLatestClassMeetup(),
    getArchivePhotos(),
  ]);

  let meetupView = meetup;
  if (meetup && locale === "en") {
    const memo = new Map<string, Promise<string>>();
    const quotes = Array.isArray(meetup.testimonials)
      ? (meetup.testimonials as string[])
      : [];
    const [title, summary, ...translatedQuotes] = await Promise.all([
      translateCached(meetup.title, locale, { memo }),
      meetup.summary
        ? translateCached(meetup.summary, locale, { memo })
        : Promise.resolve(null),
      ...quotes.map((q) => translateCached(q, locale, { memo })),
    ]);
    meetupView = {
      ...meetup,
      title,
      summary,
      testimonials: translatedQuotes,
    };
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: localizedPath(locale, "/") },
          { name: "Meetups", path: localizedPath(locale, "/meetups") },
        ])}
      />
      <MeetupsIntro t={t.meetups} />
      <MonthlyFormat
        locale={locale}
        t={t.meetups}
        ctaUrl={settings["meetup.ctaUrl"] ?? "/contact"}
      />
      <ClassHighlight locale={locale} t={t.meetups} meetup={meetupView} />
      <PhotoWall t={t.meetups} photos={photos} />
    </>
  );
}
