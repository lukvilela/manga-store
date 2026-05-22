import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MANGADEX = "https://api.mangadex.org";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type CoverMap = Record<number, string>;

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      await sleep(500 + i * 500);
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      if (i < retries - 1) await sleep(1500);
    }
  }
  return null;
}

async function findMangaId(
  searches: string[],
): Promise<{ id: string; lastVolume: number | null } | null> {
  for (const title of searches) {
    const res = await fetchWithRetry(
      `${MANGADEX}/manga?title=${encodeURIComponent(title)}&limit=10&contentRating[]=safe&contentRating[]=suggestive`,
    );
    if (!res) continue;
    const data = (await res.json()) as {
      data: Array<{
        id: string;
        attributes: {
          title: Record<string, string>;
          altTitles: Array<Record<string, string>>;
          lastVolume: string | null;
        };
      }>;
    };
    if (!data.data?.length) continue;

    // Prefer exact match checking all titles and altTitles
    const exact = data.data.find((m) => {
      const allTitles = [
        ...Object.values(m.attributes.title),
        ...m.attributes.altTitles.flatMap((t) => Object.values(t)),
      ].map((t) => t.toLowerCase().trim());
      return allTitles.some((t) => t === title.toLowerCase().trim());
    });
    const match = exact ?? data.data[0];
    const lastVolume = match.attributes.lastVolume
      ? parseInt(match.attributes.lastVolume)
      : null;
    return { id: match.id, lastVolume };
  }
  return null;
}

async function fetchAllCoversWithRetry(mangaId: string): Promise<CoverMap> {
  const covers: CoverMap = {};
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetchWithRetry(
      `${MANGADEX}/cover?manga[]=${mangaId}&order[volume]=asc&limit=${limit}&offset=${offset}`,
    );
    if (!res) break;
    const data = (await res.json()) as {
      data: Array<{ attributes: { volume: string | null; fileName: string } }>;
      total: number;
    };

    let seq = offset + 1;
    for (const c of data.data) {
      const vol = Number(c.attributes.volume);
      const key = Number.isInteger(vol) && vol >= 1 ? vol : seq;
      if (!covers[key]) {
        covers[key] = `https://uploads.mangadex.org/covers/${mangaId}/${c.attributes.fileName}.512.jpg`;
      }
      seq++;
    }

    offset += data.data.length;
    if (offset >= data.total || data.data.length === 0) break;
  }

  return covers;
}

type SeedSeries = {
  slug: string;
  title: string;
  searches: string[];
  genre: string;
  publisher: string;
  author: string;
  basePrice: number;
  baseStock: number;
  themeColor: string;
  description: string;
};

const SERIES: SeedSeries[] = [
  {
    slug: "one-piece",
    title: "One Piece",
    searches: ["One Piece"],
    genre: "Aventura",
    publisher: "Panini",
    author: "Eiichiro Oda",
    basePrice: 34.9,
    baseStock: 12,
    themeColor: "#1d4ed8",
    description:
      "Monkey D. Luffy sonha em se tornar o Rei dos Piratas e parte em uma aventura para encontrar o lendário tesouro One Piece.",
  },
  {
    slug: "chainsaw-man",
    title: "Chainsaw Man",
    searches: ["Chainsaw Man"],
    genre: "Acao",
    publisher: "Panini",
    author: "Tatsuki Fujimoto",
    basePrice: 32.9,
    baseStock: 8,
    themeColor: "#ea580c",
    description:
      "Denji faz contratos, enfrenta demônios e vive no limite em uma obra caótica, brutal e surpreendentemente humana.",
  },
  {
    slug: "tokyo-ghoul",
    title: "Tokyo Ghoul",
    searches: ["Tokyo Ghoul"],
    genre: "Seinen",
    publisher: "Panini",
    author: "Sui Ishida",
    basePrice: 37.5,
    baseStock: 11,
    themeColor: "#9b1c1c",
    description:
      "Ken Kaneki sobrevive a um ataque de ghoul e desperta como meio-ghoul, preso entre dois mundos em uma Tóquio assombrada.",
  },
  {
    slug: "death-note",
    title: "Death Note",
    searches: ["Death Note"],
    genre: "Suspense",
    publisher: "JBC",
    author: "Tsugumi Ohba",
    basePrice: 32.5,
    baseStock: 9,
    themeColor: "#1e3a5f",
    description:
      "Light Yagami encontra um caderno sobrenatural capaz de matar qualquer pessoa cujo nome seja escrito nele.",
  },
  {
    slug: "vinland-saga",
    title: "Vinland Saga",
    searches: ["Vinland Saga"],
    genre: "Seinen",
    publisher: "Panini",
    author: "Makoto Yukimura",
    basePrice: 41.9,
    baseStock: 8,
    themeColor: "#92400e",
    description:
      "Thorfinn busca vingança contra Askeladd numa saga épica de batalhas, honra e redenção através dos mares do norte.",
  },
  {
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    searches: ["Jujutsu Kaisen", "呪術廻戦"],
    genre: "Shonen",
    publisher: "Panini",
    author: "Gege Akutami",
    basePrice: 33.9,
    baseStock: 10,
    themeColor: "#4c1d95",
    description:
      "Yuji Itadori engole um dedo maldito e se torna anfitrião de um demônio ancestral enquanto treina como exorcista.",
  },
  {
    slug: "beastars",
    title: "Beastars",
    searches: ["Beastars", "BEASTARS"],
    genre: "Seinen",
    publisher: "Panini",
    author: "Paru Itagaki",
    basePrice: 30.9,
    baseStock: 9,
    themeColor: "#1e4d5c",
    description:
      "Legoshi, um lobo tímido, questiona sua própria natureza ao se apaixonar por uma lebre em uma sociedade de animais antropomórficos.",
  },
  {
    slug: "demon-slayer",
    title: "Demon Slayer",
    searches: ["Kimetsu no Yaiba", "Demon Slayer"],
    genre: "Shonen",
    publisher: "Panini",
    author: "Koyoharu Gotouge",
    basePrice: 33.5,
    baseStock: 12,
    themeColor: "#065f46",
    description:
      "Tanjiro Kamado se torna um Caçador de Demônios após sua família ser massacrada e sua irmã transformada em demônio.",
  },
  {
    slug: "attack-on-titan",
    title: "Attack on Titan",
    searches: ["進撃の巨人", "Shingeki no Kyojin", "Attack on Titan"],
    genre: "Acao",
    publisher: "Panini",
    author: "Hajime Isayama",
    basePrice: 36.9,
    baseStock: 10,
    themeColor: "#374151",
    description:
      "A humanidade vive atrás de muros para sobreviver aos Titãs. Eren Yeager jura eliminá-los todos após testemunhar o pior.",
  },
  {
    slug: "berserk",
    title: "Berserk",
    searches: ["Berserk"],
    genre: "Seinen",
    publisher: "Panini",
    author: "Kentaro Miura",
    basePrice: 44.9,
    baseStock: 6,
    themeColor: "#1c1c2e",
    description:
      "Guts, o espadachim das trevas, percorre um mundo cruel em busca de vingança contra o deus demoníaco Griffith.",
  },
  {
    slug: "naruto",
    title: "Naruto",
    searches: ["Naruto"],
    genre: "Shonen",
    publisher: "Panini",
    author: "Masashi Kishimoto",
    basePrice: 28.9,
    baseStock: 14,
    themeColor: "#b45309",
    description:
      "Naruto Uzumaki, jovem ninja com uma raposa de nove caudas selada dentro de si, busca se tornar o Hokage.",
  },
  {
    slug: "vagabond",
    title: "Vagabond",
    searches: ["Vagabond"],
    genre: "Seinen",
    publisher: "Panini",
    author: "Takehiko Inoue",
    basePrice: 39.9,
    baseStock: 7,
    themeColor: "#78350f",
    description:
      "A jornada de Musashi Miyamoto, o maior espadachim do Japão feudal, em busca de perfeição marcial.",
  },
];

function calcPrice(base: number, vol: number) {
  return new Prisma.Decimal((base + ((vol - 1) % 3) * 0.65).toFixed(2));
}

function calcStock(base: number, vol: number): number {
  return Math.max(2, base - ((vol - 1) % 5) + (vol % 2 === 0 ? 2 : 0));
}

function buildSku(slug: string, vol: number): string {
  return `${slug.toUpperCase().replace(/-/g, "_")}_${String(vol).padStart(3, "0")}`;
}

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@akiramangas.local" },
    update: { name: "Admin Loja", role: "ADMIN" },
    create: {
      email: "admin@akiramangas.local",
      name: "Admin Loja",
      role: "ADMIN",
      passwordHash: "trocar-em-producao",
    },
  });

  for (const serie of SERIES) {
    console.log(`\n▶ ${serie.title}`);

    const manga = await findMangaId(serie.searches);
    if (!manga) {
      console.log("  ✗ Manga não encontrado na MangaDex, pulando capas");
    }

    let covers: CoverMap = {};
    if (manga) {
      covers = await fetchAllCoversWithRetry(manga.id);
      console.log(
        `  ✓ ${Object.keys(covers).length} capas | último volume: ${manga.lastVolume ?? "?"}`,
      );
    }

    // Volume count = max between covers found and lastVolume from API
    const coverCount = Object.keys(covers).length;
    const apiMax = manga?.lastVolume ?? 0;
    const volumeCount = Math.min(Math.max(coverCount, apiMax), 100); // max 100 por série

    if (volumeCount === 0) {
      console.log("  ✗ Nenhum volume encontrado, pulando");
      continue;
    }

    const serieRecord = await prisma.mangaSeries.upsert({
      where: { slug: serie.slug },
      update: {
        title: serie.title,
        genre: serie.genre,
        publisher: serie.publisher,
        author: serie.author,
        description: serie.description,
        themeColor: serie.themeColor,
      },
      create: {
        slug: serie.slug,
        title: serie.title,
        genre: serie.genre,
        publisher: serie.publisher,
        author: serie.author,
        description: serie.description,
        themeColor: serie.themeColor,
      },
    });

    for (let vol = 1; vol <= volumeCount; vol++) {
      const sku = buildSku(serie.slug, vol);
      const coverImage =
        covers[vol] ?? `/covers/${serie.slug}-vol-${vol}.svg`;

      await prisma.volume.upsert({
        where: { seriesId_number: { seriesId: serieRecord.id, number: vol } },
        update: {
          sku,
          title: `${serie.title} Vol. ${String(vol).padStart(2, "0")}`,
          price: calcPrice(serie.basePrice, vol),
          stock: calcStock(serie.baseStock, vol),
          coverImage,
          description: serie.description,
          isActive: true,
        },
        create: {
          seriesId: serieRecord.id,
          number: vol,
          sku,
          title: `${serie.title} Vol. ${String(vol).padStart(2, "0")}`,
          price: calcPrice(serie.basePrice, vol),
          stock: calcStock(serie.baseStock, vol),
          coverImage,
          description: serie.description,
          isActive: true,
        },
      });
    }

    console.log(`  ✓ ${volumeCount} volumes salvos`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Seed concluído!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
