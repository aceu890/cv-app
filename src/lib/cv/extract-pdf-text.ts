import { MIN_IMPORT_TEXT } from "@/lib/cv/pdf-import";

export {
  isPdfUpload,
  MAX_IMPORT_PDF_BYTES,
  MIN_IMPORT_TEXT,
  uploadedFile,
} from "@/lib/cv/pdf-import";

export function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function decodePdfLiteral(inner: string) {
  return inner
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, oct: string) =>
      String.fromCharCode(parseInt(oct, 8)),
    )
    .replace(/\\(.)/g, "$1");
}

function decodePdfHex(hex: string) {
  const clean = hex.replace(/\s/g, "");
  if (clean.length < 4) return "";
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  return new TextDecoder("latin1").decode(bytes);
}

export function extractPdfTextLoose(bytes: Uint8Array) {
  const raw = new TextDecoder("latin1").decode(bytes);
  const parts: string[] = [];

  const tj = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tj.exec(raw))) {
    parts.push(decodePdfLiteral(match[1]));
  }

  const show = /\(((?:\\.|[^\\)])*)\)\s*'/g;
  while ((match = show.exec(raw))) {
    parts.push(decodePdfLiteral(match[1]));
  }

  const tjArray = /\[([\s\S]*?)\]\s*TJ/g;
  while ((match = tjArray.exec(raw))) {
    const inner = match[1];
    let line = "";
    const tokens = /\(((?:\\.|[^\\)])*)\)|<([0-9A-Fa-f\s]+)>/g;
    let token: RegExpExecArray | null;
    while ((token = tokens.exec(inner))) {
      line += token[1] ? decodePdfLiteral(token[1]) : decodePdfHex(token[2]);
    }
    if (line.trim()) parts.push(line);
  }

  if (parts.join("").replace(/\s/g, "").length < MIN_IMPORT_TEXT) {
    const readable = raw.match(/[\x20-\x7EÀ-ÿ]{5,}/g) ?? [];
    for (const chunk of readable) {
      if (
        /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(chunk) &&
        !/^%PDF|obj|endobj|stream|endstream|\/Type|\/Font|\/Length/.test(chunk)
      ) {
        parts.push(chunk);
      }
    }
  }

  return cleanExtractedText(parts.join("\n"));
}

export async function extractPdfText(data: ArrayBuffer | Uint8Array) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(bytes);
    const result = await extractText(pdf, { mergePages: true });
    const text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    const cleaned = cleanExtractedText(text ?? "");
    if (cleaned.length >= MIN_IMPORT_TEXT) return cleaned;
  } catch (error) {
    console.error("Lectura PDF:", error);
  }

  return extractPdfTextLoose(bytes);
}
