"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { useController, type Path } from "react-hook-form";
import { Switch } from "@/design-system/ui/switch";
import { cn } from "@/shared/lib/utils";
import type { Issue } from "../lib/check";
import type { ContractData } from "../schema";

export type FieldPath = Path<ContractData>;

const IssuesContext = createContext<Issue[]>([]);
export const IssuesProvider = IssuesContext.Provider;

export const inputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-wine focus:ring-3 focus:ring-wine/15 aria-[invalid=true]:border-amber-500";

export function FieldShell({
  id,
  label,
  hint,
  warning,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  warning?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-foreground/80">
        {label}
        {hint && (
          <span className="font-normal text-muted-foreground"> · {hint}</span>
        )}
      </label>
      {children}
      {warning && (
        <p id={`${id}-warning`} className="text-xs text-amber-700">
          {warning}
        </p>
      )}
    </div>
  );
}

export function TextField({
  name,
  label,
  hint,
  mask,
  className,
  onValueChange,
  ...input
}: {
  name: FieldPath;
  label: string;
  hint?: string;
  mask?: (value: string) => string;
  className?: string;
  onValueChange?: (value: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "value" | "onChange" | "onBlur"
>) {
  const id = useId();
  const {
    field: { ref, value, onChange, onBlur },
  } = useController<ContractData>({ name });
  const warning = useContext(IssuesContext).find(
    (issue) => issue.path === name,
  )?.message;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      warning={warning}
      className={className}
    >
      <input
        id={id}
        ref={ref}
        name={name}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => {
          const next = mask ? mask(event.target.value) : event.target.value;
          onChange(next);
          onValueChange?.(next);
        }}
        onBlur={onBlur}
        aria-invalid={warning ? true : undefined}
        aria-describedby={warning ? `${id}-warning` : undefined}
        className={inputClass}
        {...input}
      />
    </FieldShell>
  );
}

export function SwitchField({
  name,
  label,
  description,
}: {
  name: FieldPath;
  label: string;
  description?: string;
}) {
  const id = useId();
  const { field } = useController<ContractData>({ name });
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
      <label htmlFor={id} className="text-sm">
        <span className="block font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground">{description}</span>
        )}
      </label>
      <Switch
        id={id}
        checked={field.value === true}
        onCheckedChange={(checked) => field.onChange(checked)}
      />
    </div>
  );
}

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4 border-t border-line pt-6">
      <h2 className="text-[11px] font-semibold tracking-[0.18em] text-wine uppercase">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-6">
        {children}
      </div>
    </section>
  );
}
