import Link from "next/link";
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">People</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            드래그로 노출 순서를 바꿉니다. 가나다순 자동정렬 없음.
          </p>
        </div>
        <Link
          href="/admin/people/new"
          className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-sm text-white"
        >
          멤버 추가
        </Link>
      </div>
      <PeopleSortableTable members={members} />
    </div>
  );
}
