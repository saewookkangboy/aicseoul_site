"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseSuperAdminEmails } from "@/lib/permissions";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  planAcceptInvite,
  planExpireInvite,
  planSuperadminSeatOnAccept,
} from "@/lib/admin-invite-plan";
import { hashInviteToken } from "@/lib/admin-invite-token";
import { getAdminSignupInviteCode } from "@/lib/admin-signup";
import { isProd } from "@/lib/env";
import { safeAdminCallbackUrl } from "@/lib/security/callback-url";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  inviteCode: z.string().trim().max(120).optional(),
  inviteToken: z.string().trim().min(1).max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export type AuthFormState = {
  error?: string;
  ok?: boolean;
};

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode") || undefined,
    inviteToken: formData.get("inviteToken") || undefined,
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해 주세요. 비밀번호는 8자 이상입니다." };
  }

  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const signupLimited = await checkRateLimit(
    `signup:${ip}`,
    RATE.signup.limit,
    RATE.signup.windowMs,
  );
  if (!signupLimited.ok) return { error: RATE_LIMIT_MESSAGE };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "이미 등록된 이메일입니다." };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  if (parsed.data.inviteToken) {
    const tokenHash = hashInviteToken(parsed.data.inviteToken);
    const invite = await prisma.adminInvite.findUnique({ where: { tokenHash } });
    if (!invite) {
      return { error: "유효하지 않은 초대입니다." };
    }

    const now = new Date();
    if (planExpireInvite(invite.status, invite.expiresAt, now).expire) {
      await prisma.adminInvite.update({
        where: { id: invite.id },
        data: { status: "expired" },
      });
      return { error: "초대가 만료되었습니다." };
    }

    const planned = planAcceptInvite({
      inviteStatus: invite.status,
      inviteEmail: invite.email,
      inviteRole: invite.role,
      expiresAt: invite.expiresAt,
      now,
      signupEmail: email,
      permsOnInvite: {
        permPeople: invite.permPeople,
        permMeetups: invite.permMeetups,
        permInsights: invite.permInsights,
        permContact: invite.permContact,
        permSettings: invite.permSettings,
      },
    });
    if (!planned.ok) {
      return { error: planned.error };
    }

    if (planned.user.role === "superadmin") {
      const superCount = await prisma.user.count({
        where: { role: "superadmin" },
      });
      const seatCheck = planSuperadminSeatOnAccept(superCount);
      if (!seatCheck.ok) {
        return { error: seatCheck.error };
      }
    }

    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name: parsed.data.name,
          passwordHash,
          ...planned.user,
        },
      });
      await tx.adminInvite.update({
        where: { id: invite.id },
        data: {
          status: "accepted",
          acceptedUserId: created.id,
          acceptedAt: now,
        },
      });
    });

    if (planned.user.role === "superadmin") {
      try {
        await signIn("credentials", {
          email,
          password: parsed.data.password,
          redirect: false,
        });
      } catch (error) {
        if (error instanceof AuthError) {
          return { error: "가입은 됐지만 로그인에 실패했습니다. 다시 로그인해 주세요." };
        }
        throw error;
      }
      redirect("/admin");
    }

    redirect("/admin/pending");
  }

  const requiredInvite = getAdminSignupInviteCode();
  // Fail-closed: in production, an unset invite code must NOT fall through to
  // open registration. Require the code to be configured before allowing signup.
  if (isProd && !requiredInvite) {
    return {
      error: "회원가입이 비활성화되어 있습니다. 관리자에게 문의하세요.",
    };
  }
  if (requiredInvite && parsed.data.inviteCode !== requiredInvite) {
    return { error: "초대 코드가 올바르지 않습니다." };
  }

  const superEmails = parseSuperAdminEmails(process.env.SUPERADMIN_EMAILS);
  const isListedSuper = superEmails.includes(email);

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: isListedSuper ? "superadmin" : "operator",
      status: isListedSuper ? "active" : "pending",
      permPeople: isListedSuper,
      permMeetups: isListedSuper,
      permInsights: isListedSuper,
      permContact: isListedSuper,
      permSettings: isListedSuper,
    },
  });

  if (isListedSuper) {
    try {
      await signIn("credentials", {
        email,
        password: parsed.data.password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: "가입은 됐지만 로그인에 실패했습니다. 다시 로그인해 주세요." };
      }
      throw error;
    }
    redirect("/admin");
  }

  redirect("/admin/pending");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "이메일과 비밀번호를 확인해 주세요." };
  }

  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const email = parsed.data.email.toLowerCase();
  const loginLimited = await checkRateLimit(
    `login:${ip}:${email}`,
    RATE.login.limit,
    RATE.login.windowMs,
  );
  if (!loginLimited.ok) return { error: RATE_LIMIT_MESSAGE };

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "로그인에 실패했습니다. 자격 증명을 확인해 주세요." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status === "disabled") {
    return { error: "비활성화된 계정입니다." };
  }

  if (user.status === "pending") {
    redirect("/admin/pending");
  }

  redirect(safeAdminCallbackUrl(formData.get("callbackUrl")));
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
