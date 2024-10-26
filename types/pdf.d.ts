declare module "pdfjs-dist/build/pdf.worker.entry";

declare module "pdfjs-dist" {
  interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  }

  interface PDFPageProxy {
    getTextContent: () => Promise<PDFPageTextContent>;
  }

  interface PDFPageTextItem {
    str: string;
    dir: string;
    transform: number[];
    width: number;
    height: number;
    fontName: string;
  }

  interface PDFPageStyle {
    fontFamily: string;
    ascent: number;
    descent: number;
    vertical: boolean;
  }

  interface PDFPageTextContent {
    items: PDFPageTextItem[];
    styles: Record<string, PDFPageStyle>;
  }

  interface PDFSource {
    data: string | Uint8Array | ArrayBuffer;
    range?: PDFDataRangeTransport;
    url?: string;
    length?: number;
    httpHeaders?: Record<string, string>;
    withCredentials?: boolean;
  }

  export function getDocument(source: PDFSource): {
    promise: Promise<PDFDocumentProxy>;
  };

  export const GlobalWorkerOptions: {
    workerSrc: string | Worker;
  };

  export const version: string;
}
