import { ArrowRight, MapPin } from "lucide-react";
import { GoogleReviewCard, StarRating } from "@/components/google-review-card";
import { filterDisplayedReviews, googleReviewSummary, googleReviewsPreview, reviewPlaceholders, type GoogleReview, type GoogleReviewSummary } from "@/data/reviews";
import { store } from "@/data/store";

type GoogleReviewsSectionProps = {
  reviews?: GoogleReview[];
  summary?: GoogleReviewSummary;
  isPreview?: boolean;
};

export function GoogleReviewsSection({ reviews = reviewPlaceholders, summary = googleReviewSummary, isPreview = googleReviewsPreview.isMock }: GoogleReviewsSectionProps) {
  const displayedReviews = filterDisplayedReviews(reviews).slice(0, 3);

  return (
    <section id="avis-google" className="section-pad scroll-mt-20 bg-white">
      <div className="container-site">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Avis Google</p>
            <h2 className="display-title mt-4 text-4xl text-forest-950 md:text-5xl">Ils nous font confiance</h2>
            <p className="mt-4 text-base leading-7 text-stone-600 md:text-lg">Découvrez ce que les pêcheurs pensent de Loire Pêche 42.</p>
          </div>
          <div className="min-w-[260px] rounded-3xl bg-forest-50 p-5">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="font-display text-xl font-semibold text-forest-950">Google</p>
                <StarRating rating={summary.rating} size={20}/>
              </div>
              <strong className="font-display text-4xl text-forest-950">{summary.rating.toLocaleString("fr-FR")}</strong>
            </div>
            <p className="mt-3 border-t border-forest-900/10 pt-3 text-sm font-bold text-stone-600">
              {summary.rating.toLocaleString("fr-FR")}/5 · {summary.total} avis Google
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500">
          {isPreview && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">{googleReviewsPreview.label}</span>}
          <span>Sélection d’avis Google notés 4★ et 5★</span>
        </div>

        {displayedReviews.length > 0 ? (
          <div className="mt-5 grid w-full auto-cols-[calc(100%-1.5rem)] grid-flow-col gap-4 overflow-x-auto pb-5 [scrollbar-width:none] snap-x snap-mandatory sm:auto-cols-[calc(50%-0.5rem)] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible">
            {displayedReviews.map((review) => <GoogleReviewCard key={review.id} review={review}/>) }
          </div>
        ) : (
          <p className="mt-5 rounded-3xl bg-forest-50 p-8 text-center text-stone-600">Aucun avis à afficher pour le moment.</p>
        )}

        <div className="mt-7 flex flex-col items-start justify-between gap-5 border-t border-forest-900/10 pt-7 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-sm text-stone-600"><MapPin size={17} className="shrink-0 text-ember"/> Les avis complets restent consultables sur Google.</p>
          <a href={store.googleReviewsUrl} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-800 px-6 text-sm font-bold text-white transition hover:bg-forest-700">
            Voir tous les avis sur Google <ArrowRight size={16}/>
          </a>
        </div>
      </div>
    </section>
  );
}
