import { NewsPostSource, NewsPostStatus } from "@/generated/prisma/client";
import type { FacebookAttachment, FacebookGraphPost } from "@/lib/facebook/client";

export type NormalizedFacebookPost = {
  externalId: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  mainImageUrl: string | null;
  media: {
    provider: "facebook";
    postType: string | null;
    attachments: FacebookAttachment[];
  };
  externalUrl: string | null;
  publishedAt: Date;
  source: typeof NewsPostSource.FACEBOOK;
  status: typeof NewsPostStatus.PUBLISHED;
};

function truncateAtWord(value: string, maximumLength: number) {
  if (value.length <= maximumLength) {
    return value;
  }

  const shortened = value.slice(0, maximumLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > maximumLength * 0.6 ? lastSpace : maximumLength).trim()}…`;
}

function buildTitle(message: string) {
  if (!message) {
    return "Publication Facebook";
  }

  const firstSentence = message.split(/(?<=[.!?])\s+/u)[0] ?? message;
  return truncateAtWord(firstSentence.replace(/\s+/g, " ").trim(), 90);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function findAttachmentImage(attachment: FacebookAttachment): string | null {
  const directImage = attachment.media?.image?.src ?? attachment.media?.source;

  if (directImage) {
    return directImage;
  }

  for (const child of attachment.subattachments?.data ?? []) {
    const childImage = findAttachmentImage(child);
    if (childImage) {
      return childImage;
    }
  }

  return null;
}

function parsePublishedAt(createdTime?: string) {
  if (!createdTime) {
    return new Date();
  }

  const date = new Date(createdTime);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function normalizeFacebookPost(post: FacebookGraphPost): NormalizedFacebookPost {
  if (!post.id?.trim()) {
    throw new Error("Une publication Facebook doit posséder un identifiant externe.");
  }

  const message = post.message?.trim() ?? "";
  const title = buildTitle(message);
  const attachments = post.attachments?.data ?? [];
  const identifierSuffix = post.id.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toLowerCase();
  const slugBase = slugify(title) || "publication-facebook";

  return {
    externalId: post.id,
    slug: `${slugBase}-${identifierSuffix || "facebook"}`,
    title,
    content: message || "Publication Facebook sans texte.",
    excerpt: truncateAtWord(message || "Nouvelle publication de Loire Pêche 42.", 180),
    mainImageUrl:
      post.full_picture ?? attachments.map(findAttachmentImage).find(Boolean) ?? null,
    media: {
      provider: "facebook",
      postType: post.status_type ?? null,
      attachments,
    },
    externalUrl: post.permalink_url ?? null,
    publishedAt: parsePublishedAt(post.created_time),
    source: NewsPostSource.FACEBOOK,
    status: NewsPostStatus.PUBLISHED,
  };
}
