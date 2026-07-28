import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessModule } from "@/lib/permissions";
import { prisma } from "@/lib/db";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAccessModule(session.user, "contact")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const where = {
    ...(type
      ? { type: type as "partnership" | "education" | "community" | "other" }
      : {}),
    ...(status ? { status: status as "new" | "seen" | "done" } : {}),
  };

  const items = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "createdAt",
    "type",
    "status",
    "name",
    "org",
    "email",
    "message",
  ];
  const rows = items.map((i) =>
    [
      i.createdAt.toISOString(),
      i.type,
      i.status,
      i.name,
      i.org ?? "",
      i.email,
      i.message,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );

  const body = `\uFEFF${[header.join(","), ...rows].join("\n")}`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aic-contacts.csv"`,
    },
  });
}
