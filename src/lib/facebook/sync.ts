import type { Prisma } from "@/generated/prisma/client";
import { NewsPostSource, NewsPostStatus } from "@/generated/prisma/client";
import { createFacebookGraphClient, type FacebookGraphClient } from "@/lib/facebook/client";
import { isFacebookIntegrationEnabled } from "@/lib/facebook/config";
import { normalizeFacebookPost, type NormalizedFacebookPost } from "@/lib/facebook/normalizer";
import { getPrismaClient } from "@/lib/prisma";

export type FacebookNewsRepository = {
  upsert(post: NormalizedFacebookPost): Promise<string>;
  archive(externalId: string): Promise<string | null>;
};

export type FacebookSyncResult = {
  disabled: boolean;
  synced: number;
  archived: number;
  slugs: string[];
};

export function createPrismaFacebookNewsRepository(): FacebookNewsRepository {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL est requise pour synchroniser les publications Facebook.");
  }

  return {
    async upsert(post) {
      const savedPost = await prisma.newsPost.upsert({
        where: { externalId: post.externalId },
        update: {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          mainImageUrl: post.mainImageUrl,
          media: post.media as Prisma.InputJsonValue,
          externalUrl: post.externalUrl,
          publishedAt: post.publishedAt,
          source: NewsPostSource.FACEBOOK,
          status: NewsPostStatus.PUBLISHED,
        },
        create: {
          slug: post.slug,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          mainImageUrl: post.mainImageUrl,
          media: post.media as Prisma.InputJsonValue,
          externalId: post.externalId,
          externalUrl: post.externalUrl,
          publishedAt: post.publishedAt,
          source: NewsPostSource.FACEBOOK,
          status: NewsPostStatus.PUBLISHED,
        },
        select: { slug: true },
      });

      return savedPost.slug;
    },

    async archive(externalId) {
      const existingPost = await prisma.newsPost.findUnique({
        where: { externalId },
        select: { slug: true, source: true },
      });

      if (!existingPost || existingPost.source !== NewsPostSource.FACEBOOK) {
        return null;
      }

      await prisma.newsPost.update({
        where: { externalId },
        data: { status: NewsPostStatus.ARCHIVED },
      });

      return existingPost.slug;
    },
  };
}

type FacebookSyncDependencies = {
  client?: FacebookGraphClient;
  repository?: FacebookNewsRepository;
};

function disabledResult(): FacebookSyncResult {
  return { disabled: true, synced: 0, archived: 0, slugs: [] };
}

export async function syncFacebookPostById(
  postId: string,
  dependencies: FacebookSyncDependencies = {},
): Promise<FacebookSyncResult> {
  if (!isFacebookIntegrationEnabled()) {
    return disabledResult();
  }

  const client = dependencies.client ?? createFacebookGraphClient();
  const repository = dependencies.repository ?? createPrismaFacebookNewsRepository();
  const post = normalizeFacebookPost(await client.getPost(postId));
  const slug = await repository.upsert(post);

  return { disabled: false, synced: 1, archived: 0, slugs: [slug] };
}

export async function syncFacebookPosts(
  limit = 10,
  dependencies: FacebookSyncDependencies = {},
): Promise<FacebookSyncResult> {
  if (!isFacebookIntegrationEnabled()) {
    return disabledResult();
  }

  const client = dependencies.client ?? createFacebookGraphClient();
  const repository = dependencies.repository ?? createPrismaFacebookNewsRepository();
  const posts = await client.getRecentPosts(limit);
  const slugs: string[] = [];

  for (const graphPost of posts) {
    slugs.push(await repository.upsert(normalizeFacebookPost(graphPost)));
  }

  return { disabled: false, synced: posts.length, archived: 0, slugs };
}

export async function archiveFacebookPost(
  externalId: string,
  dependencies: Pick<FacebookSyncDependencies, "repository"> = {},
): Promise<FacebookSyncResult> {
  if (!isFacebookIntegrationEnabled()) {
    return disabledResult();
  }

  const repository = dependencies.repository ?? createPrismaFacebookNewsRepository();
  const slug = await repository.archive(externalId);

  return {
    disabled: false,
    synced: 0,
    archived: slug ? 1 : 0,
    slugs: slug ? [slug] : [],
  };
}
