"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertModule, requireModule } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  assertAllowedMediaUrls,
  optionalMediaUrlSchema,
} from "@/lib/media/media-guard";

function emptyToUndef(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

const classSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().min(1),
  headcount: z.coerce.number().int().positive().optional().or(z.nan()),
  summary: z.string().trim().max(2000).optional(),
  quote1: z.string().trim().max(500).optional(),
  quote2: z.string().trim().max(500).optional(),
  status: z.enum(["draft", "published"]),
  photo1: optionalMediaUrlSchema,
  photo2: optionalMediaUrlSchema,
  photo3: optionalMediaUrlSchema,
});

export async function updateMeetupCtaAction(formData: FormData) {
  await requireModule("meetups");
  const value = String(formData.get("meetup.ctaUrl") ?? "").trim() || "/contact";
  await prisma.siteSetting.upsert({
    where: { key: "meetup.ctaUrl" },
    create: { key: "meetup.ctaUrl", value },
    update: { value },
  });
  revalidatePath("/admin/meetups");
  revalidatePath("/meetups");
}

export async function createClassAction(formData: FormData) {
  await requireModule("meetups");
  const parsed = classSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    headcount: formData.get("headcount") || undefined,
    summary: emptyToUndef(formData.get("summary")),
    quote1: emptyToUndef(formData.get("quote1")),
    quote2: emptyToUndef(formData.get("quote2")),
    status: formData.get("status") || "draft",
    photo1: emptyToUndef(formData.get("photo1")),
    photo2: emptyToUndef(formData.get("photo2")),
    photo3: emptyToUndef(formData.get("photo3")),
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  const testimonials = [parsed.data.quote1, parsed.data.quote2].filter(
    (q): q is string => Boolean(q),
  );
  const photos = [parsed.data.photo1, parsed.data.photo2, parsed.data.photo3].filter(
    (p): p is string => Boolean(p),
  );

  await prisma.meetup.create({
    data: {
      type: "class",
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      headcount: Number.isFinite(parsed.data.headcount)
        ? (parsed.data.headcount as number)
        : null,
      summary: parsed.data.summary,
      testimonials,
      status: parsed.data.status,
      photos: {
        create: photos.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
      },
    },
  });
  revalidatePath("/admin/meetups");
  revalidatePath("/meetups");
  redirect("/admin/meetups");
}

export async function updateClassAction(id: string, formData: FormData) {
  await requireModule("meetups");
  const parsed = classSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    headcount: formData.get("headcount") || undefined,
    summary: emptyToUndef(formData.get("summary")),
    quote1: emptyToUndef(formData.get("quote1")),
    quote2: emptyToUndef(formData.get("quote2")),
    status: formData.get("status") || "draft",
    photo1: emptyToUndef(formData.get("photo1")),
    photo2: emptyToUndef(formData.get("photo2")),
    photo3: emptyToUndef(formData.get("photo3")),
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  const testimonials = [parsed.data.quote1, parsed.data.quote2].filter(
    (q): q is string => Boolean(q),
  );
  const photos = [parsed.data.photo1, parsed.data.photo2, parsed.data.photo3].filter(
    (p): p is string => Boolean(p),
  );

  await prisma.$transaction([
    prisma.meetupPhoto.deleteMany({ where: { meetupId: id } }),
    prisma.meetup.update({
      where: { id },
      data: {
        title: parsed.data.title,
        date: new Date(parsed.data.date),
        headcount: Number.isFinite(parsed.data.headcount)
          ? (parsed.data.headcount as number)
          : null,
        summary: parsed.data.summary,
        testimonials,
        status: parsed.data.status,
        photos: {
          create: photos.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
        },
      },
    }),
  ]);
  revalidatePath("/admin/meetups");
  revalidatePath("/meetups");
  redirect("/admin/meetups");
}

export async function deleteClassAction(id: string) {
  await requireModule("meetups");
  await prisma.meetup.delete({ where: { id } });
  revalidatePath("/admin/meetups");
  revalidatePath("/meetups");
}

export async function addArchivePhotosAction(urls: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  assertModule(session.user, "meetups");
  if (urls.length === 0) return;
  assertAllowedMediaUrls(urls);
  await prisma.archivePhoto.createMany({
    data: urls.map((imageUrl) => ({ imageUrl })),
  });
  revalidatePath("/admin/meetups/archive");
  revalidatePath("/meetups");
}

export async function deleteArchivePhotoAction(id: string) {
  await requireModule("meetups");
  await prisma.archivePhoto.delete({ where: { id } });
  revalidatePath("/admin/meetups/archive");
  revalidatePath("/meetups");
}
