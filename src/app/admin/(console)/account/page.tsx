import { AccountForms } from "@/components/admin/AccountForms";
import { AdminPageHeader } from "@/components/admin/ui";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      member: {
        select: {
          nameKr: true,
          nameEn: true,
          bio: true,
          photoUrl: true,
          photoAssetId: true,
          linkedinUrl: true,
          websiteUrl: true,
        },
      },
    },
  });
  if (!user) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="내 계정"
        description="표시 이름·비밀번호와 연결된 People 소개를 관리합니다."
      />
      <AccountForms
        email={user.email}
        name={user.name}
        member={user.member}
      />
    </div>
  );
}
