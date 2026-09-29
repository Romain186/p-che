export const store = {
  name: "Loire Pêche 42",
  phone: "04 77 28 18 51",
  phoneHref: "tel:+33477281851",
  addressLine: "1 Rue Claude Pilaud",
  postalCode: "42510",
  city: "Balbigny",
  fullAddress: "1 Rue Claude Pilaud, 42510 Balbigny",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=1+Rue+Claude+Pilaud,+42510+Balbigny",
  // Recherche Google temporaire à remplacer par l'URL directe de la fiche établissement.
  googleReviewsUrl: "https://www.google.com/search?q=Loire+P%C3%AAche+42+Balbigny+avis",
  hours: [["Lundi", "Fermé"], ["Mardi", "9h–12h / 14h–19h"], ["Mercredi", "9h–12h / 14h–19h"], ["Jeudi", "9h–12h / 14h–19h"], ["Vendredi", "9h–12h / 14h–19h"], ["Samedi", "9h–12h / 14h–19h"], ["Dimanche", "Fermé"]],
} as const;
export const navigation = [{ href: "/", label: "Accueil" }, { href: "/magasin", label: "Le magasin" }, { href: "/univers", label: "Nos univers" }, { href: "/marques", label: "Marques" }, { href: "/actualites", label: "Actualités" }, { href: "/contact", label: "Contact" }] as const;
