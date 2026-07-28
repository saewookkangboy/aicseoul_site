import type { Metadata } from "next";
import { PeopleGrid } from "@/components/people/PeopleGrid";
import { getVisibleMembers } from "@/lib/queries/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People",
  description: "AIC 서울 챕터를 함께 만드는 사람들.",
};

export default async function PeoplePage() {
  const members = await getVisibleMembers();
  return <PeopleGrid members={members} />;
}
