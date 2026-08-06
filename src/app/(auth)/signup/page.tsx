import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — Wealth Tracker",
};

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Create your account</h1>
      <SignupForm />
    </>
  );
}
