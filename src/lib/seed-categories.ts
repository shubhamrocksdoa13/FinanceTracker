import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type DefaultCategory = {
  name: string;
  type: "INCOME" | "EXPENSE";
  subcategories?: { name: string; type: "INCOME" | "EXPENSE" }[];
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: "Food",
    type: "EXPENSE",
    subcategories: [
      { name: "Food – House", type: "EXPENSE" },
      { name: "Food – Outside", type: "EXPENSE" },
    ],
  },
  {
    name: "Housing",
    type: "EXPENSE",
    subcategories: [
      { name: "Rent / Housing", type: "EXPENSE" },
      { name: "Maintenance", type: "EXPENSE" },
    ],
  },
  { name: "Travel", type: "EXPENSE" },
  {
    name: "Family",
    type: "EXPENSE",
    subcategories: [
      { name: "Parents Help", type: "EXPENSE" },
      { name: "Given to Wife", type: "EXPENSE" },
    ],
  },
  { name: "Investment", type: "EXPENSE" },
  {
    name: "Income",
    type: "INCOME",
    subcategories: [
      { name: "Salary", type: "INCOME" },
      { name: "Freelance", type: "INCOME" },
      { name: "Other Income", type: "INCOME" },
    ],
  },
  { name: "Other / Miscellaneous", type: "EXPENSE" },
];

type Tx = Prisma.TransactionClient | PrismaClient;

export async function seedDefaultCategoriesForUser(tx: Tx, userId: string) {
  for (const parent of DEFAULT_CATEGORIES) {
    const created = await tx.category.create({
      data: {
        userId,
        name: parent.name,
        type: parent.type,
      },
    });

    if (parent.subcategories?.length) {
      await tx.category.createMany({
        data: parent.subcategories.map((sub) => ({
          userId,
          name: sub.name,
          type: sub.type,
          parentCategoryId: created.id,
        })),
      });
    }
  }
}
