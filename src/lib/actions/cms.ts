"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertModule, requireModule } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  optionalMediaUrlSchema,
  resolveMemberPhotoFields,
} from "@/lib/media/media-guard";
import {
  DEFAULT_PEOPLE_INTRO,
  PEOPLE_INTRO_SETTING_KEY,
  serializePeopleIntro,
  type PeopleIntroCopy,
} from "@/lib/people/intro";

const memberSchema = z.object({
  nameKr: z.string().trim().min(1).max(40),
  nameEn: z.string().trim().min(1).max(80),
  bio: z.string().trim().min(1).max(80),
  photoUrl: optionalMediaUrlSchema,
  photoAssetId: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isVisible: z.coerce.boolean().optional(),
  isFounder: z.coerce.boolean().optional(),
});

function emptyToUndef(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

export async function createMemberAction(formData: FormData) {
  const user = await requireModule("people");
  assertModule(user, "people");

  const parsed = memberSchema.safeParse({
    nameKr: formData.get("nameKr"),
    nameEn: formData.get("nameEn"),
    bio: formData.get("bio"),
    photoUrl: emptyToUndef(formData.get("photoUrl")),
    photoAssetId: emptyToUndef(formData.get("photoAssetId")),
    linkedinUrl: emptyToUndef(formData.get("linkedinUrl")) ?? "",
    websiteUrl: emptyToUndef(formData.get("websiteUrl")) ?? "",
    isVisible: formData.get("isVisible") === "on",
    isFounder: formData.get("isFounder") === "on",
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  const photo = await resolveMemberPhotoFields({
    photoUrl: parsed.data.photoUrl,
    photoAssetId: parsed.data.photoAssetId,
  });

  const max = await prisma.member.aggregate({ _max: { sortOrder: true } });
  await prisma.member.create({
    data: {
      nameKr: parsed.data.nameKr,
      nameEn: parsed.data.nameEn,
      bio: parsed.data.bio,
      photoUrl: photo.photoUrl,
      photoAssetId: photo.photoAssetId,
      linkedinUrl: parsed.data.linkedinUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      isVisible: parsed.data.isVisible ?? true,
      isFounder: parsed.data.isFounder ?? false,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath("/admin/people");
  revalidatePath("/people");
  redirect("/admin/people");
}

export async function updateMemberAction(id: string, formData: FormData) {
  const user = await requireModule("people");
  assertModule(user, "people");

  const parsed = memberSchema.safeParse({
    nameKr: formData.get("nameKr"),
    nameEn: formData.get("nameEn"),
    bio: formData.get("bio"),
    photoUrl: emptyToUndef(formData.get("photoUrl")),
    photoAssetId: emptyToUndef(formData.get("photoAssetId")),
    linkedinUrl: emptyToUndef(formData.get("linkedinUrl")) ?? "",
    websiteUrl: emptyToUndef(formData.get("websiteUrl")) ?? "",
    isVisible: formData.get("isVisible") === "on",
    isFounder: formData.get("isFounder") === "on",
  });
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  const photo = await resolveMemberPhotoFields({
    photoUrl: parsed.data.photoUrl,
    photoAssetId: parsed.data.photoAssetId,
  });

  await prisma.member.update({
    where: { id },
    data: {
      nameKr: parsed.data.nameKr,
      nameEn: parsed.data.nameEn,
      bio: parsed.data.bio,
      photoUrl: photo.photoUrl,
      photoAssetId: photo.photoAssetId,
      linkedinUrl: parsed.data.linkedinUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      isVisible: parsed.data.isVisible ?? true,
      isFounder: parsed.data.isFounder ?? false,
    },
  });
  revalidatePath("/admin/people");
  revalidatePath("/people");
  redirect("/admin/people");
}

export async function deleteMemberAction(id: string) {
  await requireModule("people");
  await prisma.member.delete({ where: { id } });
  revalidatePath("/admin/people");
  revalidatePath("/people");
  redirect("/admin/people");
}

export async function reorderMembersAction(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  assertModule(session.user, "people");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.member.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  revalidatePath("/admin/people");
  revalidatePath("/people");
}

export async function updateSettingsAction(formData: FormData) {
  await requireModule("settings");
  const keys = [
    "stats.members",
    "stats.cities",
    "stats.countries",
    "contact.email",
    "contact.sla",
    "social.linkedin",
    "social.openchat",
    "meetup.ctaUrl",
  ] as const;

  for (const key of keys) {
    const value = String(formData.get(key) ?? "").trim();
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/meetups");
  revalidatePath("/contact");
}

export async function updatePeopleIntroAction(formData: FormData) {
  await requireModule("people");

  const manifesto = String(formData.get("manifesto") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const roles = [0, 1, 2, 3].map((i) => ({
    title: String(formData.get(`roleTitle${i}`) ?? "").trim(),
    lead: String(formData.get(`roleLead${i}`) ?? "").trim(),
    body: String(formData.get(`roleBody${i}`) ?? "").trim(),
  }));

  if (
    manifesto.length === 0 ||
    roles.some((r) => !r.title || !r.lead || !r.body)
  ) {
    throw new Error("소개 카피 입력을 확인해 주세요.");
  }

  const copy: PeopleIntroCopy = {
    manifesto,
    roles,
    bridge:
      String(formData.get("bridge") ?? "").trim() ||
      DEFAULT_PEOPLE_INTRO.bridge,
    closing:
      String(formData.get("closing") ?? "").trim() ||
      DEFAULT_PEOPLE_INTRO.closing,
  };

  const value = serializePeopleIntro(copy);
  await prisma.siteSetting.upsert({
    where: { key: PEOPLE_INTRO_SETTING_KEY },
    create: { key: PEOPLE_INTRO_SETTING_KEY, value },
    update: { value },
  });

  revalidatePath("/admin/people");
  revalidatePath("/people");
}
