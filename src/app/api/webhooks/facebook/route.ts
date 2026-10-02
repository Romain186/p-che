import { FacebookConfigurationError, getFacebookAppSecret, getFacebookVerifyToken, isFacebookIntegrationEnabled } from "@/lib/facebook/config";
import { revalidateFacebookContent } from "@/lib/facebook/revalidate";
import { processFacebookWebhook, verifyFacebookWebhookChallenge, verifyFacebookWebhookSignature } from "@/lib/facebook/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isFacebookIntegrationEnabled()) {
    return Response.json({ error: "Facebook integration is disabled." }, { status: 503 });
  }

  try {
    const verification = verifyFacebookWebhookChallenge(
      request.url,
      getFacebookVerifyToken(),
    );

    if (!verification.valid) {
      return new Response("Invalid verification token", { status: 403 });
    }

    return new Response(verification.challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    if (error instanceof FacebookConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  if (!isFacebookIntegrationEnabled()) {
    return Response.json({ error: "Facebook integration is disabled." }, { status: 503 });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyFacebookWebhookSignature(rawBody, signature, getFacebookAppSecret())) {
      return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const result = await processFacebookWebhook(payload);
    if (result.synced > 0 || result.archived > 0) {
      revalidateFacebookContent(result.slugs);
    }

    return Response.json({ accepted: true, ...result });
  } catch (error) {
    if (error instanceof FacebookConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("Facebook webhook processing failed.", error);
    return Response.json({ error: "Facebook webhook processing failed." }, { status: 500 });
  }
}
