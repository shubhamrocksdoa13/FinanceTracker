import { prisma } from "@/lib/prisma";
import type { Category } from "@/generated/prisma/client";

export type CategoryWithSubs = Category & { subcategories: Category[] };

/** Active (non-archived) categories as a two-level tree, for pickers. */
export async function getActiveCategoryTree(
  userId: string
): Promise<CategoryWithSubs[]> {
  const categories = await prisma.category.findMany({
    where: { userId, isArchived: false },
    orderBy: { name: "asc" },
  });

  const topLevel = categories.filter((c) => !c.parentCategoryId);
  return topLevel.map((parent) => ({
    ...parent,
    subcategories: categories.filter((c) => c.parentCategoryId === parent.id),
  }));
}

/** All categories (including archived) keyed by id, for displaying history. */
export async function getCategoryMap(userId: string) {
  const categories = await prisma.category.findMany({ where: { userId } });
  return new Map(categories.map((c) => [c.id, c]));
}
