import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/layout/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-black/10 px-4 py-4 sm:px-6 dark:border-white/10">
        <Link href="/" className="font-semibold">
          Wealth Tracker
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/" className="text-foreground/70 hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className="text-foreground/70 hover:text-foreground"
          >
            Transactions
          </Link>
          <Link
            href="/net-worth"
            className="text-foreground/70 hover:text-foreground"
          >
            Net Worth
          </Link>
          <Link
            href="/settings"
            className="text-foreground/70 hover:text-foreground"
          >
            Settings
          </Link>
          <span className="hidden text-foreground/40 sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </nav>
      </header>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
