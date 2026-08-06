"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAsset } from "@/lib/actions/assets";
import { ASSET_KINDS } from "@/lib/validations/asset";

function todayLocalDateInputValue() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/15";

export function AddAssetForm() {
  const [state, formAction, pending] = useActionState(createAsset, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3"
    >
      <input
        name="name"
        type="text"
        required
        placeholder="Name (e.g. HDFC Savings)"
        aria-label="Name"
        className={`min-w-[10rem] flex-1 ${inputClass}`}
      />

      <select name="kind" required defaultValue="" aria-label="Kind" className={inputClass}>
        <option value="" disabled>
          Kind
        </option>
        {ASSET_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>

      <input
        name="balance"
        type="number"
        step="0.01"
        required
        placeholder="Balance"
        aria-label="Balance"
        title="Enter liabilities (loans, cards owed) as a negative number"
        className={`w-32 ${inputClass}`}
      />

      <input
        name="asOfDate"
        type="date"
        required
        defaultValue={todayLocalDateInputValue()}
        suppressHydrationWarning
        aria-label="As of date"
        className={inputClass}
      />

      <input
        name="note"
        type="text"
        placeholder="Note (optional)"
        aria-label="Note"
        className={`min-w-[10rem] flex-1 ${inputClass}`}
      />

      {state?.error && (
        <p className="w-full text-sm text-red-500">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
