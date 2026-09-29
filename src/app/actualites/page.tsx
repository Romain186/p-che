import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { PageHero } from "@/components/ui";
import { news } from "@/data/news";
export const metadata: Metadata = { title: "Actualités", description: "Arrivages, sélections et actualités de Loire Pêche 42 à Balbigny." };
export default function ActualitesPage() { return <><PageHero eyebrow="La vie du magasin" title="Actualités & arrivages" copy="Retrouvez les nouveautés, sélections et conseils du magasin. Ces contenus de démonstration seront ensuite alimentés par Facebook."/><section className="section-pad bg-forest-50"><div className="container-site"><div className="mb-10 rounded-2xl bg-forest-100 p-4 text-sm text-forest-900"><strong>Données mock locales :</strong> aucun contenu n’est encore récupéré depuis Facebook.</div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{news.map(item => <NewsCard key={item.slug} item={item}/>)}</div></div></section></>; }
