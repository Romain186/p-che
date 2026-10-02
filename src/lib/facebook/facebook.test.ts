import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createHmac } from "node:crypto";
import { NewsPostStatus } from "@/generated/prisma/client";
import { POST as adminSyncPost } from "@/app/api/admin/facebook/sync/route";
import {
  GET as webhookGet,
  POST as webhookPost,
} from "@/app/api/webhooks/facebook/route";
import { FacebookGraphClient, type FacebookGraphPost } from "@/lib/facebook/client";
import { normalizeFacebookPost, type NormalizedFacebookPost } from "@/lib/facebook/normalizer";
import { syncFacebookPosts, type FacebookNewsRepository } from "@/lib/facebook/sync";
import {
  extractFacebookWebhookActions,
  processFacebookWebhook,
  verifyFacebookWebhookSignature,
} from "@/lib/facebook/webhook";

const facebookEnvironmentNames = [
  "FACEBOOK_INTEGRATION_ENABLED",
  "FACEBOOK_APP_SECRET",
  "FACEBOOK_VERIFY_TOKEN",
  "FACEBOOK_SYNC_SECRET",
] as const;

const originalEnvironment = Object.fromEntries(
  facebookEnvironmentNames.map((name) => [name, process.env[name]]),
);

afterEach(() => {
  for (const name of facebookEnvironmentNames) {
    const originalValue = originalEnvironment[name];
    if (originalValue === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = originalValue;
    }
  }
});

class InMemoryFacebookNewsRepository implements FacebookNewsRepository {
  readonly posts = new Map<string, { post: NormalizedFacebookPost; status: string }>();

  async upsert(post: NormalizedFacebookPost) {
    const existing = this.posts.get(post.externalId);
    const savedPost = existing ? { ...post, slug: existing.post.slug } : post;
    this.posts.set(post.externalId, { post: savedPost, status: NewsPostStatus.PUBLISHED });
    return savedPost.slug;
  }

  async archive(externalId: string) {
    const existing = this.posts.get(externalId);
    if (!existing) {
      return null;
    }

    this.posts.set(externalId, { ...existing, status: NewsPostStatus.ARCHIVED });
    return existing.post.slug;
  }
}

const graphPost: FacebookGraphPost = {
  id: "123456_987654",
  message: "Nouvel arrivage de leurres au magasin. Venez découvrir les nouveaux coloris disponibles dès maintenant.",
  created_time: "2026-10-01T10:30:00+0000",
  permalink_url: "https://www.facebook.com/123456/posts/987654",
  full_picture: "https://example.com/image.jpg",
  status_type: "added_photos",
  attachments: {
    data: [{ media_type: "photo", media: { image: { src: "https://example.com/image.jpg" } } }],
  },
};

test("normalizeFacebookPost produit une actualité exploitable sans IA", () => {
  const normalized = normalizeFacebookPost(graphPost);

  assert.equal(normalized.externalId, graphPost.id);
  assert.equal(normalized.title, "Nouvel arrivage de leurres au magasin.");
  assert.match(normalized.slug, /^nouvel-arrivage-de-leurres-au-magasin-/);
  assert.equal(normalized.mainImageUrl, graphPost.full_picture);
  assert.equal(normalized.externalUrl, graphPost.permalink_url);
  assert.equal(normalized.status, "PUBLISHED");
  assert.equal(normalized.source, "FACEBOOK");
});

test("la signature webhook SHA-256 est vérifiée en temps constant", () => {
  const body = JSON.stringify({ object: "page", entry: [] });
  const secret = "local-test-secret";
  const digest = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyFacebookWebhookSignature(body, `sha256=${digest}`, secret), true);
  assert.equal(verifyFacebookWebhookSignature(body, "sha256=incorrect", secret), false);
  assert.equal(verifyFacebookWebhookSignature(body, null, secret), false);
});

test("les événements feed sont convertis en actions de synchronisation et archivage", () => {
  const actions = extractFacebookWebhookActions({
    object: "page",
    entry: [{
      changes: [
        { field: "feed", value: { item: "post", verb: "add", post_id: "page_post_1" } },
        { field: "feed", value: { item: "post", verb: "edited", post_id: "page_post_1" } },
        { field: "feed", value: { item: "post", verb: "remove", post_id: "page_post_2" } },
      ],
    }],
  });

  assert.deepEqual(actions, [
    { type: "sync", externalId: "page_post_1" },
    { type: "sync", externalId: "page_post_1" },
    { type: "archive", externalId: "page_post_2" },
  ]);
});

test("la synchronisation répétée reste idempotente et une suppression archive", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "true";
  const repository = new InMemoryFacebookNewsRepository();
  let currentGraphPost = graphPost;
  const client = new FacebookGraphClient(
    { pageId: "page", pageAccessToken: "test-token", graphApiVersion: "v99.0" },
    async () => Response.json(currentGraphPost),
  );
  const addPayload = {
    object: "page",
    entry: [{ changes: [{ field: "feed", value: { item: "post", verb: "add", post_id: graphPost.id } }] }],
  };

  await processFacebookWebhook(addPayload, { client, repository });
  currentGraphPost = { ...graphPost, message: "Publication Facebook modifiée." };
  const editedPayload = {
    object: "page",
    entry: [{ changes: [{ field: "feed", value: { item: "post", verb: "edited", post_id: graphPost.id } }] }],
  };
  await processFacebookWebhook(editedPayload, { client, repository });

  assert.equal(repository.posts.size, 1);
  assert.equal(repository.posts.get(graphPost.id)?.status, "PUBLISHED");
  assert.equal(repository.posts.get(graphPost.id)?.post.content, "Publication Facebook modifiée.");

  const removePayload = {
    object: "page",
    entry: [{ changes: [{ field: "feed", value: { item: "post", verb: "remove", post_id: graphPost.id } }] }],
  };
  const removal = await processFacebookWebhook(removePayload, { client, repository });

  assert.equal(removal.archived, 1);
  assert.equal(repository.posts.get(graphPost.id)?.status, "ARCHIVED");
});

test("la synchronisation ne réclame aucun secret quand Facebook est désactivé", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "false";
  const result = await syncFacebookPosts();

  assert.deepEqual(result, { disabled: true, synced: 0, archived: 0, slugs: [] });
});

test("les routes Facebook restent fermées quand l’intégration est désactivée", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "false";

  const webhookResponse = await webhookPost(new Request(
    "http://localhost/api/webhooks/facebook",
    { method: "POST", body: "{}" },
  ));
  const adminResponse = await adminSyncPost(new Request(
    "http://localhost/api/admin/facebook/sync",
    { method: "POST" },
  ));

  assert.equal(webhookResponse.status, 503);
  assert.equal(adminResponse.status, 503);
});

test("GET webhook accepte uniquement le token de vérification attendu", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "true";
  process.env.FACEBOOK_VERIFY_TOKEN = "verify-local";

  const validResponse = await webhookGet(new Request(
    "http://localhost/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=verify-local&hub.challenge=challenge-42",
  ));
  const invalidResponse = await webhookGet(new Request(
    "http://localhost/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=challenge-42",
  ));

  assert.equal(validResponse.status, 200);
  assert.equal(await validResponse.text(), "challenge-42");
  assert.equal(invalidResponse.status, 403);
});

test("POST webhook refuse une signature incorrecte", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "true";
  process.env.FACEBOOK_APP_SECRET = "app-secret";

  const response = await webhookPost(new Request(
    "http://localhost/api/webhooks/facebook",
    {
      method: "POST",
      body: JSON.stringify({ object: "page", entry: [] }),
      headers: { "x-hub-signature-256": "sha256=incorrect" },
    },
  ));

  assert.equal(response.status, 401);
});

test("la synchronisation admin refuse un secret incorrect", async () => {
  process.env.FACEBOOK_INTEGRATION_ENABLED = "true";
  process.env.FACEBOOK_SYNC_SECRET = "sync-secret";

  const response = await adminSyncPost(new Request(
    "http://localhost/api/admin/facebook/sync",
    { method: "POST", headers: { authorization: "Bearer wrong" } },
  ));

  assert.equal(response.status, 401);
});
