/**
 * Mock deterministico de estoque por volume.
 *
 * Hash do volumeId define o "bucket" — entao o mesmo volume mostra sempre
 * o mesmo estoque ao longo das sessoes (sem flicker entre reload). 100% pure
 * function, sem fetch nem localStorage.
 *
 * Distribuicao:
 *   - 70% in_stock      (21-80 unidades)
 *   - 20% low           (5-20 unidades)
 *   - 8%  last_units    (1-4 unidades)
 *   - 2%  out_of_stock  (0)
 */

export type StockLevel = "in_stock" | "low" | "last_units" | "out_of_stock";

export type StockInfo = {
  level: StockLevel;
  units: number;
  message: string;
};

/**
 * Hash deterministico simples (djb2 variant). Retorna inteiro positivo.
 * Mesmo input gera sempre o mesmo output — sem Math.random.
 */
function hashVolumeId(volumeId: string): number {
  let h = 5381;
  for (let i = 0; i < volumeId.length; i++) {
    // (h * 33) ^ char — bitshift mantem 32 bits, >>> 0 forca unsigned
    h = (((h << 5) + h) ^ volumeId.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getStockLevel(volumeId: string): StockInfo {
  if (!volumeId) {
    return { level: "in_stock", units: 50, message: "Em estoque" };
  }

  const hash = hashVolumeId(volumeId);
  // bucket 0-99 — usa modulo 100 pra distribuir percentual
  const bucket = hash % 100;
  // sub-hash pra escolher unidades dentro da faixa (independente do bucket)
  const subHash = (hash >>> 7) % 1000;

  if (bucket < 2) {
    // 2% esgotado
    return { level: "out_of_stock", units: 0, message: "Esgotado" };
  }

  if (bucket < 10) {
    // 8% ultimas unidades — 1 a 4
    const units = 1 + (subHash % 4);
    return {
      level: "last_units",
      units,
      message: `Ultimas ${units} unidade${units > 1 ? "s" : ""}!`,
    };
  }

  if (bucket < 30) {
    // 20% poucas — 5 a 20
    const units = 5 + (subHash % 16);
    return {
      level: "low",
      units,
      message: `Poucas unidades · ${units} disponivel${units > 1 ? "s" : ""}`,
    };
  }

  // 70% em estoque — 21 a 80
  const units = 21 + (subHash % 60);
  return { level: "in_stock", units, message: "Em estoque" };
}
