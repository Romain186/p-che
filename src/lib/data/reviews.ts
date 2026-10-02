import type { Prisma } from "@/generated/prisma/client";
import { reviewPlaceholders, type GoogleReview } from "@/data/reviews";
import { getPrismaClient } from "@/lib/prisma";

type GoogleReviewRecord = Prisma.GoogleReviewGetPayload<object>;

function toGoogleReview(review: GoogleReviewRecord): GoogleReview {
  return {
    id: review.id,
    authorName: review.authorName,
    authorPhotoUrl: review.authorPhotoUrl ?? undefined,
    authorProfileUrl: review.authorProfileUrl ?? undefined,
    rating: review.rating,
    text: review.text,
    relativeDate: review.relativeDate ?? undefined,
    visitDate: review.visitDate?.toLocaleDateString("fr-FR") ?? undefined,
    googleMapsUrl: review.googleMapsUrl ?? undefined,
    isMock: review.externalId.startsWith("dev-google-review-"),
  };
}

function developmentFallback(): GoogleReview[] {
  return reviewPlaceholders.filter((review) => review.rating >= 4);
}

function shouldUseDevelopmentFallback() {
  return process.env.NODE_ENV !== "production";
}

export async function getDisplayedReviews(limit = 3): Promise<GoogleReview[]> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return (shouldUseDevelopmentFallback() ? developmentFallback() : []).slice(0, Math.max(0, limit));
  }

  try {
    const reviews = await prisma.googleReview.findMany({
      where: { rating: { gte: 4 } },
      orderBy: [{ visitDate: "desc" }, { createdAt: "desc" }],
      take: Math.max(0, limit),
    });

    return reviews.map(toGoogleReview);
  } catch (error) {
    console.warn("Avis PostgreSQL indisponibles.", error);
    return (shouldUseDevelopmentFallback() ? developmentFallback() : []).slice(0, Math.max(0, limit));
  }
}
