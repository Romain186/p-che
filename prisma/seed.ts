import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  NewsPostSource,
  NewsPostStatus,
  PrismaClient,
} from "../src/generated/prisma/client";

const developmentNews = [
  {
    externalId: "dev-news-nouvel-arrivage-sakura",
    slug: "nouvel-arrivage-sakura",
    title: "Nouvel arrivage Sakura",
    excerpt: "Découvrez les dernières références arrivées cette semaine au magasin.",
    content:
      "Un nouvel arrivage Sakura vient de rejoindre les rayons du magasin. Plusieurs références sont disponibles pour compléter vos boîtes et préparer vos prochaines sorties.\n\nPassez directement au magasin pour découvrir la sélection et échanger avec l’équipe selon votre pratique.",
    mainImageUrl: "/images/tackle-flatlay.png",
    media: { category: "Arrivage", position: "42% 18%", development: true },
    publishedAt: new Date("2026-09-28T09:00:00.000Z"),
  },
  {
    externalId: "dev-news-preparation-ouverture-carnassier",
    slug: "preparation-ouverture-carnassier",
    title: "Préparation de l’ouverture du carnassier",
    excerpt: "Les vérifications utiles pour reprendre la saison avec un ensemble prêt et cohérent.",
    content:
      "Avant la première sortie, prenez le temps de contrôler votre tresse, vos bas de ligne et le réglage du frein.\n\nL’équipe peut vous accompagner au magasin pour vérifier la cohérence de votre ensemble et compléter uniquement ce qui est nécessaire.",
    mainImageUrl: "/images/hero-loire.png",
    media: { category: "Conseil", position: "65% center", development: true },
    publishedAt: new Date("2026-09-14T09:00:00.000Z"),
  },
  {
    externalId: "dev-news-nouveautes-magasin",
    slug: "nouveautes-magasin",
    title: "Nouveautés disponibles en magasin",
    excerpt: "Une sélection de nouveautés à découvrir pour préparer vos prochaines sorties.",
    content:
      "De nouvelles références de démonstration sont présentées dans cette actualité de développement.\n\nCes données seront remplacées plus tard par les contenus réels issus du magasin ou de Facebook.",
    mainImageUrl: "/images/store-interior.png",
    media: { category: "Magasin", development: true },
    publishedAt: new Date("2026-09-07T09:00:00.000Z"),
  },
] as const;

const developmentReviews = [
  {
    externalId: "dev-google-review-a",
    authorName: "Profil test A",
    rating: 5,
    text: "[DÉVELOPPEMENT] Avis fictif destiné à vérifier l’affichage et la future synchronisation Google.",
    relativeDate: "Donnée de développement",
    visitDate: new Date("2026-09-20T09:00:00.000Z"),
  },
  {
    externalId: "dev-google-review-b",
    authorName: "Profil test B",
    rating: 4,
    text: "[DÉVELOPPEMENT] Contenu fictif sans lien avec un véritable client du magasin.",
    relativeDate: "Donnée de développement",
    visitDate: new Date("2026-09-13T09:00:00.000Z"),
  },
  {
    externalId: "dev-google-review-c",
    authorName: "Profil test C",
    rating: 5,
    text: "[DÉVELOPPEMENT] Exemple technique utilisé uniquement pour préparer la couche de données.",
    relativeDate: "Donnée de développement",
    visitDate: new Date("2026-09-06T09:00:00.000Z"),
  },
] as const;

function validateSeedData() {
  if (developmentNews.length !== 3 || developmentReviews.length !== 3) {
    throw new Error("Le seed doit contenir exactement 3 actualités et 3 avis de développement.");
  }

  if (developmentReviews.some((review) => review.rating < 4 || review.rating > 5)) {
    throw new Error("Les avis de développement doivent être notés 4 ou 5 étoiles.");
  }

  if (developmentReviews.some((review) => !review.externalId.startsWith("dev-google-review-") || !review.text.startsWith("[DÉVELOPPEMENT]"))) {
    throw new Error("Les avis fictifs doivent être clairement identifiables comme données de développement.");
  }

  const identifiers = [
    ...developmentNews.map((item) => item.externalId),
    ...developmentReviews.map((item) => item.externalId),
  ];

  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error("Les identifiants externes du seed doivent être uniques.");
  }
}

async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL doit être renseignée pour exécuter le seed Prisma.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    for (const item of developmentNews) {
      await prisma.newsPost.upsert({
        where: { externalId: item.externalId },
        update: {
          ...item,
          source: NewsPostSource.MANUAL,
          status: NewsPostStatus.PUBLISHED,
        },
        create: {
          ...item,
          source: NewsPostSource.MANUAL,
          status: NewsPostStatus.PUBLISHED,
        },
      });
    }

    for (const review of developmentReviews) {
      await prisma.googleReview.upsert({
        where: { externalId: review.externalId },
        update: review,
        create: review,
      });
    }

    console.info(
      `Seed terminé : ${developmentNews.length} actualités et ${developmentReviews.length} avis de développement.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  validateSeedData();

  if (process.argv.includes("--check")) {
    console.info(
      `Seed valide : ${developmentNews.length} actualités et ${developmentReviews.length} avis fictifs conformes.`,
    );
    return;
  }

  await seedDatabase();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
