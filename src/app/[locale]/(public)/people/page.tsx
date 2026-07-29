import { PeopleGrid } from "@/components/people/PeopleGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { translateCached } from "@/lib/i18n/translate";
import { getVisibleMembers } from "@/lib/queries/content";
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
    title: "People",
    description: t.seo.peopleDescription,
    path: localizedPath(locale, "/people"),
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function PeoplePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const members = await getVisibleMembers();

  const memo = new Map<string, Promise<string>>();
  const localizedMembers =
    locale === "en"
      ? await Promise.all(
          members.map(async (m) => ({
            ...m,
            bio: await translateCached(m.bio, locale, { memo }),
          })),
        )
      : members;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: localizedPath(locale, "/") },
          { name: "People", path: localizedPath(locale, "/people") },
        ])}
      />
      <PeopleGrid locale={locale} t={t.people} members={localizedMembers} />
    </>
  );
}
