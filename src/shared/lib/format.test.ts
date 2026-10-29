import { describe, expect, test } from "bun:test";
import { leaseEndDate, formatDate, formatLongDate } from "./dates";
import { currencyToWords, numberToWords } from "./extenso";
import {
  isValidCpf,
  maskCep,
  maskCpf,
  maskMoney,
  maskPhone,
  parseMoney,
} from "./format";

describe("extenso", () => {
  test.each([
    [1, "um"],
    [2, "dois"],
    [12, "doze"],
    [21, "vinte e um"],
    [100, "cem"],
    [101, "cento e um"],
    [1000, "mil"],
    [1050, "mil e cinquenta"],
    [1200, "mil e duzentos"],
    [1230, "mil duzentos e trinta"],
    [2500, "dois mil e quinhentos"],
    [15750, "quinze mil setecentos e cinquenta"],
    [1_000_200, "um milhão e duzentos"],
    [2_500_000, "dois milhões e quinhentos mil"],
  ])("%d", (n, words) => expect(numberToWords(n)).toBe(words));

  test("currency", () => {
    expect(currencyToWords(1200)).toBe("mil e duzentos reais");
    expect(currencyToWords(1)).toBe("um real");
    expect(currencyToWords(850.5)).toBe(
      "oitocentos e cinquenta reais e cinquenta centavos",
    );
    expect(currencyToWords(0.01)).toBe("um centavo");
    expect(currencyToWords(1_000_000)).toBe("um milhão de reais");
  });
});

describe("dates", () => {
  test("lease end is start + months − 1 day", () => {
    expect(leaseEndDate("2026-10-19", 12)).toBe("2027-10-18");
    expect(leaseEndDate("2026-01-01", 6)).toBe("2026-06-30");
    expect(leaseEndDate("2026-01-31", 1)).toBe("2026-02-27");
    expect(leaseEndDate("", 12)).toBe("");
  });
  test("formats", () => {
    expect(formatDate("2026-10-19")).toBe("19/10/2026");
    expect(formatLongDate("2026-10-19")).toBe("19 de outubro de 2026");
    expect(formatDate("2026-02-30")).toBe("");
  });
});

describe("format", () => {
  test("cpf", () => {
    expect(maskCpf("32915802300")).toBe("329.158.023-00");
    expect(isValidCpf("329.158.023-00")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("329.158.023-01")).toBe(false);
  });
  test("masks", () => {
    expect(maskCep("65900001")).toBe("65900-001");
    expect(maskPhone("99988053361")).toBe("(99) 98805-3361");
    expect(maskPhone("9935251234")).toBe("(99) 3525-1234");
    expect(maskMoney("120000")).toBe("1.200,00");
  });
  test("money", () => {
    expect(parseMoney("1.200,00")).toBe(1200);
    expect(parseMoney("R$ 850,5")).toBe(850.5);
    expect(parseMoney("")).toBeNull();
  });
});
