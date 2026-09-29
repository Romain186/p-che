import { ExternalLink, Star, UserRound } from "lucide-react";
import type { GoogleReview } from "@/data/reviews";

export function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} étoiles sur 5`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className="relative inline-grid" aria-hidden="true">
            <Star size={size} className="text-stone-300" strokeWidth={1.8}/>
            {fill > 0 && <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}><Star size={size} className="fill-ember text-ember" strokeWidth={1.8}/></span>}
          </span>
        );
      })}
    </div>
  );
}

export function GoogleReviewCard({ review }: { review: GoogleReview }) {
  const author = (
    <>
      <ReviewAuthorAvatar photoUrl={review.authorPhotoUrl} authorName={review.authorName}/>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-forest-950">{review.authorName}</p>
        {(review.relativeDate || review.visitDate) && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-stone-500">
            {review.relativeDate && <span>{review.relativeDate}</span>}
            {review.relativeDate && review.visitDate && <span aria-hidden="true">•</span>}
            {review.visitDate && <span>{review.visitDate}</span>}
          </p>
        )}
      </div>
    </>
  );

  return (
    <article className="flex min-h-[300px] snap-start flex-col rounded-3xl border border-forest-900/10 bg-cream p-6 transition duration-300 hover:-translate-y-1 hover:border-forest-900/20 hover:shadow-[0_16px_40px_rgb(17_27_15/.08)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <StarRating rating={review.rating}/>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-stone-500">Google Maps</span>
      </div>
      <blockquote className="mt-6 line-clamp-5 text-base leading-7 text-stone-700">“{review.text}”</blockquote>
      <footer className="mt-auto border-t border-forest-900/10 pt-6">
        <div className="flex items-center gap-3">
          {review.authorProfileUrl ? (
            <a href={review.authorProfileUrl} target="_blank" rel="noreferrer" className="focus-ring flex min-w-0 items-center gap-3 rounded-lg hover:text-ember" aria-label={`Ouvrir le profil Google de ${review.authorName}`}>{author}</a>
          ) : (
            <div className="flex min-w-0 items-center gap-3">{author}</div>
          )}
        </div>
        {review.googleMapsUrl && (
          <a href={review.googleMapsUrl} target="_blank" rel="noreferrer" className="focus-ring mt-4 inline-flex items-center gap-2 rounded text-xs font-bold text-forest-700 transition hover:text-ember">
            Voir l’avis sur Google Maps <ExternalLink size={14}/>
          </a>
        )}
      </footer>
    </article>
  );
}

function ReviewAuthorAvatar({ photoUrl, authorName }: { photoUrl?: string; authorName: string }) {
  if (photoUrl) {
    return (
      <span className="size-11 shrink-0 overflow-hidden rounded-full bg-stone-200">
        {/* Le domaine Google exact dépendra de la réponse API. Cette abstraction évite une remotePattern trop permissive. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={`Photo de profil de ${authorName}`} width={44} height={44} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover"/>
      </span>
    );
  }

  return <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-700" aria-hidden="true"><UserRound size={21}/></span>;
}
