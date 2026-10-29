"use client";

import { CheckCircle, Warning } from "@/design-system/icons";
import type { Issue } from "../lib/check";
import type { Field } from "../template/types";

export function Checklist({
  missing,
  issues,
  onSelectIssue,
}: {
  missing: Field[];
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}) {
  if (!missing.length && !issues.length) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle size={18} /> Tudo preenchido. Confira a prévia e baixe o
        PDF.
      </p>
    );
  }

  const placeholders = [...new Set(missing.map((field) => field.placeholder))];

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {issues.map((issue) => (
        <button
          key={issue.path + issue.message}
          type="button"
          onClick={() => onSelectIssue(issue)}
          className="flex items-center gap-2 text-left underline-offset-2 hover:underline"
        >
          <Warning size={16} className="shrink-0" /> {issue.message}
        </button>
      ))}
      {missing.length > 0 && (
        <details>
          <summary className="cursor-pointer">
            {missing.length === 1
              ? "Falta 1 campo no contrato"
              : `Faltam ${missing.length} campos no contrato`}
            <span className="text-amber-800/70"> (em amarelo na prévia)</span>
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
            {placeholders.join(" · ")}
          </p>
        </details>
      )}
    </div>
  );
}
