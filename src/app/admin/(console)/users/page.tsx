import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/ui";
import { InvitePanel } from "@/components/admin/InvitePanel";
import { UsersTable } from "@/components/admin/UsersTable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import type { ModulePerms } from "@/lib/user-permission-update";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    redirect("/admin");
  }

  const now = new Date();
  await prisma.adminInvite.updateMany({
    where: {
      status: "pending",
      expiresAt: { lt: now },
    },
    data: { status: "expired" },
  });

  const invites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      sendCount: true,
      lastSentAt: true,
      acceptedUserId: true,
    },
  });

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      memberId: true,
      member: { select: { id: true, nameKr: true, nameEn: true } },
      permPeople: true,
      permMeetups: true,
      permInsights: true,
      permContact: true,
      permSettings: true,
    },
  });

  const members = await prisma.member.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameKr: "asc" }],
    select: { id: true, nameKr: true, nameEn: true },
  });
  const linkedMemberIds = new Set(
    users.filter((u) => u.memberId).map((u) => u.memberId as string),
  );

  const acceptedInvites = await prisma.adminInvite.findMany({
    where: {
      status: "accepted",
      acceptedUserId: { in: users.map((u) => u.id) },
    },
    orderBy: { acceptedAt: "desc" },
    select: {
      acceptedUserId: true,
      permPeople: true,
      permMeetups: true,
      permInsights: true,
      permContact: true,
      permSettings: true,
    },
  });

  const invitePermsByUserId = new Map<string, ModulePerms>();
  for (const invite of acceptedInvites) {
    if (!invite.acceptedUserId || invitePermsByUserId.has(invite.acceptedUserId)) {
      continue;
    }
    invitePermsByUserId.set(invite.acceptedUserId, {
      permPeople: invite.permPeople,
      permMeetups: invite.permMeetups,
      permInsights: invite.permInsights,
      permContact: invite.permContact,
      permSettings: invite.permSettings,
    });
  }

  const usersWithInvitePerms = users.map((user) => ({
    ...user,
    invitePerms: invitePermsByUserId.get(user.id) ?? null,
  }));

  const inviteRows = invites.map((invite) => ({
    ...invite,
    expiresAt: invite.expiresAt.toISOString(),
    lastSentAt: invite.lastSentAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="사용자·권한"
        description="SuperAdmin(최대 3명, 최소 1명)만 접근합니다. 이메일 초대, pending 승인, 모듈 권한, SuperAdmin 승격·강등이 가능합니다. 본인 역할은 변경할 수 없습니다. 역할이 바뀐 사용자는 재로그인 후 권한이 반영됩니다."
      />
      <InvitePanel invites={inviteRows} />
      <UsersTable
        users={usersWithInvitePerms}
        currentUserId={session.user.id}
        members={members}
        linkedMemberIds={[...linkedMemberIds]}
      />
    </div>
  );
}
