import { createClassAction } from "@/lib/actions/meetups";
import { requireModule } from "@/lib/admin";
import { ClassForm } from "@/components/admin/meetups/ClassForm";

export default async function NewClassPage() {
  await requireModule("meetups");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium tracking-tight">클래스 추가</h1>
      <ClassForm action={createClassAction} submitLabel="저장" />
    </div>
  );
}
