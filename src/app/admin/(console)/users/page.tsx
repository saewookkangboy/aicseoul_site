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
        description="SuperAdmin(최대 3명, 최소 1명)만 접근합니다. pending 승인, 모듈 권한, SuperAdmin 승격·강등이 가능합니다. 본인 역할은 변경할 수 없습니다. 역할이 바뀐 사용자는 재로그인 후 권한이 반영됩니다."
      />
      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
