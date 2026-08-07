import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

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
      <header className="flex items-center justify-between gap-x-6 border-b border-black/10 px-4 py-4 sm:px-6 dark:border-white/10">
        <Link href="/" className="font-semibold">
          Wealth Tracker
        </Link>
        {/* Primary nav lives in the bottom tab bar on mobile; this row takes
            over from `sm` up, where there's no fixed bar. */}
        <nav className="hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:flex">
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
          <span className="text-foreground/40">{session.user.email}</span>
          <SignOutButton />
        </nav>
        <div className="sm:hidden">
          <SignOutButton />
        </div>
      </header>
      <main className="p-4 sm:p-6">
        {children}
        {/* Spacer so content clears the fixed mobile tab bar; disappears at
            `sm` alongside it. A plain height (not a Tailwind pb-* utility)
            so it can't be fought by `sm:p-6`'s cascade specificity. */}
        <div style={{ height: 72 }} className="sm:hidden" />
      </main>
      <MobileTabBar />
    </div>
  );
}
