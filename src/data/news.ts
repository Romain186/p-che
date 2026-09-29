export type NewsItem = {
  slug: string;
  category: "Arrivage" | "Conseil" | "Magasin" | "Événement";
  title: string;
  excerpt: string;
  date: string;
  body: string[];
  image: string;
  position?: string;
  facebookUrl?: string;
};

// Contenus fictifs de démonstration. Ils seront remplacés par les publications Facebook du magasin.
export const news: NewsItem[] = [
  {
    slug: "nouvel-arrivage-sakura",
    category: "Arrivage",
    title: "Nouvel arrivage Sakura",
    excerpt: "Découvrez les dernières références arrivées cette semaine au magasin.",
    date: "28 septembre 2026",
    image: "/images/tackle-flatlay.png",
    position: "42% 18%",
    body: [
      "Un nouvel arrivage Sakura vient de rejoindre les rayons du magasin. Plusieurs références sont disponibles pour compléter vos boîtes et préparer vos prochaines sorties.",
      "Passez directement au magasin pour découvrir la sélection et échanger avec l’équipe selon votre pratique.",
    ],
  },
  {
    slug: "nouveaux-leurres-en-magasin",
    category: "Arrivage",
    title: "Nouveaux leurres disponibles en magasin",
    excerpt: "De nouveaux profils et coloris à découvrir pour vos prochaines sessions carnassier.",
    date: "21 septembre 2026",
    image: "/images/universe-carnassier.png",
    body: [
      "La sélection carnassier s’enrichit de nouveaux leurres adaptés à différentes profondeurs et animations.",
      "Venez les voir en magasin : nous pourrons vous aider à choisir selon les poissons recherchés et les conditions rencontrées.",
    ],
  },
  {
    slug: "preparer-ouverture-carnassier",
    category: "Conseil",
    title: "Préparez l’ouverture du carnassier",
    excerpt: "Les vérifications utiles pour reprendre la saison avec un ensemble prêt et cohérent.",
    date: "14 septembre 2026",
    image: "/images/hero-loire.png",
    position: "65% center",
    body: [
      "Avant la première sortie, prenez le temps de contrôler votre tresse, vos bas de ligne et le réglage du frein.",
      "L’équipe peut vous accompagner au magasin pour vérifier la cohérence de votre ensemble et compléter uniquement ce qui est nécessaire.",
    ],
  },
  {
    slug: "horaires-exceptionnels",
    category: "Magasin",
    title: "Horaires exceptionnels cette semaine",
    excerpt: "Consultez les horaires du magasin avant de préparer votre visite.",
    date: "7 septembre 2026",
    image: "/images/store-interior.png",
    body: [
      "Les horaires peuvent ponctuellement évoluer à l’occasion d’un événement ou d’une fermeture exceptionnelle.",
      "Cette publication est une démonstration : les horaires réels restent ceux affichés sur la page Contact.",
    ],
  },
  {
    slug: "bien-preparer-session-carpe",
    category: "Conseil",
    title: "Bien préparer une session carpe",
    excerpt: "Organisation, confort et montages : quelques repères avant de partir au bord de l’eau.",
    date: "31 août 2026",
    image: "/images/universe-carpe.png",
    body: [
      "Une session réussie commence souvent par une préparation simple et méthodique du poste, des montages et des consommables.",
      "Passez au magasin pour échanger sur votre approche et identifier le matériel réellement utile.",
    ],
  },
  {
    slug: "rencontre-passionnes",
    category: "Événement",
    title: "Une matinée pour échanger entre passionnés",
    excerpt: "Un moment convivial au magasin autour des techniques et conditions de pêche locales.",
    date: "24 août 2026",
    image: "/images/universe-coup.png",
    body: [
      "Le magasin est aussi un lieu de rencontre où les pêcheurs peuvent partager leurs pratiques et leurs questions.",
      "Les prochains rendez-vous seront annoncés ici et relayés sur la page Facebook du magasin.",
    ],
  },
];
