"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/settings";
import { SUPPORTED_CURRENCIES } from "@/lib/format";

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/15";

export function SettingsForm({
  name,
  currency,
}: {
  name: string;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    undefined
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="name"
          type="text"
          required
          defaultValue={name}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Currency
        <select name="currency" defaultValue={currency} className={inputClass}>
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-600">Saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
