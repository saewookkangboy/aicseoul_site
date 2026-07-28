"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";

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
  },
) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");

  let role = target.role;
  if (perms.promoteSuperadmin && target.role !== "superadmin") {
    const count = await prisma.user.count({ where: { role: "superadmin" } });
    if (count >= 3) {
      throw new Error("SuperAdmin은 최대 3명입니다.");
    }
    role = "superadmin";
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      status: target.status === "pending" ? "active" : target.status,
      permPeople: role === "superadmin" ? true : perms.permPeople,
      permMeetups: role === "superadmin" ? true : perms.permMeetups,
      permInsights: role === "superadmin" ? true : perms.permInsights,
      permContact: role === "superadmin" ? true : perms.permContact,
      permSettings: role === "superadmin" ? true : perms.permSettings,
    },
  });

  revalidatePath("/admin/users");
}
