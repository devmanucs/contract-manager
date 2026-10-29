// Contract dates are kept as ISO "yyyy-mm-dd" strings (the value of <input type="date">).
const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function parse(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 ? date : null;
}

const toIso = (date: Date) => date.toISOString().slice(0, 10);

/** "2026-10-19" → "19/10/2026". */
export function formatDate(iso: string) {
  const date = parse(iso);
  if (!date) return "";
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
}

/** "2026-10-19" → "19 de outubro de 2026". */
export function formatLongDate(iso: string) {
  const date = parse(iso);
  if (!date) return "";
  return `${date.getUTCDate()} de ${months[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

/**
 * Last day of a lease: start + N months − 1 day (19/10/2026 + 12 → 18/10/2027).
 * Clamps to the end of shorter months (31/01 + 1 → 28/02).
 */
export function leaseEndDate(startIso: string, months: number) {
  const start = parse(startIso);
  if (!start || !Number.isInteger(months) || months <= 0) return "";
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const end = new Date(Date.UTC(y, m, Math.min(start.getUTCDate(), lastDay)));
  end.setUTCDate(end.getUTCDate() - 1);
  return toIso(end);
}

export function todayIso() {
  const now = new Date();
  return toIso(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
}
