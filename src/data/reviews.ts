export type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorProfileUrl?: string;
  rating: number;
  text: string;
  relativeDate?: string;
  visitDate?: string;
  googleMapsUrl?: string;
  isMock?: boolean;
};

export type GoogleReviewSummary = {
  rating: number;
  total: number;
};

export const googleReviewSummary: GoogleReviewSummary = {
  rating: 4.4,
  total: 17,
};

export const googleReviewsPreview = {
  isMock: true,
  label: "Aperçu de la future intégration des avis Google",
} as const;

// Placeholders de structure uniquement : aucun texte, nom ou profil ne provient d'un véritable avis.
// Ce tableau sera remplacé par les données renvoyées par getGoogleReviews() lors de l'étape backend.
export const reviewPlaceholders: GoogleReview[] = [
  {
    id: "placeholder-advice",
    authorName: "Nom public Google",
    rating: 5,
    text: "Le texte de l’avis Google apparaîtra ici, avec une longueur limitée pour préserver la lisibilité de la page d’accueil.",
    relativeDate: "Date relative",
    visitDate: "Date de visite, si disponible",
    isMock: true,
  },
  {
    id: "placeholder-welcome",
    authorName: "Nom public Google",
    rating: 4,
    text: "Cet emplacement accueillera un avis sélectionné automatiquement parmi les contributions Google notées quatre ou cinq étoiles.",
    relativeDate: "Date relative",
    isMock: true,
  },
  {
    id: "placeholder-service",
    authorName: "Nom public Google",
    rating: 5,
    text: "La photo, le nom public, les dates et les liens seront renseignés uniquement à partir des données fournies par Google.",
    visitDate: "Date de visite, si disponible",
    isMock: true,
  },
  {
    id: "placeholder-filter-test",
    authorName: "Nom public Google",
    rating: 3,
    text: "Ce placeholder technique confirme que les notes inférieures à quatre étoiles ne sont pas affichées dans la sélection.",
    isMock: true,
  },
];

export function filterDisplayedReviews(reviews: GoogleReview[]) {
  return reviews.filter((review) => review.rating >= 4);
}
