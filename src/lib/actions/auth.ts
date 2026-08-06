"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { seedDefaultCategoriesForUser } from "@/lib/seed-categories";
import { signupSchema } from "@/lib/validations/auth";

export type AuthActionState = { error?: string } | undefined;

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // User creation + full default-category seed happen atomically, so a
  // partially-seeded user can never exist.
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    });
    await seedDefaultCategoriesForUser(tx, user.id);
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // signIn's redirect is implemented as a thrown NEXT_REDIRECT signal, not
    // an AuthError — only intercept genuine auth failures and let anything
    // else (i.e. the redirect) propagate so Next.js can handle it.
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw error;
  }
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}
