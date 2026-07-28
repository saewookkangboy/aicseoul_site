import Link from "next/link";
import {
  AdminBadge,
  AdminEmpty,
  AdminFilterChip,
  AdminPageHeader,
  btnSecondaryClass,
} from "@/components/admin/ui";
import { requireModule } from "@/lib/admin";
import { formatDateKo } from "@/lib/format-date";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<{ type?: string; status?: string }>;
};

function statusTone(status: "new" | "seen" | "done") {
  switch (status) {
    case "new":
      return "accent" as const;
    case "seen":
      return "warn" as const;
    case "done":
      return "success" as const;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export default async function AdminContactPage({ searchParams }: Props) {
  await requireModule("contact");
  const params = await searchParams;
  const where = {
    ...(params.type
      ? {
          type: params.type as
            | "partnership"
            | "education"
            | "community"
            | "other",
        }
      : {}),
    ...(params.status
      ? { status: params.status as "new" | "seen" | "done" }
      : {}),
  };

  const items = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const exportQs = new URLSearchParams();
  if (params.type) exportQs.set("type", params.type);
  if (params.status) exportQs.set("status", params.status);
  const exportHref = `/api/admin/contact/export${
    exportQs.toString() ? `?${exportQs.toString()}` : ""
  }`;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="문의함"
        description="유형·상태 필터 · Resend 알림(키 있을 때) · CSV 내보내기"
        actions={
          <a href={exportHref} className={btnSecondaryClass}>
            CSV 내보내기
          </a>
        }
      />
      <div className="flex flex-wrap gap-2">
        <AdminFilterChip
          href="/admin/contact"
          label="전체"
          active={!params.type && !params.status}
        />
        <AdminFilterChip
          href="/admin/contact?status=new"
          label="신규"
          active={params.status === "new"}
        />
        <AdminFilterChip
          href="/admin/contact?type=partnership"
          label="협업·후원"
          active={params.type === "partnership"}
        />
        <AdminFilterChip
          href="/admin/contact?type=education"
          label="교육"
          active={params.type === "education"}
        />
        <AdminFilterChip
          href="/admin/contact?type=community"
          label="커뮤니티"
          active={params.type === "community"}
        />
      </div>
      {items.length > 0 ? (
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/contact/${item.id}`}
                className="block px-5 py-4 transition-colors hover:bg-[var(--color-cream)]/45"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone="gold">{item.type}</AdminBadge>
                  <AdminBadge tone={statusTone(item.status)}>
                    {item.status}
                  </AdminBadge>
                </div>
                <p className="mt-2 font-medium">
                  {item.name}
                  {item.org ? ` · ${item.org}` : ""}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-[var(--color-ink-muted)]">
                  {item.message}
                </p>
                <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                  {formatDateKo(item.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <AdminEmpty
          title="문의가 없습니다"
          description="필터를 바꾸거나 새 문의를 기다려 주세요."
        />
      )}
    </div>
  );
}
