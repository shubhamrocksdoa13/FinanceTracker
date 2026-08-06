export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-black/10 p-6 shadow-sm dark:border-white/10">
        {children}
      </div>
    </div>
  );
}
