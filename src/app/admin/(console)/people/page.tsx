import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  btnPrimaryClass,
} from "@/components/admin/ui";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { PeopleSortableTable } from "@/components/admin/people/PeopleSortableTable";

export default async function AdminPeoplePage() {
  await requireModule("people");
  const members = await prisma.member.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="People"
        description="드래그로 노출 순서를 바꿉니다. 가나다순 자동정렬 없음."
        actions={
          <Link href="/admin/people/new" className={btnPrimaryClass}>
            멤버 추가
          </Link>
        }
      />
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
