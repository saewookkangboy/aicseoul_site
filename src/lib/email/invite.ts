import { Resend } from "resend";

export async function sendAdminInviteEmail(args: {
  to: string;
  signupUrl: string;
  role: "superadmin" | "operator";
  expiresAt: Date;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[invite] RESEND_API_KEY missing — skipped");
    return { sent: false };
  }
  const from =
    process.env.RESEND_FROM ?? "AIC Seoul <onboarding@resend.dev>";
  const roleLabel = args.role === "superadmin" ? "SuperAdmin" : "운영진";
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: args.to,
      subject: `[AIC Seoul] Admin 초대 · ${roleLabel}`,
      text: [
        "AI Collective Seoul Admin 초대입니다.",
        `역할: ${roleLabel}`,
        `만료: ${args.expiresAt.toISOString()}`,
        "",
        `가입 링크: ${args.signupUrl}`,
        "",
        "본인이 요청하지 않았다면 이 메일을 무시하세요.",
      ].join("\n"),
    });
    return { sent: true };
  } catch (err) {
    console.error("[invite] Resend failed", err);
    return { sent: false };
  }
}
