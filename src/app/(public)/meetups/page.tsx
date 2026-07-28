import type { Metadata } from "next";
import {
  ClassHighlight,
  MeetupsIntro,
  MonthlyFormat,
  PhotoWall,
} from "@/components/meetups/sections";
import {
  getArchivePhotos,
  getLatestClassMeetup,
  getSiteSettingsMap,
} from "@/lib/queries/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meetups",
  description: "AIC 서울 챕터의 정기 모임과 원데이 클래스, 지난 순간의 기록.",
};

export default async function MeetupsPage() {
  const [settings, meetup, photos] = await Promise.all([
    getSiteSettingsMap(),
    getLatestClassMeetup(),
    getArchivePhotos(),
  ]);

  return (
    <>
      <MeetupsIntro />
      <MonthlyFormat ctaUrl={settings["meetup.ctaUrl"] ?? "/contact"} />
      <ClassHighlight meetup={meetup} />
      <PhotoWall photos={photos} />
    </>
  );
}
