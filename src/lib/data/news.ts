import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { NewsPostStatus } from "@/generated/prisma/client";
import { news as developmentNews, type NewsItem } from "@/data/news";
import { getPrismaClient } from "@/lib/prisma";

type NewsPostRecord = Prisma.NewsPostGetPayload<object>;
type NewsCategory = NewsItem["category"];

const categories: NewsCategory[] = ["Arrivage", "Conseil", "Magasin", "Événement"];

function readMedia(media: Prisma.JsonValue | null): { category?: NewsCategory; position?: string } {
  if (!media || typeof media !== "object" || Array.isArray(media)) {
    return {};
  }

  const category = categories.includes(media.category as NewsCategory)
    ? (media.category as NewsCategory)
    : undefined;
  const position = typeof media.position === "string" ? media.position : undefined;

  return { category, position };
}

function toNewsItem(post: NewsPostRecord): NewsItem {
  const media = readMedia(post.media);

  return {
    slug: post.slug,
    category: media.category ?? "Magasin",
    title: post.title,
    excerpt: post.excerpt,
    date: (post.publishedAt ?? post.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    body: post.content
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    image: post.mainImageUrl ?? "/images/tackle-flatlay.png",
    position: media.position,
    facebookUrl: post.externalUrl ?? undefined,
    isDevelopment: post.externalId?.startsWith("dev-news-") ?? false,
  };
}

function fallbackNews(): NewsItem[] {
  return developmentNews.map((item) => ({ ...item, isDevelopment: true }));
}

function shouldUseDevelopmentFallback() {
  return process.env.NODE_ENV !== "production";
}

async function queryPublishedNews(limit?: number): Promise<NewsItem[]> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const items = shouldUseDevelopmentFallback() ? fallbackNews() : [];
    return typeof limit === "number" ? items.slice(0, Math.max(0, limit)) : items;
  }

  try {
    const posts = await prisma.newsPost.findMany({
      where: {
        status: NewsPostStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      take: typeof limit === "number" ? Math.max(0, limit) : undefined,
    });

    return posts.map(toNewsItem);
  } catch (error) {
    console.warn("Actualités PostgreSQL indisponibles.", error);
    return shouldUseDevelopmentFallback() ? fallbackNews() : [];
  }
}

export async function getPublishedNews(): Promise<NewsItem[]> {
  return queryPublishedNews();
}

export async function getLatestNews(limit = 3): Promise<NewsItem[]> {
  return queryPublishedNews(limit);
}

async function findNewsBySlug(slug: string): Promise<NewsItem | null> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return (shouldUseDevelopmentFallback() ? fallbackNews() : []).find((item) => item.slug === slug) ?? null;
  }

  try {
    const post = await prisma.newsPost.findFirst({
      where: {
        slug,
        status: NewsPostStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
    });

    return post ? toNewsItem(post) : null;
  } catch (error) {
    console.warn(`Actualité PostgreSQL indisponible pour le slug « ${slug} ».`, error);
    return (shouldUseDevelopmentFallback() ? fallbackNews() : []).find((item) => item.slug === slug) ?? null;
  }
}

export const getNewsBySlug = cache(findNewsBySlug);
