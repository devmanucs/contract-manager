import { describe, expect, test } from "bun:test";
import { emptyContract, parseContract } from "../schema";
import {
  buildContract,
  clauseText,
  missingFields,
  segmentText,
} from "./residencial";
import type { Paragraph } from "./types";

const text = (paragraph: Paragraph) =>
  paragraph.segments.map(segmentText).join("");

// Fictional data.
const sample = parseContract({
  locador: {
    nome: "Maria da Silva",
    rg: "1234567",
    orgaoEmissor: "SSP/MA",
    cpf: "529.982.247-25",
    profissao: "Professora",
    endereco: "Rua A, 10, Centro",
    cep: "65900-000",
    cidade: "Imperatriz - MA",
  },
  locatario: {
    nome: "João Souza",
    rg: "7654321",
    orgaoEmissor: "SSP/MA",
    cpf: "111.444.777-35",
    estadoCivil: "solteiro",
    profissao: "Vendedor",
    endereco: "Rua B, 20",
    cep: "65900-100",
    cidade: "Imperatriz - MA",
    email: "joao@example.com",
    telefone: "(99) 99999-0000",
  },
  imovel: {
    endereco: "Rua C, 30, apto. 1",
    cep: "65900-200",
    cidade: "Imperatriz - MA",
    contaEnergia: "123",
    mobiliado: true,
  },
  inicio: "2026-11-01",
  prazoMeses: "6",
  multaMeses: "1",
  aluguel: "950,00",
  caucao: "950,00",
  diaVencimento: "5",
  dataAssinatura: "2026-10-30",
});

describe("buildContract", () => {
  test("qualifies the parties like the template", () => {
    const [locador, locatario] = buildContract(sample).intro.map(text);
    expect(locador).toContain(
      "MARIA DA SILVA, RG: 1234567 SSP/MA, CPF: 529.982.247-25, Professora, residente",
    );
    expect(locador).toEndWith(
      "na cidade de Imperatriz - MA, doravante denominado LOCADOR(A).",
    );
    expect(locatario).toContain("111.444.777-35, solteiro, Vendedor,");
    expect(locatario).toEndWith(
      "E-mail: joao@example.com; Telefone: (99) 99999-0000; doravante denominado LOCATÁRIO(A).",
    );
  });

  test("derives amounts, words and dates", () => {
    const document = buildContract(sample);
    const body = (id: string) =>
      clauseText(document.clauses.find((clause) => clause.id === id)!);
    expect(body("objeto")).toContain("residencial/apartamento mobiliado (");
    expect(body("prazo")).toContain(
      "de seis meses, iniciando-se a partir de 01/11/2026 e término no dia 30/04/2027",
    );
    expect(body("multa")).toContain("valor de um mês de aluguel");
    expect(body("preco")).toContain("R$ 950,00 (novecentos e cinquenta reais)");
    expect(body("foro")).toContain("foro da cidade de Imperatriz - MA");
    expect(text(document.placeAndDate)).toBe(
      "Imperatriz - MA, 30 de outubro de 2026.",
    );
    expect(missingFields(document)).toEqual([]);
  });

  test("expense option changes clauses 9, 10 and 13", () => {
    const completo = buildContract({ ...sample, despesas: "completo" });
    const all = completo.clauses.map(clauseText).join("\n");
    expect(all).toContain("despesas condominiais não quitadas");
    expect(all).toContain("IPTU, Taxa de Pintura");
    expect(all).toContain("consumo de energia, água e demais despesas");
  });

  test("witnesses add signatures and the closing mention", () => {
    const document = buildContract({
      ...sample,
      testemunhas: true,
      testemunha1: { nome: "Ana", cpf: "" },
      testemunha2: { nome: "", cpf: "" },
    });
    expect(document.signatures.map((s) => s.role)).toEqual([
      "LOCADOR(A)",
      "LOCATÁRIO(A)",
      "TESTEMUNHA",
      "TESTEMUNHA",
    ]);
    expect(text(document.closing[0])).toContain("2 (duas) testemunhas");
    expect(missingFields(document).map((f) => f.placeholder)).toEqual([
      "NÚMERO DO CPF",
      "TESTEMUNHA 02",
      "NÚMERO DO CPF",
    ]);
  });

  test("an override replaces the clause body", () => {
    const document = buildContract({
      ...sample,
      overrides: {
        despesas: "Texto livre.\n\na) Primeiro item\nParágrafo Único: fim.",
      },
    });
    const clause = document.clauses.find((c) => c.id === "despesas")!;
    expect(clause.overridden).toBe(true);
    expect(clause.paragraphs.map((p) => p.kind)).toEqual([
      "text",
      "item",
      "text",
    ]);
    expect(clause.paragraphs[2].segments[0]).toEqual({
      kind: "strong",
      text: "Parágrafo Único:",
    });
  });

  test("an empty contract shows every placeholder", () => {
    const placeholders = missingFields(buildContract(emptyContract())).map(
      (f) => f.placeholder,
    );
    expect(placeholders).toContain("NOME DO LOCADOR(A)");
    expect(placeholders).toContain("DATA DE TÉRMINO");
    expect(placeholders).toContain("VALOR POR EXTENSO");
  });
});
