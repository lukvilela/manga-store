// Calculo de frete por UF + peso simulado.
// Loja origem: SP capital.
// Tabela de zonas baseada em logistica real Correios (aproximado).

export type ShippingMethod = "PAC" | "SEDEX" | "PICKUP";

export type ShippingQuote = {
  method: ShippingMethod;
  label: string;
  kanji: string;
  price: number;
  eta: string;
  etaDays: number;
  available: boolean;
  reason?: string;
};

const ZONES: Record<string, { name: string; pacBase: number; sedexBase: number; pacDays: number; sedexDays: number }> = {
  // Mesma cidade / regiao metropolitana (SP capital + GBA)
  ZONE_LOCAL: { name: "Local SP", pacBase: 9.9, sedexBase: 14.9, pacDays: 2, sedexDays: 1 },
  // Sudeste (SP interior, MG, RJ, ES)
  ZONE_SUDESTE: { name: "Sudeste", pacBase: 15.9, sedexBase: 24.9, pacDays: 5, sedexDays: 2 },
  // Sul (PR, SC, RS)
  ZONE_SUL: { name: "Sul", pacBase: 19.9, sedexBase: 32.9, pacDays: 7, sedexDays: 3 },
  // Centro-Oeste (DF, GO, MT, MS)
  ZONE_CO: { name: "Centro-Oeste", pacBase: 22.9, sedexBase: 37.9, pacDays: 8, sedexDays: 3 },
  // Nordeste (9 estados)
  ZONE_NE: { name: "Nordeste", pacBase: 27.9, sedexBase: 47.9, pacDays: 10, sedexDays: 4 },
  // Norte (7 estados)
  ZONE_NO: { name: "Norte", pacBase: 33.9, sedexBase: 59.9, pacDays: 12, sedexDays: 5 },
};

const UF_TO_ZONE: Record<string, keyof typeof ZONES> = {
  // Sudeste
  SP: "ZONE_SUDESTE", MG: "ZONE_SUDESTE", RJ: "ZONE_SUDESTE", ES: "ZONE_SUDESTE",
  // Sul
  PR: "ZONE_SUL", SC: "ZONE_SUL", RS: "ZONE_SUL",
  // Centro-Oeste
  DF: "ZONE_CO", GO: "ZONE_CO", MT: "ZONE_CO", MS: "ZONE_CO",
  // Nordeste
  BA: "ZONE_NE", SE: "ZONE_NE", AL: "ZONE_NE", PE: "ZONE_NE", PB: "ZONE_NE",
  RN: "ZONE_NE", CE: "ZONE_NE", PI: "ZONE_NE", MA: "ZONE_NE",
  // Norte
  PA: "ZONE_NO", TO: "ZONE_NO", AP: "ZONE_NO", AM: "ZONE_NO", RR: "ZONE_NO", RO: "ZONE_NO", AC: "ZONE_NO",
};

// CEP local SP (capital + GBA): 01xxx-09xxx, alguns 11xxx-13xxx
function isLocalSP(uf: string, cep: string): boolean {
  if (uf !== "SP") return false;
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return false;
  const prefix = parseInt(cleaned.slice(0, 5), 10);
  return prefix >= 1000 && prefix <= 9899;
}

const PICKUP_UF = "SP"; // retirada so em SP

const FREE_SHIPPING_THRESHOLD = 250;

export type QuoteInput = {
  uf: string;
  cep: string;
  subtotal: number;
  weightKg?: number; // peso simulado (default 0.4kg por volume)
};

export function calcShippingQuotes(input: QuoteInput): ShippingQuote[] {
  const { uf, cep, subtotal, weightKg = 0.4 } = input;

  const zoneKey = isLocalSP(uf, cep) ? "ZONE_LOCAL" : UF_TO_ZONE[uf?.toUpperCase()] ?? "ZONE_SUDESTE";
  const zone = ZONES[zoneKey];

  // Ajuste por peso: cada 200g acima de 400g adiciona 10%
  const weightMultiplier = weightKg > 0.4 ? 1 + ((weightKg - 0.4) / 0.2) * 0.1 : 1;

  // Frete gratis acima do threshold (so PAC)
  const isFreePac = subtotal >= FREE_SHIPPING_THRESHOLD;

  const pacPrice = isFreePac ? 0 : Math.round(zone.pacBase * weightMultiplier * 100) / 100;
  const sedexPrice = Math.round(zone.sedexBase * weightMultiplier * 100) / 100;

  const quotes: ShippingQuote[] = [
    {
      method: "PAC",
      label: "PAC Correios",
      kanji: "便",
      price: pacPrice,
      eta: `${zone.pacDays}-${zone.pacDays + 2} dias uteis`,
      etaDays: zone.pacDays + 2,
      available: true,
      reason: isFreePac ? `Gratis em compras acima de R$ ${FREE_SHIPPING_THRESHOLD}` : undefined,
    },
    {
      method: "SEDEX",
      label: "SEDEX Expresso",
      kanji: "急",
      price: sedexPrice,
      eta: zone.sedexDays === 1 ? "Proximo dia util" : `${zone.sedexDays}-${zone.sedexDays + 1} dias uteis`,
      etaDays: zone.sedexDays + 1,
      available: true,
    },
    {
      method: "PICKUP",
      label: "Retirada na loja",
      kanji: "店",
      price: 0,
      eta: "Disponivel em 24h",
      etaDays: 1,
      available: uf?.toUpperCase() === PICKUP_UF,
      reason: uf && uf.toUpperCase() !== PICKUP_UF ? "Disponivel apenas em SP" : undefined,
    },
  ];

  return quotes;
}

export function getZoneName(uf: string, cep: string): string {
  const zoneKey = isLocalSP(uf, cep) ? "ZONE_LOCAL" : UF_TO_ZONE[uf?.toUpperCase()] ?? "ZONE_SUDESTE";
  return ZONES[zoneKey].name;
}
