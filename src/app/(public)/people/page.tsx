import { PeopleGrid } from "@/components/people/PeopleGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getVisibleMembers } from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "People",
  description: "AIC 서울 챕터를 함께 만드는 사람들.",
  path: "/people",
});

export default async function PeoplePage() {
  const members = await getVisibleMembers();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "People", path: "/people" },
        ])}
      />
      <PeopleGrid members={members} />
    </>
  );
}
