import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { auth } from "@/lib/auth";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.status === "pending") redirect("/admin/pending");
  if (session.user.status !== "active") redirect("/admin/login");

  return (
    <div className="min-h-[100dvh] bg-[var(--color-stone)]">
      <AdminNav user={session.user} />
      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">{children}</div>
    </div>
  );
}
