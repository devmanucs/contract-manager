import { isValidCpf, sameDigits } from "@/shared/lib/format";
import type { ContractData } from "../schema";

/** A warning tied to a form field path (e.g. "locador.cpf"). Never blocks the PDF. */
export type Issue = { path: string; message: string };

export function checkContract(data: ContractData): Issue[] {
  const issues: Issue[] = [];

  const people = [
    ["locador", "do locador", data.locador],
    ["locatario", "do locatário", data.locatario],
    ...(data.testemunhas
      ? ([
          ["testemunha1", "da testemunha 1", data.testemunha1],
          ["testemunha2", "da testemunha 2", data.testemunha2],
        ] as const)
      : []),
  ] as const;

  for (const [key, label, person] of people) {
    if (person.cpf.trim() && !isValidCpf(person.cpf)) {
      issues.push({ path: `${key}.cpf`, message: `CPF ${label} não é válido` });
    }
    if ("rg" in person && sameDigits(person.rg, person.cpf)) {
      issues.push({
        path: `${key}.rg`,
        message: `RG ${label} está igual ao CPF, confira`,
      });
    }
  }

  if (
    data.locador.cpf.trim() &&
    sameDigits(data.locador.cpf, data.locatario.cpf)
  ) {
    issues.push({
      path: "locatario.cpf",
      message: "Locador e locatário com o mesmo CPF",
    });
  }

  const prazo = Number(data.prazoMeses);
  if (data.prazoMeses && (!Number.isInteger(prazo) || prazo <= 0)) {
    issues.push({ path: "prazoMeses", message: "Prazo em meses inteiros" });
  }
  const multa = Number(data.multaMeses);
  if (data.multaMeses && (!Number.isInteger(multa) || multa <= 0)) {
    issues.push({ path: "multaMeses", message: "Multa em meses inteiros" });
  }
  const dia = Number(data.diaVencimento);
  if (data.diaVencimento && (!Number.isInteger(dia) || dia < 1 || dia > 31)) {
    issues.push({ path: "diaVencimento", message: "Dia entre 1 e 31" });
  }

  return issues;
}
