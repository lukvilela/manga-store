/**
 * Wrapper sobre manga-api.ts que injeta sinopse/background traduzidos pra PT-BR.
 *
 * Estrategia:
 * - So traduz na pagina de detalhe (1 manga por vez) — nao na home (80+ mangas
 *   estouraria rate limit).
 * - Cache Next ISR 24h na chamada do MyMemory (ver translate.ts).
 * - Fallback transparente: se traducao falhar, devolve texto original e flag false.
 */

import { getMangaById, type JikanManga } from "./manga-api";
import { translateLong } from "./translate";

export type JikanMangaPt = JikanManga & {
  synopsisPt?: string | null;
  backgroundPt?: string | null;
  synopsisTranslated?: boolean;
  backgroundTranslated?: boolean;
};

/**
 * Helper que recebe texto e retorna { translated, didTranslate }.
 * didTranslate=false se a saida e identica a entrada (provavel falha/cache miss).
 */
async function translateMaybe(
  text: string | null | undefined,
): Promise<{ value: string | null; translated: boolean }> {
  if (!text) return { value: text ?? null, translated: false };
  try {
    const out = await translateLong(text);
    const didTranslate = out !== text && out.trim().length > 0;
    return { value: out, translated: didTranslate };
  } catch {
    return { value: text, translated: false };
  }
}

/**
 * Mesma assinatura do getMangaById, mas com sinopse + background ja em PT-BR.
 * Mantem campos originais (synopsis, background) intactos pra metadata SEO
 * e substitui apenas no objeto retornado.
 */
export async function getMangaByIdWithPtSynopsis(id: number): Promise<JikanMangaPt | null> {
  const manga = await getMangaById(id);
  if (!manga) return null;

  // Traduz sinopse e background em paralelo
  const [synRes, bgRes] = await Promise.all([
    translateMaybe(manga.synopsis),
    translateMaybe(manga.background),
  ]);

  return {
    ...manga,
    synopsis: synRes.value, // sobrescreve com PT pra que componentes existentes peguem traduzido
    background: bgRes.value,
    synopsisPt: synRes.value,
    backgroundPt: bgRes.value,
    synopsisTranslated: synRes.translated,
    backgroundTranslated: bgRes.translated,
  };
}

/** Helper standalone — exposto pra outras pages que queiram traduzir on-demand */
export async function translateBackground(text: string | null | undefined): Promise<string | null> {
  if (!text) return text ?? null;
  const out = await translateMaybe(text);
  return out.value;
}
