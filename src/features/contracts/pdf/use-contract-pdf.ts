"use client";

import { pdf } from "@react-pdf/renderer";
import { createElement, useEffect, useState } from "react";
import { site } from "@/shared/config/site";
import type { ContractData } from "../schema";
import { buildContract } from "../template/residencial";
import { ContractPdf } from "./contract-pdf";

const DEBOUNCE_MS = 350;

export function renderContractPdf(data: ContractData, title: string) {
  const element = createElement(ContractPdf, {
    document: buildContract(data),
    letterheadUrl: new URL(site.letterhead, window.location.origin).href,
    title,
  });
  // ContractPdf renders a <Document>, which is what pdf() expects.
  return pdf(element as Parameters<typeof pdf>[0]).toBlob();
}

/** Re-renders the PDF a moment after the user stops typing. */
export function useContractPdf(data: ContractData, title: string) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      renderContractPdf(data, title)
        .then((result) => {
          if (cancelled) return;
          setBlob(result);
          setError(null);
        })
        .catch((reason: unknown) => {
          if (cancelled) return;
          console.error(reason);
          setError("Não foi possível gerar o PDF.");
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, title]);

  return { blob, error };
}
