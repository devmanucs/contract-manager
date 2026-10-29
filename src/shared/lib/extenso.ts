// Brazilian Portuguese number spelling for contract amounts ("valor por extenso").
const units = [
  "zero",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const tens = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const hundreds = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function belowThousand(n: number): string {
  if (n === 100) return "cem";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(hundreds[h]);
  if (rest >= 20) {
    parts.push(
      tens[Math.floor(rest / 10)] + (rest % 10 ? ` e ${units[rest % 10]}` : ""),
    );
  } else if (rest) {
    parts.push(units[rest]);
  }
  return parts.join(" e ");
}

const scales: [number, string, string][] = [
  [1_000_000_000, "bilhão", "bilhões"],
  [1_000_000, "milhão", "milhões"],
  [1_000, "mil", "mil"],
];

/** Spells a non-negative integer: 1200 → "mil e duzentos". */
export function numberToWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return "zero";

  const groups: { value: number; text: string }[] = [];
  let remaining = n;
  for (const [size, singular, plural] of scales) {
    const count = Math.floor(remaining / size);
    remaining %= size;
    if (!count) continue;
    const text =
      size === 1_000
        ? count === 1
          ? "mil"
          : `${belowThousand(count)} mil`
        : `${belowThousand(count)} ${count === 1 ? singular : plural}`;
    groups.push({ value: count * size, text });
  }
  if (remaining)
    groups.push({ value: remaining, text: belowThousand(remaining) });

  // "e" joins the last group when it is below 100 or a round hundred
  // (mil e duzentos, mil e cinquenta), otherwise groups are juxtaposed
  // (mil duzentos e trinta).
  return groups
    .map((group, index) => {
      if (index === 0) return group.text;
      const isLast = index === groups.length - 1;
      const joinsWithE =
        isLast && (group.value < 100 || group.value % 100 === 0);
      return `${joinsWithE ? " e " : " "}${group.text}`;
    })
    .join("");
}

/** 1200.5 → "mil e duzentos reais e cinquenta centavos". */
export function currencyToWords(value: number): string {
  const cents = Math.round(Math.abs(value) * 100);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  const parts: string[] = [];
  if (reais) {
    const words = numberToWords(reais);
    const isRoundMillion = reais >= 1_000_000 && reais % 1_000_000 === 0;
    parts.push(
      `${words}${isRoundMillion ? " de" : ""} ${reais === 1 ? "real" : "reais"}`,
    );
  }
  if (centavos) {
    parts.push(
      `${numberToWords(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`,
    );
  }
  return parts.length ? parts.join(" e ") : "zero reais";
}
