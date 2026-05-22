/**
 * Tradutor EN -> PT-BR via MyMemory API (free, sem auth).
 *
 * Docs: https://mymemory.translated.net/doc/spec.php
 * Limites: 5000 chars/dia anon, 50000 com email. 500 chars por chamada.
 *
 * Usa Next ISR cache (revalidate 24h) pra evitar re-traduzir
 * sinopses ja vistas. Se a API quebrar (429, timeout, etc),
 * retorna o texto original sem propagar erro.
 *
 * Estrategia pra textos longos:
 * - Divide em chunks <= MAX_CHUNK por sentence boundary (. ou \n\n)
 * - Traduz cada chunk em paralelo (Promise.all)
 * - Junta com o separador original
 */

const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
const MAX_CHUNK = 480; // margem de seguranca abaixo de 500
const CACHE_TTL = 86400; // 24h

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
    match?: number;
  };
  responseStatus?: number;
  quotaFinished?: boolean;
  responseDetails?: string;
};

/**
 * Quebra texto em chunks <= maxLen preservando frase/paragrafo.
 * Primeiro tenta quebrar por \n\n, depois por . dentro de cada paragrafo.
 */
function chunkText(text: string, maxLen: number = MAX_CHUNK): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  const paragraphs = trimmed.split(/\n\n+/);

  for (const para of paragraphs) {
    if (para.length <= maxLen) {
      chunks.push(para);
      continue;
    }
    // Paragrafo grande -> quebra por sentence
    const sentences = para.split(/(?<=[.!?])\s+/);
    let buffer = "";
    for (const sent of sentences) {
      if (sent.length > maxLen) {
        // Sentenca monstro: corta na marra por palavras
        if (buffer) {
          chunks.push(buffer);
          buffer = "";
        }
        let remaining = sent;
        while (remaining.length > maxLen) {
          const cutAt = remaining.lastIndexOf(" ", maxLen);
          const idx = cutAt > 0 ? cutAt : maxLen;
          chunks.push(remaining.slice(0, idx));
          remaining = remaining.slice(idx).trim();
        }
        if (remaining) buffer = remaining;
        continue;
      }
      if ((buffer + " " + sent).trim().length > maxLen) {
        if (buffer) chunks.push(buffer);
        buffer = sent;
      } else {
        buffer = buffer ? `${buffer} ${sent}` : sent;
      }
    }
    if (buffer) chunks.push(buffer);
  }

  return chunks;
}

/**
 * Traduz um unico chunk (<= 500 chars) via MyMemory.
 * Retorna o texto original em caso de erro.
 */
async function translateChunk(text: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=en|pt-BR&de=akiramangas@example.com`;
    const res = await fetch(url, {
      next: { revalidate: CACHE_TTL },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[translate] MyMemory ${res.status} -> fallback original`);
      }
      return text;
    }

    const json = (await res.json()) as MyMemoryResponse;

    if (json.quotaFinished || json.responseStatus !== 200) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[translate] quota/status (${json.responseStatus}) -> fallback`);
      }
      return text;
    }

    const out = json.responseData?.translatedText;
    if (!out || typeof out !== "string") return text;

    // MyMemory as vezes devolve placeholders tipo "PLEASE SELECT TWO DISTINCT LANGUAGES"
    if (/PLEASE SELECT|MYMEMORY WARNING|INVALID/i.test(out)) return text;
    return out;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[translate] fetch failed:", e);
    }
    return text;
  }
}

/**
 * API publica principal. Traduz texto EN -> PT-BR.
 * Lida com textos curtos e longos transparentemente.
 */
export async function translateEnToPt(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const chunks = chunkText(text);
  if (chunks.length === 1) {
    return translateChunk(chunks[0]);
  }
  return translateLong(text);
}

/**
 * Traduz texto longo dividindo em chunks e processando em paralelo.
 * Preserva quebras de paragrafo (\n\n) na juncao final.
 */
export async function translateLong(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const paragraphs = text.trim().split(/\n\n+/);
  const translatedParas = await Promise.all(
    paragraphs.map(async (para) => {
      const chunks = chunkText(para);
      if (chunks.length === 1) return translateChunk(chunks[0]);
      const parts = await Promise.all(chunks.map(translateChunk));
      return parts.join(" ");
    }),
  );
  return translatedParas.join("\n\n");
}
