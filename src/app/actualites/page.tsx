import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { PageHero } from "@/components/ui";
import { getPublishedNews } from "@/lib/data/news";
export const metadata: Metadata = { title: "Actualités", description: "Arrivages, sélections et actualités de Loire Pêche 42 à Balbigny." };
export const revalidate = 300;
export default async function ActualitesPage() { const news = await getPublishedNews(); const usesDevelopmentData = news.some((item) => item.isDevelopment); return <><PageHero eyebrow="La vie du magasin" title="Actualités & arrivages" copy="Retrouvez les nouveautés, sélections et conseils du magasin. Ces contenus pourront ensuite être alimentés par Facebook."/><section className="section-pad bg-forest-50"><div className="container-site">{usesDevelopmentData && <div className="mb-10 rounded-2xl bg-forest-100 p-4 text-sm text-forest-900"><strong>Données de développement :</strong> aucun contenu n’est encore récupéré depuis Facebook.</div>}{news.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{news.map(item => <NewsCard key={item.slug} item={item}/>)}</div> : <p className="rounded-3xl bg-white p-8 text-center text-stone-600">Aucune actualité publiée pour le moment.</p>}</div></section></>; }
