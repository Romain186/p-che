import { revalidatePath } from "next/cache";

export function revalidateFacebookContent(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/actualites");
  revalidatePath("/actualites/[slug]", "page");
  revalidatePath("/sitemap.xml");

  for (const slug of new Set(slugs)) {
    revalidatePath(`/actualites/${slug}`);
  }
}
