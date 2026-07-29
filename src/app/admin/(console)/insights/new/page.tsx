import { createInsightAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { InsightForm } from "@/components/admin/insights/InsightForm";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function NewInsightPage() {
  await requireModule("insights");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="글 작성"
        description="Featured는 발행 시 기존 Featured를 자동 해제합니다."
      />
      <InsightForm action={createInsightAction} submitLabel="저장" />
    </div>
  );
}
