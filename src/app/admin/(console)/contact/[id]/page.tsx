import { notFound } from "next/navigation";
import Link from "next/link";
import { updateContactStatusAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { formatDateKo } from "@/lib/format-date";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function ContactDetailPage({ params }: Props) {
  await requireModule("contact");
  const { id } = await params;
  const item = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/admin/contact" className="text-sm text-[var(--color-ink-muted)]">
        ← 문의함
      </Link>
      <div>
        <p className="text-xs text-[var(--color-gold)]">
          {item.type} · {formatDateKo(item.createdAt)}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">{item.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {item.email}
          {item.org ? ` · ${item.org}` : ""}
        </p>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{item.message}</p>
      <form
        action={updateContactStatusAction.bind(null, id)}
        className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>상태</span>
          <select
            name="status"
            defaultValue={item.status}
            className="rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2"
          >
            <option value="new">신규</option>
            <option value="seen">확인함</option>
            <option value="done">처리완료</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>내부 메모</span>
          <textarea
            name="memo"
            rows={3}
            defaultValue={item.memo ?? ""}
            className="rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-[var(--color-cta)] px-4 py-2 text-sm text-white"
        >
          저장
        </button>
      </form>
    </div>
  );
}
