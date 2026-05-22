// Catalogo de achievements - 15 long-term goals
// reward.badgeId opcional, dispara unlock secundario

export type Achievement = {
  id: string;
  name: string;
  description: string;
  xp: number;
  points?: number;
  badgeId?: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "primeira-impressao",
    name: "Primeira impressao",
    description: "Voce criou sua conta na AKIRA MANGÁS.",
    xp: 50,
    icon: "新",
  },
  {
    id: "primeira-estante",
    name: "Adicionou primeiro a estante",
    description: "Seu primeiro volume foi pra estante.",
    xp: 50,
    icon: "棚",
  },
  {
    id: "primeira-review",
    name: "Primeira review",
    description: "Voce escreveu sua primeira resenha.",
    xp: 100,
    badgeId: "primeira-resenha",
    icon: "評",
  },
  {
    id: "streak-7",
    name: "Streak 7 dias",
    description: "Voce visitou a loja por 7 dias seguidos.",
    xp: 100,
    badgeId: "habitual",
    icon: "週",
  },
  {
    id: "streak-30",
    name: "Streak 30 dias",
    description: "Voce e parte da paisagem agora.",
    xp: 500,
    badgeId: "fanatico",
    icon: "月",
  },
  {
    id: "comprou-10-volumes",
    name: "Comprou 10 volumes",
    description: "Dez volumes na coleta.",
    xp: 200,
    points: 100,
    icon: "拾",
  },
  {
    id: "primeira-serie-completa",
    name: "Completou primeira serie",
    description: "Sua primeira serie do inicio ao fim.",
    xp: 300,
    badgeId: "completista",
    icon: "完",
  },
  {
    id: "carteira-cheia",
    name: "Carteira cheia",
    description: "Voce acumulou 500 pontos.",
    xp: 150,
    icon: "金",
  },
  {
    id: "explorador-generos",
    name: "Explorador de generos",
    description: "Voce navegou por 5 generos diferentes.",
    xp: 100,
    badgeId: "explorador",
    icon: "探",
  },
  {
    id: "amante-mangaka",
    name: "Amante de mangakas",
    description: "Voce visitou 5 paginas de autores.",
    xp: 100,
    badgeId: "mangaka-lover",
    icon: "画",
  },
  {
    id: "tier-s-unlocked",
    name: "Tier S desbloqueado",
    description: "Voce alcancou o nivel 50.",
    xp: 1000,
    badgeId: "tier-s",
    icon: "S",
  },
  {
    id: "biblioteca-pessoal",
    name: "Biblioteca pessoal",
    description: "Sua estante tem 50 itens.",
    xp: 400,
    badgeId: "colecionador",
    icon: "集",
  },
  {
    id: "maratonista",
    name: "Maratonista",
    description: "10 volumes comprados em 1 mes.",
    xp: 250,
    badgeId: "maratona-san",
    icon: "走",
  },
  {
    id: "wishlist-cheia",
    name: "Lista de desejos cheia",
    description: "20 itens na sua wishlist.",
    xp: 150,
    badgeId: "wishlist-grande",
    icon: "願",
  },
  {
    id: "sobrevivente-neo-tokyo",
    name: "Sobrevivente de Neo-Tokyo",
    description: "Voce desbloqueou 10 badges.",
    xp: 500,
    badgeId: "neo-tokyo",
    icon: "都",
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
