import { auth } from "@/auth";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-foreground/60">
          Your profile and display preferences.
        </p>
      </div>

      <div className="max-w-sm rounded-lg border border-black/10 p-4 dark:border-white/10">
        <p className="text-sm text-foreground/60">Email</p>
        <p className="mt-1 text-sm">{user.email}</p>
        <p className="mt-1 text-xs text-foreground/40">
          Email can&apos;t be changed here.
        </p>
      </div>

      <div className="max-w-sm rounded-lg border border-black/10 p-4 dark:border-white/10">
        <SettingsForm name={user.name ?? ""} currency={user.currency} />
      </div>
    </div>
  );
}
