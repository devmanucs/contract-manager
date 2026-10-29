"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/design-system/ui/button";
import { Dialog, DialogContent } from "@/design-system/ui/dialog";
import { Pencil, Undo } from "@/design-system/icons";
import { cn } from "@/shared/lib/utils";
import { parseContract, type ContractData } from "../schema";
import { buildContract, clauseText } from "../template/residencial";

function withoutOverride(data: ContractData, id: string): ContractData {
  const overrides = { ...data.overrides };
  delete overrides[id];
  return { ...data, overrides };
}

export function ClauseList({
  className,
  onEdit,
}: {
  className?: string;
  onEdit: (id: string) => void;
}) {
  const { control, setValue, getValues } = useFormContext<ContractData>();
  const overrides = useWatch({ control, name: "overrides" }) ?? {};
  const clauses = buildContract(parseContract(getValues())).clauses;

  return (
    <ul
      className={cn(
        "divide-y divide-line rounded-xl border border-line",
        className,
      )}
    >
      {clauses.map((clause) => {
        const edited = Boolean(overrides[clause.id]?.trim());
        return (
          <li key={clause.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-sm">
              {clause.heading
                .replace(/^CLÁUSULA /, "")
                .toLocaleLowerCase("pt-BR")}
            </span>
            {edited && (
              <>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  editada
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Voltar ao texto padrão: ${clause.heading}`}
                  title="Voltar ao texto padrão"
                  onClick={() =>
                    setValue(
                      "overrides",
                      withoutOverride(getValues(), clause.id).overrides,
                      {
                        shouldDirty: true,
                      },
                    )
                  }
                >
                  <Undo />
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Editar ${clause.heading}`}
              title="Editar texto"
              onClick={() => onEdit(clause.id)}
            >
              <Pencil />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export function ClauseEditor({
  clauseId,
  onClose,
}: {
  clauseId: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={clauseId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      {clauseId && (
        <ClauseEditorBody
          key={clauseId}
          clauseId={clauseId}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function ClauseEditorBody({
  clauseId,
  onClose,
}: {
  clauseId: string;
  onClose: () => void;
}) {
  const { getValues, setValue } = useFormContext<ContractData>();
  const data = parseContract(getValues());
  const standard = buildContract(withoutOverride(data, clauseId)).clauses.find(
    (clause) => clause.id === clauseId,
  );
  const [text, setText] = useState(
    () => data.overrides[clauseId] ?? (standard ? clauseText(standard) : ""),
  );
  if (!standard) return null;

  const save = (value: string | null) => {
    const overrides = withoutOverride(getValues(), clauseId).overrides;
    if (value?.trim()) overrides[clauseId] = value;
    setValue("overrides", overrides, { shouldDirty: true });
    onClose();
  };

  return (
    <DialogContent
      title={standard.heading}
      description="Vale só para este contrato. O texto editado fica fixo: não acompanha mudanças feitas depois nos campos."
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-6 py-4">
        <textarea
          aria-label="Texto da cláusula"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-[320px] flex-1 resize-y rounded-lg border border-input p-3 text-sm leading-relaxed outline-none focus:border-wine focus:ring-3 focus:ring-wine/15"
        />
        <p className="text-xs text-muted-foreground">
          Uma linha por parágrafo. Linhas começando com “a)”, “b)”… viram itens
          e “Parágrafo …:” fica em negrito.
        </p>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-line px-6 py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setText(clauseText(standard))}
        >
          <Undo /> Restaurar texto padrão
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => save(text === clauseText(standard) ? null : text)}
          >
            Salvar cláusula
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
