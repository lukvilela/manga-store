// Catalogo de badges - 20 itens hardcoded
// Cores por raridade: common=cyan, rare=yellow, epic=pink, legendary=red

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type Badge = {
  id: string;
  name: string;
  icon: string; // emoji ou kanji
  description: string;
  requirement: string;
  rarity: BadgeRarity;
};

export const RARITY_COLORS: Record<BadgeRarity, { text: string; border: string; glow: string; bg: string }> = {
  common: {
    text: "text-[var(--akira-cyan)]",
    border: "border-[var(--akira-cyan)]",
    glow: "glow-cyan",
    bg: "bg-[var(--akira-cyan)]/10",
  },
  rare: {
    text: "text-[var(--akira-yellow)]",
    border: "border-[var(--akira-yellow)]",
    glow: "glow-yellow",
    bg: "bg-[var(--akira-yellow)]/10",
  },
  epic: {
    text: "text-[var(--akira-pink)]",
    border: "border-[var(--akira-pink)]",
    glow: "glow-pink",
    bg: "bg-[var(--akira-pink)]/10",
  },
  legendary: {
    text: "text-[var(--akira-red)]",
    border: "border-[var(--akira-red)]",
    glow: "glow-red",
    bg: "bg-[var(--akira-red)]/10",
  },
};

export const BADGES: Badge[] = [
  {
    id: "otaku-iniciante",
    name: "Otaku Iniciante",
    icon: "初",
    description: "Sua jornada como leitor comecou.",
    requirement: "Faca sua primeira compra",
    rarity: "common",
  },
  {
    id: "completista-shonen",
    name: "Completista Shounen",
    icon: "少",
    description: "Voce coleciona series shounen ate o fim.",
    requirement: "Tenha 3 series shounen completas na estante",
    rarity: "epic",
  },
  {
    id: "death-note-master",
    name: "Death Note Master",
    icon: "死",
    description: "Voce escreveu seu proprio destino.",
    requirement: "Complete a serie Death Note",
    rarity: "legendary",
  },
  {
    id: "maratona-san",
    name: "Maratona-san",
    icon: "走",
    description: "Velocidade de leitura sobre-humana.",
    requirement: "Compre 10 volumes em 1 mes",
    rarity: "rare",
  },
  {
    id: "tier-s",
    name: "Tier S",
    icon: "S",
    description: "Voce alcancou o ranking mais alto.",
    requirement: "Atinja o nivel 50",
    rarity: "legendary",
  },
  {
    id: "noctambulo",
    name: "Noctambulo",
    icon: "夜",
    description: "Leitor de madrugada, alma de Neo-Tokyo.",
    requirement: "Visite a loja entre 0h e 3h",
    rarity: "rare",
  },
  {
    id: "velocista",
    name: "Velocista",
    icon: "速",
    description: "Caixa registrando sem parar.",
    requirement: "Faca 5 compras em 24h",
    rarity: "epic",
  },
  {
    id: "colecionador",
    name: "Colecionador",
    icon: "集",
    description: "Sua estante virou biblioteca.",
    requirement: "Tenha 50 itens na estante",
    rarity: "epic",
  },
  {
    id: "otomo-fan",
    name: "Otomo Fan",
    icon: "大",
    description: "Voce conhece o mestre de Neo-Tokyo.",
    requirement: "Visite a pagina do autor Otomo Katsuhiro",
    rarity: "rare",
  },
  {
    id: "mangaka-lover",
    name: "Mangaka Lover",
    icon: "画",
    description: "Voce respeita cada traco.",
    requirement: "Visite 5 paginas de autores diferentes",
    rarity: "common",
  },
  {
    id: "explorador",
    name: "Explorador",
    icon: "探",
    description: "Suas leituras nao tem fronteira.",
    requirement: "Visite 5 generos diferentes",
    rarity: "common",
  },
  {
    id: "habitual",
    name: "Habitual",
    icon: "習",
    description: "Voce ja virou rotina por aqui.",
    requirement: "Mantenha streak de 7 dias",
    rarity: "rare",
  },
  {
    id: "fanatico",
    name: "Fanatico",
    icon: "狂",
    description: "Nada te separa dos seus mangas.",
    requirement: "Mantenha streak de 30 dias",
    rarity: "legendary",
  },
  {
    id: "sortudo",
    name: "Sortudo",
    icon: "運",
    description: "A roleta caiu pra voce.",
    requirement: "Ganhe esse badge na Loot Box",
    rarity: "epic",
  },
  {
    id: "primeira-resenha",
    name: "Primeira Resenha",
    icon: "評",
    description: "Voce comecou a compartilhar.",
    requirement: "Publique sua primeira review",
    rarity: "common",
  },
  {
    id: "wishlist-grande",
    name: "Wishlist Gigante",
    icon: "願",
    description: "Sua lista de desejos esta enorme.",
    requirement: "Tenha 20 itens na wishlist",
    rarity: "rare",
  },
  {
    id: "primeira-compra",
    name: "Primeira Compra",
    icon: "買",
    description: "Bem-vindo a Neo-Tokyo.",
    requirement: "Receba seu primeiro pedido",
    rarity: "common",
  },
  {
    id: "veterano",
    name: "Veterano",
    icon: "老",
    description: "Voce ja viu muito por aqui.",
    requirement: "Atinja o nivel 25",
    rarity: "epic",
  },
  {
    id: "completista",
    name: "Completista",
    icon: "完",
    description: "Voce nao deixa serie pela metade.",
    requirement: "Complete sua primeira serie",
    rarity: "rare",
  },
  {
    id: "neo-tokyo",
    name: "Cidadao de Neo-Tokyo",
    icon: "都",
    description: "Voce conhece cada beco da cidade.",
    requirement: "Desbloqueie 10 badges",
    rarity: "legendary",
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
