import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Wealth Tracker",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Log in</h1>
      <LoginForm />
    </>
  );
}
