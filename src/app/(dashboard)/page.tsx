import { auth } from "@/auth";
import { getActiveCategoryTree } from "@/lib/data/categories";
import { QuickAddForm } from "@/components/transactions/QuickAddForm";

export default async function DashboardPage() {
  const session = await auth();
  const categories = await getActiveCategoryTree(session!.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-2 text-foreground/60">
          Your dashboard will appear here.
        </p>
      </div>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-medium text-foreground/70">
          Quick Add
        </h2>
        <QuickAddForm categories={categories} />
      </div>
    </div>
  );
}
