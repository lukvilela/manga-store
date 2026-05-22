/**
 * Metricas sociais mockadas — deterministicas por mangaId.
 *
 * Usa hash do ID pra gerar numero estavel: mesmo ID = mesmo numero
 * em todo render (server + client). Nada de Math.random — quebraria SSR.
 *
 * Inspiracao MAL/Letterboxd: "X estao lendo agora", "Y completaram",
 * "trending score Z/100".
 */

/** Hash determinístico de string → uint32 positivo. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0; // force int32
  }
  return Math.abs(h);
}

/** Hash com salt — usado pra gerar varios numeros independentes do mesmo ID. */
function hashWithSalt(input: string, salt: string): number {
  return hash(`${salt}::${input}`);
}

/** Mapeia hash pra intervalo [min, max] inclusivo. */
function inRange(seed: number, min: number, max: number): number {
  const span = max - min + 1;
  return min + (seed % span);
}

/**
 * Quantas pessoas estao "lendo agora" — 5 a 500.
 * Pulse vermelho na UI sinaliza atividade em tempo real.
 */
export function getReadingNow(mangaId: string | number): number {
  const seed = hashWithSalt(String(mangaId), "reading");
  return inRange(seed, 5, 500);
}

/**
 * Quantas pessoas completaram a leitura — 50 a 5000.
 * Geralmente bem maior que readingNow (acumulado histórico).
 */
export function getCompletedCount(mangaId: string | number): number {
  const seed = hashWithSalt(String(mangaId), "completed");
  return inRange(seed, 50, 5000);
}

/**
 * Score de trending 0-100. Quanto mais alto, mais "em alta".
 * Mock — em produção viria de algoritmo de momentum.
 */
export function getTrendingScore(mangaId: string | number): number {
  const seed = hashWithSalt(String(mangaId), "trending");
  return inRange(seed, 0, 100);
}

/** Formata numero compacto: 1500 → "1.5k", 1_200_000 → "1.2M". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
