import "dotenv/config";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  DEFAULT_PEOPLE_INTRO,
  PEOPLE_INTRO_SETTING_KEY,
  serializePeopleIntro,
} from "../src/lib/people/intro";
import { assertStrongSeedPassword } from "../src/lib/security/weak-seed";

/**
 * Production seed: SuperAdmin + SiteSettings only.
 * Do NOT seed demo People/Insights — load Tier A via Admin after deploy.
 */
const prisma = new PrismaClient();

const PLACEHOLDER_EMAIL =
  process.env.CONTACT_EMAIL_PLACEHOLDER ?? "hello@aic-seoul.example";

async function main() {
  const settings: { key: string; value: string }[] = [
    { key: "stats.members", value: process.env.SEED_STATS_MEMBERS ?? "250K+" },
    { key: "stats.cities", value: process.env.SEED_STATS_CITIES ?? "200+" },
    { key: "stats.countries", value: process.env.SEED_STATS_COUNTRIES ?? "50+" },
    { key: "contact.email", value: PLACEHOLDER_EMAIL },
    { key: "contact.sla", value: process.env.SEED_CONTACT_SLA ?? "3~5일" },
    {
      key: "social.linkedin",
      value:
        process.env.SEED_LINKEDIN_URL ??
        "https://www.linkedin.com/company/117154975",
    },
    {
      key: "social.openchat",
      value: process.env.SEED_OPENCHAT_URL ?? "https://open.kakao.com/o/gR2bJLdi",
    },
    {
      key: PEOPLE_INTRO_SETTING_KEY,
      value: serializePeopleIntro(DEFAULT_PEOPLE_INTRO),
    },
    { key: "meetup.ctaUrl", value: process.env.SEED_MEETUP_CTA ?? "/contact" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }

  const emails = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);

  if (emails.length === 0) {
    throw new Error("SUPERADMIN_EMAILS is required for production seed");
  }

  const defaultPassword = process.env.SUPERADMIN_SEED_PASSWORD;
  if (!defaultPassword) {
    throw new Error("SUPERADMIN_SEED_PASSWORD is required");
  }
  assertStrongSeedPassword(defaultPassword);

  const passwordHash = await hash(defaultPassword, 12);

  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        name: "Super Admin",
        role: UserRole.superadmin,
        status: UserStatus.active,
        permPeople: true,
        permMeetups: true,
        permInsights: true,
        permContact: true,
        permSettings: true,
      },
      update: {
        role: UserRole.superadmin,
        status: UserStatus.active,
        permPeople: true,
        permMeetups: true,
        permInsights: true,
        permContact: true,
        permSettings: true,
      },
    });
    console.log(`Production superadmin ready: ${email}`);
  }

  console.log("Production seed complete (settings + superadmins only).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
