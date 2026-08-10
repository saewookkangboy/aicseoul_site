import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  btnPrimaryClass,
} from "@/components/admin/ui";
import { PeopleIntroForm } from "@/components/admin/people/PeopleIntroForm";
import { PeopleSortableTable } from "@/components/admin/people/PeopleSortableTable";
import {
  updatePeopleIntroAction,
} from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import {
  DEFAULT_PEOPLE_INTRO,
  PEOPLE_INTRO_SETTING_KEY,
  parsePeopleIntroJson,
} from "@/lib/people/intro";

export default async function AdminPeoplePage() {
  await requireModule("people");
  const [members, introSetting] = await Promise.all([
    prisma.member.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: PEOPLE_INTRO_SETTING_KEY },
    }),
  ]);

  const intro = parsePeopleIntroJson(introSetting?.value) ?? DEFAULT_PEOPLE_INTRO;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="People"
        description="소개 카피·멤버 목록. 드래그로 노출 순서를 바꿉니다."
        actions={
          <Link href="/admin/people/new" className={btnPrimaryClass}>
            멤버 추가
          </Link>
        }
      />

      <PeopleIntroForm action={updatePeopleIntroAction} initial={intro} />

      {members.length > 0 ? (
        <PeopleSortableTable members={members} />
      ) : (
        <AdminEmpty
          title="등록된 멤버가 없습니다"
          description="공개 People 페이지에 올릴 운영진을 추가하세요."
          action={
            <Link href="/admin/people/new" className={btnPrimaryClass}>
              멤버 추가
            </Link>
          }
        />
      )}
    </div>
  );
}
