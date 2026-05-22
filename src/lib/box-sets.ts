/**
 * Geradores dinamicos de pacotes/colecoes/edicoes especiais.
 *
 * Tudo calculado em runtime — sem dados estaticos. Premissa:
 *  - Volume avulso = R$ 29,90 base
 *  - Box set = 15% off no total
 *  - Edicao colecionador = 50% mais cara + brindes
 *  - Starting pack = 10% off em 3 volumes representativos
 *
 * Determinismo: qualquer hash usado parte do mangaId pra renderizar
 * sempre igual no SSR/cliente (sem Date.now / Math.random).
 */

export type BoxSet = {
  mangaId: number;
  mangaTitle: string;
  totalVolumes: number;
  basePrice: number;
  totalRegular: number;
  discountPct: number;
  totalDiscounted: number;
  savings: number;
  includedVolumes: number[];
};

export function getBoxSet(
  mangaId: number,
  mangaTitle: string,
  totalVolumes: number,
  basePrice = 29.9,
): BoxSet {
  const safeTotal = Math.max(1, totalVolumes);
  const discountPct = 15;
  const totalRegular = +(basePrice * safeTotal).toFixed(2);
  const totalDiscounted = +(totalRegular * (1 - discountPct / 100)).toFixed(2);
  const savings = +(totalRegular - totalDiscounted).toFixed(2);
  const includedVolumes = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return {
    mangaId,
    mangaTitle,
    totalVolumes: safeTotal,
    basePrice,
    totalRegular,
    discountPct,
    totalDiscounted,
    savings,
    includedVolumes,
  };
}

export type CollectorEdition = {
  mangaId: number;
  mangaTitle: string;
  collectorPrice: number;
  regularPrice: number;
  premiumPct: number;
  bonuses: string[];
};

export function getCollectorEdition(
  mangaId: number,
  mangaTitle: string,
  basePrice = 29.9,
): CollectorEdition {
  const regularPrice = basePrice;
  const premiumPct = 50;
  const collectorPrice = +(regularPrice * (1 + premiumPct / 100)).toFixed(2);

  const bonuses = [
    "Capa dura com sobrecapa exclusiva",
    "Poster A3 dobrado",
    "Cards colecionaveis (4 unidades)",
    "Marcador metalico gravado",
  ];

  return {
    mangaId,
    mangaTitle,
    collectorPrice,
    regularPrice,
    premiumPct,
    bonuses,
  };
}

export type StartingPack = {
  genreId: number;
  basePrice: number;
  unitPrice: number;
  totalRegular: number;
  totalDiscounted: number;
  discountPct: number;
  savings: number;
};

/**
 * Calcula precos pra um "starting pack" de 3 volumes representativos.
 * NOTA: nao busca os mangas — quem chama passa os 3 ids/cards via UI.
 * Aqui so retornamos o pricing.
 */
export function getStartingPack(genreId: number, basePrice = 29.9): StartingPack {
  const unitPrice = basePrice;
  const totalRegular = +(unitPrice * 3).toFixed(2);
  const discountPct = 10;
  const totalDiscounted = +(totalRegular * (1 - discountPct / 100)).toFixed(2);
  const savings = +(totalRegular - totalDiscounted).toFixed(2);

  return {
    genreId,
    basePrice,
    unitPrice,
    totalRegular,
    totalDiscounted,
    discountPct,
    savings,
  };
}

/** Helper de formatacao BRL — evita dependencia. */
export function formatBRL(v: number): string {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}
