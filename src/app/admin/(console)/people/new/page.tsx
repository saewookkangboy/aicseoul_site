import { createMemberAction } from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { MemberForm } from "@/components/admin/people/MemberForm";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function NewMemberPage() {
  await requireModule("people");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="멤버 추가"
        description="공개 People 그리드에 표시될 프로필을 등록합니다."
      />
      <MemberForm action={createMemberAction} submitLabel="저장" />
    </div>
  );
}
