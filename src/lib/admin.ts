import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  canAccessModule,
  isSuperAdmin,
  type PermissionModule,
  type SessionUser,
} from "@/lib/permissions";

export async function requireAdminSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.status === "pending") redirect("/admin/pending");
  if (session.user.status !== "active") redirect("/admin/login");
  return session.user;
}

export async function requireModule(module: PermissionModule): Promise<SessionUser> {
  const user = await requireAdminSession();
  if (!canAccessModule(user, module)) {
    redirect("/admin");
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAdminSession();
  if (!isSuperAdmin(user)) redirect("/admin");
  return user;
}

export function assertModule(user: SessionUser, module: PermissionModule) {
  if (!canAccessModule(user, module)) {
    throw new Error("Forbidden");
  }
}
