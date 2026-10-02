import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui";
import { FinalCta } from "@/components/cta";
import { getNewsBySlug, getPublishedNews } from "@/lib/data/news";
type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;
export async function generateStaticParams() { const news = await getPublishedNews(); return news.map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const item = await getNewsBySlug(slug); return item ? { title: item.title, description: item.excerpt } : {}; }
export default async function NewsDetailPage({ params }: Props) { const { slug } = await params; const item = await getNewsBySlug(slug); if (!item) notFound(); return <><article><header className="bg-forest-950 py-16 text-white md:py-24"><div className="container-site"><Link href="/actualites" className="focus-ring inline-flex items-center gap-2 rounded text-sm font-bold text-forest-200 hover:text-white"><ArrowLeft size={17}/> Toutes les actualités</Link><p className="eyebrow mt-12">{item.category}{item.isDevelopment ? " • contenu de développement" : ""}</p><h1 className="display-title mt-4 max-w-4xl text-5xl md:text-7xl">{item.title}</h1><time className="mt-6 block text-sm text-forest-200">{item.date}</time></div></header><div className="container-site py-12 md:py-20"><div className="mx-auto max-w-4xl"><div className="relative aspect-[16/9] overflow-hidden rounded-[2rem]"><Image src={item.image} alt={item.isDevelopment ? `${item.title} — visuel de démonstration` : item.title} fill priority sizes="(max-width:900px) 100vw, 900px" className="object-cover" style={{objectPosition:item.position}}/></div><div className="mx-auto max-w-2xl py-12"><p className="font-display text-2xl leading-9 text-forest-900">{item.excerpt}</p>{item.body.map(p => <p key={p} className="mt-6 leading-8 text-stone-700">{p}</p>)}<div className="mt-10 flex flex-wrap gap-3"><ButtonLink href="/contact"><Store size={16}/> Nous rendre visite</ButtonLink>{item.facebookUrl && <ButtonLink href={item.facebookUrl} variant="secondary">Voir sur Facebook <ExternalLink size={15}/></ButtonLink>}</div></div></div></div></article><FinalCta/></>; }
