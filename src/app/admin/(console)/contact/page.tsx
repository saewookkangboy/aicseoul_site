import Link from "next/link";
import { requireModule } from "@/lib/admin";
import { formatDateKo } from "@/lib/content/copy";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<{ type?: string; status?: string }>;
};

export default async function AdminContactPage({ searchParams }: Props) {
  await requireModule("contact");
  const params = await searchParams;
  const where = {
    ...(params.type
      ? { type: params.type as "partnership" | "education" | "community" | "other" }
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">문의함</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            유형·상태 필터 · Resend 알림(키 있을 때) · CSV 내보내기
          </p>
        </div>
        <a
          href={exportHref}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm"
        >
          CSV 내보내기
        </a>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip href="/admin/contact" label="전체" />
        <FilterChip href="/admin/contact?status=new" label="신규" />
        <FilterChip href="/admin/contact?type=partnership" label="협업·후원" />
        <FilterChip href="/admin/contact?type=education" label="교육" />
        <FilterChip href="/admin/contact?type=community" label="커뮤니티" />
      </div>
      <ul className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <Link href={`/admin/contact/${item.id}`} className="block">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--color-gold)]">{item.type}</span>
                <span className="text-xs text-[var(--color-ink-muted)]">
                  {item.status}
                </span>
              </div>
              <p className="mt-1 font-medium">
                {item.name}
                {item.org ? ` · ${item.org}` : ""}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-[var(--color-ink-muted)]">
                {item.message}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                {formatDateKo(item.createdAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1"
    >
      {label}
    </Link>
  );
}
