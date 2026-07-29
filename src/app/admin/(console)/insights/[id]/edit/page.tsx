import { notFound } from "next/navigation";
import { updateInsightAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { InsightForm } from "@/components/admin/insights/InsightForm";
import { AdminPageHeader } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }> };

export default async function EditInsightPage({ params }: Props) {
  await requireModule("insights");
  const { id } = await params;
  const post = await prisma.insightPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="글 편집" description={post.title} />
      <InsightForm
        action={updateInsightAction.bind(null, id)}
        submitLabel="업데이트"
        initial={{
          title: post.title,
          category: post.category,
          summary: post.summary,
          body: post.body,
          thumbnailUrl: post.thumbnailUrl,
          author: post.author,
          publishedAt: post.publishedAt
            ? post.publishedAt.toISOString().slice(0, 10)
            : undefined,
          status: post.status,
          isFeatured: post.isFeatured,
        }}
      />
    </div>
  );
}
