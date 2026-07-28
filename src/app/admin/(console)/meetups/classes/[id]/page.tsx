import { notFound } from "next/navigation";
import { updateClassAction } from "@/lib/actions/meetups";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ClassForm } from "@/components/admin/meetups/ClassForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditClassPage({ params }: Props) {
  await requireModule("meetups");
  const { id } = await params;
  const meetup = await prisma.meetup.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!meetup || meetup.type !== "class") notFound();

  const quotes = Array.isArray(meetup.testimonials)
    ? (meetup.testimonials as string[])
    : [];
  const date = meetup.date.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium tracking-tight">클래스 편집</h1>
      <ClassForm
        action={updateClassAction.bind(null, id)}
        submitLabel="업데이트"
        initial={{
          title: meetup.title,
          date,
          headcount: meetup.headcount,
          summary: meetup.summary,
          quote1: quotes[0],
          quote2: quotes[1],
          status: meetup.status,
          photos: meetup.photos.map((p) => p.imageUrl),
        }}
      />
    </div>
  );
}
