"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "@/design-system/ui/button";
import { Copy, Download, Plus } from "@/design-system/icons";
import { todayIso } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/utils";
import { checkContract } from "../lib/check";
import {
  currentDraftId,
  draftTitle,
  listDrafts,
  newDraftId,
  saveDraft,
  type Draft,
} from "../lib/drafts";
import { emptyContract, parseContract, type ContractData } from "../schema";
import { buildContract, missingFields } from "../template/residencial";
import { Checklist } from "./checklist";
import { ClauseEditor } from "./clause-list";
import { ContractForm } from "./contract-form";
import { ContractPreview } from "./contract-preview";
import { DraftsDialog } from "./drafts-dialog";
import { IssuesProvider } from "./fields";
import { renderContractPdf } from "../pdf/use-contract-pdf";

const SAVE_DELAY_MS = 600;

function freshContract(): ContractData {
  return { ...emptyContract(), dataAssinatura: todayIso() };
}

/** Reopens the last contract edited in this browser, or starts a new one. */
function initialDraft() {
  const drafts = listDrafts();
  const id = currentDraftId();
  const draft = drafts.find((item) => item.id === id) ?? drafts[0];
  if (draft) return { id: draft.id, data: draft.data, untouched: false };
  return { id: newDraftId(), data: freshContract(), untouched: true };
}

export function ContractWorkspace() {
  const [initial] = useState(initialDraft);
  const form = useForm<ContractData>({ defaultValues: initial.data });
  const [draftId, setDraftId] = useState(initial.id);
  // A brand-new contract is only stored once something is typed in it.
  const [untouchedJson, setUntouchedJson] = useState(
    initial.untouched ? JSON.stringify(initial.data) : null,
  );
  const [editingClause, setEditingClause] = useState<string | null>(null);
  const [view, setView] = useState<"form" | "preview">("form");
  const [downloading, setDownloading] = useState(false);

  const values = useWatch({ control: form.control });
  const json = JSON.stringify(values);
  const data = useMemo(() => parseContract(JSON.parse(json)), [json]);
  const title = draftTitle(data);
  const issues = useMemo(() => checkContract(data), [data]);
  const missing = useMemo(() => missingFields(buildContract(data)), [data]);

  function open(id: string, contract: ContractData, untouched: boolean) {
    form.reset(contract);
    setDraftId(id);
    setUntouchedJson(untouched ? JSON.stringify(contract) : null);
  }

  function openNew() {
    open(newDraftId(), freshContract(), true);
  }

  useEffect(() => {
    if (json === untouchedJson) return;
    const timer = setTimeout(() => saveDraft(draftId, data), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draftId, data, json, untouchedJson]);

  async function download() {
    setDownloading(true);
    try {
      const blob = await renderContractPdf(data, title);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contrato - ${title}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex h-dvh flex-col">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-background px-4 py-3 lg:px-6">
          <div className="mr-auto min-w-0">
            <p className="font-display text-xl leading-none italic">
              Rose Barbosa{" "}
              <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-muted-foreground not-italic uppercase">
                Contratos
              </span>
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              Locação residencial · {title}
            </p>
          </div>
          <DraftsDialog
            currentId={draftId}
            onOpenDraft={(draft: Draft) => open(draft.id, draft.data, false)}
          />
          <Button variant="outline" size="sm" onClick={openNew}>
            <Plus /> Novo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const id = newDraftId();
              open(id, data, false);
              saveDraft(id, data);
            }}
          >
            <Copy /> Duplicar
          </Button>
          <Button size="sm" onClick={download} disabled={downloading}>
            <Download /> {downloading ? "Gerando…" : "Baixar PDF"}
          </Button>
        </header>

        <div
          className="flex gap-1 border-b border-line p-2 lg:hidden"
          role="tablist"
        >
          {(["form", "preview"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => setView(option)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium text-muted-foreground",
                view === option && "bg-muted text-foreground",
              )}
            >
              {option === "form" ? "Preencher" : "Prévia"}
            </button>
          ))}
        </div>

        <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.1fr)]">
          <div
            className={cn(
              "min-h-0 overflow-y-auto px-4 pt-5 lg:block lg:px-8",
              view === "form" ? "block" : "hidden",
            )}
          >
            <div className="mx-auto max-w-2xl">
              <Checklist
                missing={missing}
                issues={issues}
                onSelectIssue={(issue) =>
                  form.setFocus(
                    issue.path as Parameters<typeof form.setFocus>[0],
                  )
                }
              />
              <IssuesProvider value={issues}>
                <form
                  className="mt-6"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <ContractForm onEditClause={setEditingClause} />
                </form>
              </IssuesProvider>
            </div>
          </div>
          <div
            className={cn(
              "min-h-0 overflow-y-auto bg-muted/70 px-4 py-6 lg:block lg:px-10",
              view === "preview" ? "block" : "hidden",
            )}
          >
            <div className="mx-auto max-w-[720px]">
              <ContractPreview data={data} title={title} />
            </div>
          </div>
        </main>
      </div>
      <ClauseEditor
        clauseId={editingClause}
        onClose={() => setEditingClause(null)}
      />
    </FormProvider>
  );
}
