import { FacebookConfigurationError, getFacebookSyncSecret, isFacebookIntegrationEnabled } from "@/lib/facebook/config";
import { revalidateFacebookContent } from "@/lib/facebook/revalidate";
import { syncFacebookPosts } from "@/lib/facebook/sync";
import { safeCompareSecrets } from "@/lib/facebook/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readSuppliedSecret(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-facebook-sync-secret")?.trim() ?? "";
}

export async function POST(request: Request) {
  if (!isFacebookIntegrationEnabled()) {
    return Response.json({ error: "Facebook integration is disabled." }, { status: 503 });
  }

  try {
    if (!safeCompareSecrets(getFacebookSyncSecret(), readSuppliedSecret(request))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await syncFacebookPosts();
    if (result.synced > 0) {
      revalidateFacebookContent(result.slugs);
    }

    return Response.json(result);
  } catch (error) {
    if (error instanceof FacebookConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("Facebook initial sync failed.", error);
    return Response.json({ error: "Facebook initial sync failed." }, { status: 500 });
  }
}
