import { notFound } from "next/navigation";
import { deleteMemberAction, updateMemberAction } from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { MemberForm } from "@/components/admin/people/MemberForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditMemberPage({ params }: Props) {
  await requireModule("people");
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  const update = updateMemberAction.bind(null, id);
  const remove = deleteMemberAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium tracking-tight">멤버 편집</h1>
      <MemberForm action={update} initial={member} submitLabel="업데이트" />
      <form action={remove}>
        <button type="submit" className="text-sm text-[var(--color-ink-muted)] underline">
          삭제
        </button>
      </form>
    </div>
  );
}
