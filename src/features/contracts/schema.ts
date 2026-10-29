import { z } from "zod";

// Every field is a string the form edits directly; blanks are allowed so a
// draft can be saved and previewed at any point. Missing values show up as
// highlighted placeholders in the PDF and in the checklist.
const text = z.string().catch("");

export const partySchema = z.object({
  nome: text,
  rg: text,
  orgaoEmissor: text,
  cpf: text,
  estadoCivil: text,
  profissao: text,
  endereco: text,
  cep: text,
  cidade: text,
  email: text,
  telefone: text,
});

export const witnessSchema = z.object({ nome: text, cpf: text });

export const expenseOptions = {
  consumo: {
    label: "Só consumo",
    description: "Energia elétrica, água e gás",
  },
  completo: {
    label: "Completo",
    description: "Impostos, IPTU, taxas; condomínio incluso no aluguel",
  },
} as const;

export const contractSchema = z.object({
  locador: partySchema,
  locatario: partySchema,
  imovel: z.object({
    descricao: z.string().catch("residencial/apartamento"),
    mobiliado: z.boolean().catch(false),
    endereco: text,
    cep: text,
    cidade: text,
    contaEnergia: text,
  }),
  prazoMeses: z.string().catch("12"),
  inicio: text,
  multaMeses: z.string().catch("2"),
  aluguel: text,
  formaPagamento: z.string().catch("PIX, chave informada via WhatsApp"),
  diaVencimento: text,
  caucao: text,
  despesas: z
    .enum(Object.keys(expenseOptions) as [keyof typeof expenseOptions])
    .catch("consumo"),
  foro: text,
  localAssinatura: text,
  dataAssinatura: text,
  testemunhas: z.boolean().catch(false),
  testemunha1: witnessSchema,
  testemunha2: witnessSchema,
  /** Clause id → text written by hand for this contract only. */
  overrides: z.record(z.string(), z.string()).catch({}),
});

export type Party = z.infer<typeof partySchema>;
export type ContractData = z.infer<typeof contractSchema>;
export type ExpenseOption = ContractData["despesas"];

const emptyParty = (): Party => partySchema.parse({});

export function emptyContract(): ContractData {
  return contractSchema.parse({
    locador: emptyParty(),
    locatario: emptyParty(),
    imovel: {},
    testemunha1: {},
    testemunha2: {},
  });
}

/** Reads a stored draft, filling anything missing or malformed with defaults. */
export function parseContract(value: unknown): ContractData {
  const base = emptyContract();
  if (!value || typeof value !== "object") return base;
  const raw = value as Record<string, unknown>;
  return contractSchema.parse({
    ...base,
    ...raw,
    locador: { ...base.locador, ...(raw.locador as object) },
    locatario: { ...base.locatario, ...(raw.locatario as object) },
    imovel: { ...base.imovel, ...(raw.imovel as object) },
    testemunha1: { ...base.testemunha1, ...(raw.testemunha1 as object) },
    testemunha2: { ...base.testemunha2, ...(raw.testemunha2 as object) },
  });
}
