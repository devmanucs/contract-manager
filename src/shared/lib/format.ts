// Masks, parsing and Brazilian document formats used by the contract form.
const digits = (value: string) => value.replace(/\D/g, "");

export function maskCpf(value: string) {
  return digits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCep(value: string) {
  return digits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskPhone(value: string) {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  if (rest.length <= 4) return ddd + rest;
  const split = rest.length === 9 ? 5 : 4;
  return `${ddd}${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Checks the two CPF verification digits. */
export function isValidCpf(value: string) {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(d[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export const sameDigits = (a: string, b: string) =>
  digits(a).length > 0 && digits(a) === digits(b);

/** "1.200,50" or "1200.5" → 1200.5; empty or invalid → null. */
export function parseMoney(value: string): number | null {
  const clean = value.trim().replace(/[R$\s]/g, "");
  if (!clean) return null;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

const money = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
/** 1200 → "1.200,00" (without the currency symbol, the contract writes "R$"). */
export const formatMoney = (value: number) => money.format(value);

/** Keeps only digits and formats as the user types: "120000" → "1.200,00". */
export function maskMoney(value: string) {
  const d = digits(value).replace(/^0+(?=\d)/, "");
  if (!d) return "";
  return formatMoney(Number(d) / 100);
}
