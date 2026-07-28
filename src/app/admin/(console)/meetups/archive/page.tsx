import { ArchiveManager } from "@/components/admin/meetups/ArchiveManager";
import {
  AdminPageHeader,
  btnGhostClass,
} from "@/components/admin/ui";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ArchiveAdminPage() {
  await requireModule("meetups");
  const photos = await prisma.archivePhoto.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/meetups" className={btnGhostClass}>
          ← Meetups
        </Link>
        <div className="mt-4">
          <AdminPageHeader
            title="사진벽"
            description="Meetup 아카이브에 노출되는 현장 사진입니다."
          />
        </div>
      </div>
      <ArchiveManager photos={photos} />
    </div>
  );
}
