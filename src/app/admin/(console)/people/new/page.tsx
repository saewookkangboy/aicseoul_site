import { createMemberAction } from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { MemberForm } from "@/components/admin/people/MemberForm";

export default async function NewMemberPage() {
  await requireModule("people");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium tracking-tight">멤버 추가</h1>
      <MemberForm action={createMemberAction} submitLabel="저장" />
    </div>
  );
}
