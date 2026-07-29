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
import { getAdminSignupInviteCode } from "@/lib/admin-signup";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  inviteCode: z.string().trim().max(120).optional(),
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
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해 주세요. 비밀번호는 8자 이상입니다." };
  }

  const requiredInvite = getAdminSignupInviteCode();
  if (requiredInvite) {
    if (parsed.data.inviteCode !== requiredInvite) {
      return { error: "초대 코드가 올바르지 않습니다." };
    }
  }

  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const signupLimited = checkRateLimit(
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

  const superEmails = parseSuperAdminEmails(process.env.SUPERADMIN_EMAILS);
  const isListedSuper = superEmails.includes(email);
  const passwordHash = await hash(parsed.data.password, 12);

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
  const loginLimited = checkRateLimit(
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

  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
