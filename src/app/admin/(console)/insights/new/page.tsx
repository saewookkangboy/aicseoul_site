import { createInsightAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { InsightForm } from "@/components/admin/insights/InsightForm";

export default async function NewInsightPage() {
  await requireModule("insights");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium tracking-tight">글 작성</h1>
      <InsightForm action={createInsightAction} submitLabel="저장" />
    </div>
  );
}
