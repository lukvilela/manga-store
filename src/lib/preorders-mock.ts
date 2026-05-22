/**
 * Pre-vendas mock — determinismo via hash do mangaId.
 *
 * Se o manga ainda esta publicando, gera o "proximo volume" com:
 *  - releaseDate entre 7 e 90 dias a partir de hoje
 *  - percentReserved entre 15 e 85
 *
 * NAO usa Math.random — usa hash do id pra mesmo manga sempre cair
 * no mesmo timing (importante pra SSR consistente).
 *
 * O countdown em si (segundos restantes) eh recalculado client-side
 * dentro do componente <PreorderBanner />.
 */

export type Preorder = {
  mangaId: number;
  mangaTitle: string;
  nextVolumeNumber: number;
  releaseDate: Date;
  daysUntil: number;
  percentReserved: number;
};

function hash(n: number): number {
  // hash leve, determinístico
  let x = n | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return Math.abs(x | 0);
}

export function getPreorder(
  mangaId: number,
  mangaTitle: string,
  totalVolumes: number | null,
): Preorder {
  const h = hash(mangaId);
  // 7..90 dias
  const daysUntil = 7 + (h % 84);
  const releaseDate = new Date();
  releaseDate.setUTCHours(0, 0, 0, 0);
  releaseDate.setUTCDate(releaseDate.getUTCDate() + daysUntil);
  // 15..85 %
  const percentReserved = 15 + (hash(h + 7) % 71);
  const baseVol = totalVolumes && totalVolumes > 0 ? totalVolumes : 0;

  return {
    mangaId,
    mangaTitle,
    nextVolumeNumber: baseVol + 1,
    releaseDate,
    daysUntil,
    percentReserved,
  };
}
