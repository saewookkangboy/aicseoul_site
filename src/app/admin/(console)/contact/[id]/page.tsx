import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AdminBadge,
  AdminPageHeader,
  AdminPanel,
  btnGhostClass,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
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
      <Link href="/admin/contact" className={btnGhostClass}>
        ← 문의함
      </Link>
      <AdminPageHeader
        title={item.name}
        description={`${item.email}${item.org ? ` · ${item.org}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="gold">{item.type}</AdminBadge>
            <AdminBadge tone="neutral">{formatDateKo(item.createdAt)}</AdminBadge>
          </div>
        }
      />
      <AdminPanel>
        <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-ink)]">
          {item.message}
        </p>
      </AdminPanel>
      <AdminPanel title="처리">
        <form
          action={updateContactStatusAction.bind(null, id)}
          className="flex flex-col gap-4"
        >
          <label className={labelClass}>
            <span className={labelHintClass}>상태</span>
            <select
              name="status"
              defaultValue={item.status}
              className={fieldClass}
            >
              <option value="new">신규</option>
              <option value="seen">확인함</option>
              <option value="done">처리완료</option>
            </select>
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>내부 메모</span>
            <textarea
              name="memo"
              rows={3}
              defaultValue={item.memo ?? ""}
              className={fieldClass}
            />
          </label>
          <button type="submit" className={`${btnPrimaryClass} w-fit`}>
            저장
          </button>
        </form>
      </AdminPanel>
    </div>
  );
}
