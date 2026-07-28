import { createClassAction } from "@/lib/actions/meetups";
import { requireModule } from "@/lib/admin";
import { ClassForm } from "@/components/admin/meetups/ClassForm";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function NewClassPage() {
  await requireModule("meetups");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="클래스 추가"
        description="원데이 클래스 기록과 현장 사진을 등록합니다."
      />
      <ClassForm action={createClassAction} submitLabel="저장" />
    </div>
  );
}
