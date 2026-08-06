"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import type { CategoryWithSubs } from "@/lib/data/categories";

function todayLocalDateInputValue() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/15";

function CategoryPicker({
  type,
  categories,
}: {
  type: "EXPENSE" | "INCOME";
  categories: CategoryWithSubs[];
}) {
  const [parentId, setParentId] = useState("");
  const parentOptions = categories.filter((c) => c.type === type);
  const selectedParent = parentOptions.find((c) => c.id === parentId);
  const hasSubcategories = (selectedParent?.subcategories.length ?? 0) > 0;

  return (
    <>
      <select
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        required
        aria-label="Category"
        className={inputClass}
      >
        <option value="" disabled>
          Category
        </option>
        {parentOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {hasSubcategories ? (
        <select
          key={selectedParent!.id}
          name="categoryId"
          defaultValue=""
          required
          aria-label="Subcategory"
          className={inputClass}
        >
          <option value="" disabled>
            Subcategory
          </option>
          {selectedParent!.subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="categoryId" value={parentId} />
      )}
    </>
  );
}

export function QuickAddForm({
  categories,
}: {
  categories: CategoryWithSubs[];
}) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Remount CategoryPicker after each successful add so its internal
  // selection resets — avoids setState-in-effect by deriving the key
  // during render (see "storing information from previous renders" in the
  // React docs) instead of syncing it via a useEffect.
  const [prevState, setPrevState] = useState(state);
  const [pickerKey, setPickerKey] = useState(0);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setPickerKey((k) => k + 1);
  }

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
      <input type="hidden" name="type" value={type} />

      <div className="flex overflow-hidden rounded-md border border-black/10 text-sm dark:border-white/15">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`px-3 py-2 ${
            type === "EXPENSE" ? "bg-red-500 text-white" : ""
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`px-3 py-2 ${
            type === "INCOME" ? "bg-emerald-600 text-white" : ""
          }`}
        >
          Income
        </button>
      </div>

      <input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="Amount"
        aria-label="Amount"
        className={`w-28 ${inputClass}`}
      />

      <CategoryPicker key={`${pickerKey}-${type}`} type={type} categories={categories} />

      <input
        name="date"
        type="date"
        required
        defaultValue={todayLocalDateInputValue()}
        // Computed client-render-consistent for the common case; near-midnight
        // timezone drift between server/client render is an accepted edge
        // case rather than added complexity for a personal app.
        suppressHydrationWarning
        aria-label="Date"
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
