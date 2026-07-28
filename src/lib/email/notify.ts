import { Resend } from "resend";
import { prisma } from "@/lib/db";

function getNotifyEmails(fallback?: string | null): string[] {
  const fromEnv = (process.env.NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  if (fallback) return [fallback];
  return [];
}

export async function notifyNewContact(submission: {
  id: string;
  type: string;
  name: string;
  org: string | null;
  email: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[notify] RESEND_API_KEY missing — skipped", submission.id);
    return;
  }

  const contactEmail = await prisma.siteSetting.findUnique({
    where: { key: "contact.email" },
  });
  const to = getNotifyEmails(contactEmail?.value);
  if (to.length === 0) {
    console.info("[notify] no recipients — skipped", submission.id);
    return;
  }

  const from =
    process.env.RESEND_FROM ?? "AIC Seoul <onboarding@resend.dev>";
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const link = `${base}/admin/contact/${submission.id}`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `[AIC Seoul] 새 문의 · ${submission.type} · ${submission.name}`,
      text: [
        `유형: ${submission.type}`,
        `이름: ${submission.name}`,
        submission.org ? `소속: ${submission.org}` : null,
        `이메일: ${submission.email}`,
        "",
        submission.message,
        "",
        `Admin: ${link}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("[notify] Resend failed", err);
  }
}
