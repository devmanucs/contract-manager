"use client";

import dynamic from "next/dynamic";

// Client-only: drafts come from localStorage and the PDF is rendered in the
// browser, so there is nothing useful to prerender on the server.
export const ContractApp = dynamic(
  () => import("./contract-workspace").then((mod) => mod.ContractWorkspace),
  {
    ssr: false,
    loading: () => (
      <p className="grid h-dvh place-items-center text-sm text-muted-foreground">
        Carregando…
      </p>
    ),
  },
);
