"use client";

import { RadioGroupPrimitive, RadioPrimitive } from "@/design-system/base";
import { cn } from "@/shared/lib/utils";

type Option<T extends string> = {
  value: T;
  label: string;
  description: string;
};

/** A radio group drawn as selectable cards (label + one-line description). */
export function RadioCards<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...props
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <RadioGroupPrimitive
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn("grid gap-2 sm:grid-cols-2", className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 transition-colors has-[[data-checked]]:border-wine has-[[data-checked]]:bg-wine/5"
        >
          <RadioPrimitive.Root
            value={option.value}
            className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-input data-[checked]:border-wine"
          >
            <RadioPrimitive.Indicator className="size-2 rounded-full bg-wine" />
          </RadioPrimitive.Root>
          <span className="text-sm">
            <span className="block font-medium">{option.label}</span>
            <span className="text-muted-foreground">{option.description}</span>
          </span>
        </label>
      ))}
    </RadioGroupPrimitive>
  );
}
