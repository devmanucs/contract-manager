import { parseContract, type ContractData } from "../schema";

// Drafts live only in this browser (localStorage): personal data never leaves
// the machine. Every access is guarded because storage can be blocked.
const DRAFTS_KEY = "contract-manager:drafts";
const CURRENT_KEY = "contract-manager:current";

export type Draft = { id: string; updatedAt: number; data: ContractData };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the open contract keeps working in memory.
  }
}

export function listDrafts(): Draft[] {
  const drafts = read<unknown[]>(DRAFTS_KEY, []);
  return (Array.isArray(drafts) ? drafts : [])
    .filter(
      (draft): draft is Draft =>
        !!draft && typeof (draft as Draft).id === "string",
    )
    .map((draft) => ({ ...draft, data: parseContract(draft.data) }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveDraft(id: string, data: ContractData) {
  const others = listDrafts().filter((draft) => draft.id !== id);
  write(DRAFTS_KEY, [{ id, updatedAt: Date.now(), data }, ...others]);
  write(CURRENT_KEY, id);
}

export function deleteDraft(id: string) {
  write(
    DRAFTS_KEY,
    listDrafts().filter((draft) => draft.id !== id),
  );
}

export function currentDraftId(): string | null {
  return read<string | null>(CURRENT_KEY, null);
}

export const newDraftId = () => crypto.randomUUID();

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

/** "Vilma x Emanuelly" — the same naming used for the .docx files. */
export function draftTitle(data: ContractData) {
  const names = [data.locador.nome, data.locatario.nome]
    .map(firstName)
    .filter(Boolean);
  return names.length ? names.join(" x ") : "Contrato sem nomes";
}
