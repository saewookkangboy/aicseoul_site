"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import {
  canCreateSuperadminInvite,
  planExpireInvite,
} from "@/lib/admin-invite-plan";
import {
  generateInviteToken,
  hashInviteToken,
} from "@/lib/admin-invite-token";
import { sendAdminInviteEmail } from "@/lib/email/invite";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  role: z.enum(["superadmin", "operator"]),
  permPeople: z.boolean(),
  permMeetups: z.boolean(),
  permInsights: z.boolean(),
  permContact: z.boolean(),
  permSettings: z.boolean(),
});

function appBaseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

function signupUrlForToken(token: string): string {
  return `${appBaseUrl()}/admin/signup?token=${encodeURIComponent(token)}`;
}

async function requireSuper() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    return null;
  }
  return session.user;
}

export async function createInvite(raw: z.infer<typeof createSchema>) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "입력값을 확인해 주세요." };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false as const, error: "이미 등록된 이메일입니다." };
  }

  const pendingSame = await prisma.adminInvite.findFirst({
    where: { email, status: "pending" },
  });
  if (pendingSame) {
    return {
      ok: false as const,
      error: "이미 대기 중인 초대가 있습니다. 재발송을 사용하세요.",
    };
  }

  if (parsed.data.role === "superadmin") {
    const [superUsers, pendingSuper] = await Promise.all([
      prisma.user.count({ where: { role: "superadmin" } }),
      prisma.adminInvite.count({
        where: { role: "superadmin", status: "pending" },
      }),
    ]);
    if (!canCreateSuperadminInvite(superUsers, pendingSuper)) {
      return { ok: false as const, error: "SuperAdmin은 최대 3명입니다." };
    }
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);

  const perms =
    parsed.data.role === "superadmin"
      ? {
          permPeople: true,
          permMeetups: true,
          permInsights: true,
          permContact: true,
          permSettings: true,
        }
      : {
          permPeople: parsed.data.permPeople,
          permMeetups: parsed.data.permMeetups,
          permInsights: parsed.data.permInsights,
          permContact: parsed.data.permContact,
          permSettings: parsed.data.permSettings,
        };

  const invite = await prisma.adminInvite.create({
    data: {
      email,
      role: parsed.data.role,
      ...perms,
      tokenHash,
      status: "pending",
      expiresAt,
      invitedById: user.id,
      lastSentAt: now,
      sendCount: 1,
    },
  });

  const signupUrl = signupUrlForToken(token);
  const { sent } = await sendAdminInviteEmail({
    to: email,
    signupUrl,
    role: parsed.data.role,
    expiresAt,
  });

  revalidatePath("/admin/users");
  return {
    ok: true as const,
    inviteId: invite.id,
    signupUrl,
    emailSent: sent,
  };
}

export async function resendInvite(inviteId: string) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const invite = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return { ok: false as const, error: "초대를 찾을 수 없습니다." };

  const now = new Date();
  if (planExpireInvite(invite.status, invite.expiresAt, now).expire) {
    await prisma.adminInvite.update({
      where: { id: inviteId },
      data: { status: "expired" },
    });
    revalidatePath("/admin/users");
    return { ok: false as const, error: "만료된 초대입니다. 새로 초대하세요." };
  }
  if (invite.status !== "pending") {
    return { ok: false as const, error: "재발송할 수 없는 상태입니다." };
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  await prisma.adminInvite.update({
    where: { id: inviteId },
    data: {
      tokenHash,
      lastSentAt: now,
      sendCount: { increment: 1 },
    },
  });

  const signupUrl = signupUrlForToken(token);
  const { sent } = await sendAdminInviteEmail({
    to: invite.email,
    signupUrl,
    role: invite.role,
    expiresAt: invite.expiresAt,
  });

  revalidatePath("/admin/users");
  return { ok: true as const, signupUrl, emailSent: sent };
}

export async function cancelInvite(inviteId: string) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const invite = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return { ok: false as const, error: "초대를 찾을 수 없습니다." };
  if (invite.status !== "pending") {
    return { ok: false as const, error: "취소할 수 없는 상태입니다." };
  }

  await prisma.adminInvite.update({
    where: { id: inviteId },
    data: { status: "cancelled", cancelledAt: new Date() },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
