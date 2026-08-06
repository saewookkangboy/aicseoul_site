"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  assertLinkedMemberOwnership,
  planChangePassword,
  planUpdateAccountName,
} from "@/lib/account-plan";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

const memberSelfSchema = z.object({
  nameKr: z.string().trim().min(1).max(40),
  nameEn: z.string().trim().min(1).max(80),
  bio: z.string().trim().min(1).max(80),
  photoUrl: z.string().optional(),
  photoAssetId: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

function emptyToUndef(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

async function requireActiveSession() {
  const session = await auth();
  if (!session?.user || session.user.status !== "active") {
    return null;
  }
  return session.user;
}

export async function updateAccountProfile(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const planned = planUpdateAccountName({
    name: String(formData.get("name") ?? ""),
  });
  if (!planned.ok) return planned;

  await prisma.user.update({
    where: { id: user.id },
    data: { name: planned.name },
  });
  revalidatePath("/admin/account");
  return { ok: true as const };
}

export async function changePassword(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const limited = await checkRateLimit(
    `passwordChange:${ip}:${user.id}`,
    RATE.passwordChange.limit,
    RATE.passwordChange.windowMs,
  );
  if (!limited.ok) {
    return { ok: false as const, error: RATE_LIMIT_MESSAGE };
  }

  const planned = planChangePassword({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!planned.ok) return planned;

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row) return { ok: false as const, error: "사용자를 찾을 수 없습니다." };

  const current = String(formData.get("currentPassword") ?? "");
  const okCurrent = await compare(current, row.passwordHash);
  if (!okCurrent) {
    return { ok: false as const, error: "현재 비밀번호가 올바르지 않습니다." };
  }

  const passwordHash = await hash(planned.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  revalidatePath("/admin/account");
  return { ok: true as const };
}

export async function updateLinkedMemberProfile(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { memberId: true },
  });
  const owned = assertLinkedMemberOwnership({
    sessionUserId: user.id,
    userMemberId: dbUser?.memberId ?? null,
  });
  if (!owned.ok) return owned;

  const parsed = memberSelfSchema.safeParse({
    nameKr: formData.get("nameKr"),
    nameEn: formData.get("nameEn"),
    bio: formData.get("bio"),
    photoUrl: emptyToUndef(formData.get("photoUrl")),
    photoAssetId: emptyToUndef(formData.get("photoAssetId")),
    linkedinUrl: emptyToUndef(formData.get("linkedinUrl")) ?? "",
    websiteUrl: emptyToUndef(formData.get("websiteUrl")) ?? "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: "입력값을 확인해 주세요." };
  }

  await prisma.member.update({
    where: { id: owned.memberId },
    data: {
      nameKr: parsed.data.nameKr,
      nameEn: parsed.data.nameEn,
      bio: parsed.data.bio,
      photoUrl: parsed.data.photoUrl ?? null,
      photoAssetId: parsed.data.photoAssetId ?? null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
    },
  });
  revalidatePath("/admin/account");
  revalidatePath("/admin/people");
  return { ok: true as const };
}
