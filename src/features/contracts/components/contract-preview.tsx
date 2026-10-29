"use client";

import type { ContractData } from "../schema";
import { PdfPages } from "../pdf/pdf-pages";
import { useContractPdf } from "../pdf/use-contract-pdf";

export function ContractPreview({
  data,
  title,
}: {
  data: ContractData;
  title: string;
}) {
  const { blob, error } = useContractPdf(data, title);
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <PdfPages blob={blob} />
    </>
  );
}
