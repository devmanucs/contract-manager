"use client";

import { useState } from "react";
import { Button } from "@/design-system/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/design-system/ui/dialog";
import { Folder, Trash } from "@/design-system/icons";
import { formatDate } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/utils";
import { deleteDraft, draftTitle, listDrafts, type Draft } from "../lib/drafts";

const updatedAt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function DraftsDialog({
  currentId,
  onOpenDraft,
}: {
  currentId: string | null;
  onOpenDraft: (draft: Draft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDrafts(listDrafts());
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Folder /> Contratos
          </Button>
        }
      />
      <DialogContent
        title="Contratos salvos"
        description="Ficam guardados só neste navegador."
      >
        <ul className="flex flex-col overflow-y-auto p-3">
          {drafts.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum contrato salvo ainda.
            </li>
          )}
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted",
                draft.id === currentId && "bg-wine/5",
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  onOpenDraft(draft);
                  setOpen(false);
                }}
              >
                <span className="block truncate text-sm font-medium">
                  {draftTitle(draft.data)}
                  {draft.id === currentId && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · aberto
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[
                    draft.data.imovel.endereco,
                    draft.data.inicio &&
                      `início ${formatDate(draft.data.inicio)}`,
                    `editado ${updatedAt.format(draft.updatedAt)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
              {draft.id !== currentId && (
                <Button
                  type="button"
                  variant="danger"
                  size="icon"
                  aria-label={`Excluir ${draftTitle(draft.data)}`}
                  onClick={() => {
                    if (!window.confirm(`Excluir “${draftTitle(draft.data)}”?`))
                      return;
                    deleteDraft(draft.id);
                    setDrafts(listDrafts());
                  }}
                >
                  <Trash />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
