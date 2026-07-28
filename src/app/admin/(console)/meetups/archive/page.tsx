import { ArchiveManager } from "@/components/admin/meetups/ArchiveManager";
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
        <Link href="/admin/meetups" className="text-sm text-[var(--color-ink-muted)]">
          ← Meetups
        </Link>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">사진벽</h1>
      </div>
      <ArchiveManager photos={photos} />
    </div>
  );
}
