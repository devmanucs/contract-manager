"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

// Draws the generated PDF onto canvases so the preview keeps its scroll
// position while the user types (an <iframe> viewer reloads to the top).

type Pdfjs = typeof import("pdfjs-dist");

// One worker for the whole session: documents passed an explicit worker
// leave it running when they are destroyed between renders.
let pdfjsPromise: Promise<{
  pdfjs: Pdfjs;
  worker: InstanceType<Pdfjs["PDFWorker"]>;
}> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).href;
    return { pdfjs, worker: new pdfjs.PDFWorker() };
  });
  return pdfjsPromise;
}

async function drawPages(
  document: PDFDocumentProxy,
  width: number,
): Promise<HTMLCanvasElement[]> {
  const ratio = window.devicePixelRatio || 1;
  const canvases: HTMLCanvasElement[] = [];
  for (let number = 1; number <= document.numPages; number++) {
    const page = await document.getPage(number);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: (width / base.width) * ratio });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = "100%";
    canvas.setAttribute("aria-label", `Página ${number}`);
    canvas.setAttribute("role", "img");
    await page.render({ canvas, viewport }).promise;
    canvases.push(canvas);
  }
  return canvases;
}

// Rounded so sub-pixel layout changes do not trigger a redraw.
const roundWidth = (width: number) => Math.round(width / 20) * 20;

export function PdfPages({ blob }: { blob: Blob | null }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(roundWidth(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = container.current;
    // Measured directly too: the observer only reports once the page paints.
    const target = width || roundWidth(element?.clientWidth ?? 0);
    if (!blob || !element || !target) return;
    let cancelled = false;
    const loaded: { task?: PDFDocumentLoadingTask } = {};

    (async () => {
      const { pdfjs, worker } = await loadPdfjs();
      loaded.task = pdfjs.getDocument({
        data: await blob.arrayBuffer(),
        worker,
      });
      const canvases = await drawPages(await loaded.task.promise, target);
      if (cancelled) return;
      // Swap all pages at once so the preview never flashes empty.
      element.replaceChildren(
        ...canvases.map((canvas) => {
          const sheet = window.document.createElement("div");
          sheet.className = "pdf-sheet";
          sheet.append(canvas);
          return sheet;
        }),
      );
      setPages(canvases.length);
    })().catch((reason: unknown) => {
      if (!cancelled) console.error(reason);
    });

    return () => {
      cancelled = true;
      void loaded.task?.destroy();
    };
  }, [blob, width]);

  return (
    <div className="relative">
      <div
        ref={container}
        className="flex flex-col gap-6"
        aria-label={pages ? `Prévia do contrato, ${pages} páginas` : undefined}
      />
      {!pages && (
        <div className="pdf-sheet grid aspect-[210/297] place-items-center text-sm text-muted-foreground">
          Gerando prévia…
        </div>
      )}
    </div>
  );
}
