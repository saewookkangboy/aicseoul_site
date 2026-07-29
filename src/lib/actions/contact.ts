"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { notifyNewContact } from "@/lib/email/notify";
import { prisma } from "@/lib/db";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  type: z.enum(["partnership", "education", "community", "other"]),
  name: z.string().trim().min(1).max(80),
  org: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

export type ContactFormState = {
  error?: string;
  ok?: boolean;
};

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const limited = checkRateLimit(
    `contact:${ip}`,
    RATE.contact.limit,
    RATE.contact.windowMs,
  );
  if (!limited.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const website = String(formData.get("website") ?? "");
  if (website) {
    return { ok: true };
  }

  const parsed = schema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    org: formData.get("org") || undefined,
    email: formData.get("email"),
    message: formData.get("message"),
    website: "",
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해 주세요. 내용은 10자 이상이어야 합니다." };
  }

  const created = await prisma.contactSubmission.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name,
      org: parsed.data.org,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
    },
  });

  await notifyNewContact(created);

  return { ok: true };
}
