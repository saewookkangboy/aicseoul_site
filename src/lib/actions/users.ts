"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import { planUserPermissionUpdate } from "@/lib/user-permission-update";

export async function approveUser(userId: string) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const superCount = await prisma.user.count({ where: { role: "superadmin" } });
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");

  if (target.role === "superadmin" && superCount >= 3) {
    // already superadmin — just activate
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "active" },
  });

  revalidatePath("/admin/users");
}

export async function disableUser(userId: string) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }
  if (session.user.id === userId) {
    throw new Error("Cannot disable yourself");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "disabled" },
  });

  revalidatePath("/admin/users");
}

export async function updateUserPermissions(
  userId: string,
  perms: {
    permPeople: boolean;
    permMeetups: boolean;
    permInsights: boolean;
    permContact: boolean;
    permSettings: boolean;
    promoteSuperadmin?: boolean;
    demoteSuperadmin?: boolean;
  },
) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");

  const superadminCount = await prisma.user.count({
    where: { role: "superadmin" },
  });

  const planned = planUserPermissionUpdate({
    actorId: session.user.id,
    targetId: userId,
    targetRole: target.role,
    targetStatus: target.status,
    superadminCount,
    perms,
  });

  if (!planned.ok) {
    throw new Error(planned.error);
  }

  await prisma.user.update({
    where: { id: userId },
    data: planned.data,
  });

  revalidatePath("/admin/users");
}
