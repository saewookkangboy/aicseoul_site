import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/ui";
import { UsersTable } from "@/components/admin/UsersTable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      permPeople: true,
      permMeetups: true,
      permInsights: true,
      permContact: true,
      permSettings: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="사용자·권한"
        description="SuperAdmin(최대 3명)만 접근합니다. pending 사용자를 승인하고 모듈 권한을 부여하세요."
      />
      <UsersTable users={users} />
    </div>
  );
}
