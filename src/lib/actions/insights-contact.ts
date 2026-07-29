"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { looksLikeHtml, sanitizeInsightHtml } from "@/lib/sanitize-html";

function emptyToUndef(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

function normalizeInsightBody(body: string): string {
  return looksLikeHtml(body) ? sanitizeInsightHtml(body) : body;
}

const insightSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1),
  thumbnailUrl: z.string().optional(),
  author: z.string().trim().min(1).max(80),
  publishedAt: z.string().optional(),
  status: z.enum(["draft", "published"]),
  isFeatured: z.boolean(),
});

export async function createInsightAction(formData: FormData) {
  await requireModule("insights");
  const parsed = insightSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    thumbnailUrl: emptyToUndef(formData.get("thumbnailUrl")),
    author: formData.get("author") || "AIC Seoul",
    publishedAt: emptyToUndef(formData.get("publishedAt")),
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") === "on",
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  if (parsed.data.isFeatured) {
    await prisma.insightPost.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });
  }

  await prisma.insightPost.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      summary: parsed.data.summary,
      body: normalizeInsightBody(parsed.data.body),
      thumbnailUrl: parsed.data.thumbnailUrl,
      author: parsed.data.author,
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : parsed.data.status === "published"
          ? new Date()
          : null,
      status: parsed.data.status,
      isFeatured: parsed.data.isFeatured,
    },
  });
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  redirect("/admin/insights");
}

export async function updateInsightAction(id: string, formData: FormData) {
  await requireModule("insights");
  const parsed = insightSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    thumbnailUrl: emptyToUndef(formData.get("thumbnailUrl")),
    author: formData.get("author") || "AIC Seoul",
    publishedAt: emptyToUndef(formData.get("publishedAt")),
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") === "on",
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  if (parsed.data.isFeatured) {
    await prisma.insightPost.updateMany({
      where: { isFeatured: true, NOT: { id } },
      data: { isFeatured: false },
    });
  }

  await prisma.insightPost.update({
    where: { id },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      summary: parsed.data.summary,
      body: normalizeInsightBody(parsed.data.body),
      thumbnailUrl: parsed.data.thumbnailUrl,
      author: parsed.data.author,
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : parsed.data.status === "published"
          ? new Date()
          : null,
      status: parsed.data.status,
      isFeatured: parsed.data.isFeatured,
    },
  });
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  revalidatePath(`/insights/${id}`);
  redirect("/admin/insights");
}

export async function deleteInsightAction(id: string) {
  await requireModule("insights");
  await prisma.insightPost.delete({ where: { id } });
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
}

export async function updateContactStatusAction(
  id: string,
  formData: FormData,
) {
  await requireModule("contact");
  const status = String(formData.get("status") ?? "seen");
  const memo = String(formData.get("memo") ?? "");
  if (!["new", "seen", "done"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.contactSubmission.update({
    where: { id },
    data: {
      status: status as "new" | "seen" | "done",
      memo: memo || null,
    },
  });
  // P4: Resend email notification stub
  console.info("[contact] updated", id, status);
  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${id}`);
  revalidatePath("/admin");
}
