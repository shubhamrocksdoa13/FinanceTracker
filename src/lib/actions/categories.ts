"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/category";

export type CategoryActionState = { error?: string } | undefined;

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    parentCategoryId: formData.get("parentCategoryId") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, type, parentCategoryId } = parsed.data;

  if (parentCategoryId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentCategoryId, userId },
    });
    if (!parent) return { error: "Invalid parent category" };
  }

  const existing = await prisma.category.findFirst({
    where: {
      userId,
      parentCategoryId: parentCategoryId ?? null,
      name: { equals: name, mode: "insensitive" },
    },
  });
  if (existing) return { error: "A category with this name already exists" };

  await prisma.category.create({
    data: { userId, name, type, parentCategoryId: parentCategoryId ?? null },
  });

  revalidatePath("/", "layout");
}
