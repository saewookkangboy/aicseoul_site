import {
  ClassHighlight,
  MeetupsIntro,
  MonthlyFormat,
  PhotoWall,
} from "@/components/meetups/sections";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getArchivePhotos,
  getLatestClassMeetup,
  getSiteSettingsMap,
} from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Meetups",
  description: "AIC 서울 챕터의 정기 모임과 원데이 클래스, 지난 순간의 기록.",
  path: "/meetups",
});

export default async function MeetupsPage() {
  const [settings, meetup, photos] = await Promise.all([
    getSiteSettingsMap(),
    getLatestClassMeetup(),
    getArchivePhotos(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Meetups", path: "/meetups" },
        ])}
      />
      <MeetupsIntro />
      <MonthlyFormat ctaUrl={settings["meetup.ctaUrl"] ?? "/contact"} />
      <ClassHighlight meetup={meetup} />
      <PhotoWall photos={photos} />
    </>
  );
}
