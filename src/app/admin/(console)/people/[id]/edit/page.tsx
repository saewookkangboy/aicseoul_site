import { notFound } from "next/navigation";
import { deleteMemberAction, updateMemberAction } from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { MemberForm } from "@/components/admin/people/MemberForm";
import {
  AdminPageHeader,
  btnDangerGhostClass,
} from "@/components/admin/ui";

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
      <AdminPageHeader
        title="멤버 편집"
        description={member.nameKr}
        actions={
          <form action={remove}>
            <button type="submit" className={btnDangerGhostClass}>
              삭제
            </button>
          </form>
        }
      />
      <MemberForm action={update} initial={member} submitLabel="업데이트" />
    </div>
  );
}
