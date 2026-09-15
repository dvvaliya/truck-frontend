"use client";

import { Clock3 } from "lucide-react";

type CycleHoursInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const MIN_HOURS = 0;
const MAX_HOURS = 70;
export const CycleHoursInput = ({ value, onChange }: CycleHoursInputProps) => {
  const handleInput = (nextValue: string) => {
    if (nextValue === "") {
      onChange(nextValue);
      return;
    }

    const isValidFormat = /^\d{0,2}(\.\d{0,2})?$/.test(nextValue);
    const parsedValue = Number(nextValue);
    if (isValidFormat && parsedValue >= MIN_HOURS && parsedValue <= MAX_HOURS) {
      onChange(nextValue);
    }
  };

  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-xs font-bold text-field-text">Cycle used</span>
      <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-field-border bg-white px-3.5 text-muted transition focus-within:border-orange focus-within:ring-3 focus-within:ring-orange/10">
        <Clock3 className="size-4 shrink-0" />
        <input
          required
          className="w-full min-w-10 border-0 bg-transparent text-lg font-bold text-ink outline-none"
          type="text"
          inputMode="decimal"
          aria-label="Current cycle hours used"
          value={value}
          onChange={(event) => handleInput(event.target.value)}
          onBlur={() => value === "" && onChange("0")}
        />
        <span className="shrink-0 text-xs font-bold">hrs</span>
      </div>
      <small className="mt-1.5 block text-[10px] text-muted">Enter a value from 0 to 70</small>
    </label>
  );
};
