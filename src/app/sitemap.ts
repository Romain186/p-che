import type { MetadataRoute } from "next";
import { news } from "@/data/news";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://loirepeche42.fr"; const pages = ["", "/magasin", "/univers", "/marques", "/actualites", "/contact"]; return [...pages.map(url => ({ url: `${base}${url}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: url === "" ? 1 : .8 })), ...news.map(item => ({ url: `${base}/actualites/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: .6 }))]; }
