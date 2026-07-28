import { AdminNav } from "@/components/admin/AdminNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <div className="flex min-h-[100dvh] bg-[var(--color-stone)]">
      <AdminNav user={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
