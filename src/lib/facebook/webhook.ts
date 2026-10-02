import { createHmac, timingSafeEqual } from "node:crypto";
import { isFacebookIntegrationEnabled } from "@/lib/facebook/config";
import {
  archiveFacebookPost,
  syncFacebookPostById,
  type FacebookNewsRepository,
  type FacebookSyncResult,
} from "@/lib/facebook/sync";
import type { FacebookGraphClient } from "@/lib/facebook/client";

export type FacebookWebhookAction =
  | { type: "sync"; externalId: string }
  | { type: "archive"; externalId: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function safeCompareSecrets(expected: string, provided: string) {
  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

export function verifyFacebookWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
) {
  if (!signatureHeader?.startsWith("sha256=") || !appSecret) {
    return false;
  }

  const suppliedDigest = signatureHeader.slice("sha256=".length);
  const expectedDigest = createHmac("sha256", appSecret).update(rawBody).digest("hex");

  return safeCompareSecrets(expectedDigest, suppliedDigest);
}

export function verifyFacebookWebhookChallenge(requestUrl: string, verifyToken: string) {
  const searchParams = new URL(requestUrl).searchParams;
  const mode = searchParams.get("hub.mode") ?? "";
  const token = searchParams.get("hub.verify_token") ?? "";
  const challenge = searchParams.get("hub.challenge") ?? "";

  return {
    challenge,
    valid: mode === "subscribe" && Boolean(challenge) && safeCompareSecrets(verifyToken, token),
  };
}

export function extractFacebookWebhookActions(payload: unknown): FacebookWebhookAction[] {
  if (!isRecord(payload) || payload.object !== "page" || !Array.isArray(payload.entry)) {
    return [];
  }

  const actions: FacebookWebhookAction[] = [];

  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      if (!isRecord(change) || change.field !== "feed" || !isRecord(change.value)) {
        continue;
      }

      const postId = typeof change.value.post_id === "string" ? change.value.post_id : null;
      const verb = typeof change.value.verb === "string" ? change.value.verb : null;

      if (!postId || change.value.item !== "post") {
        continue;
      }

      if (verb === "remove") {
        actions.push({ type: "archive", externalId: postId });
      } else if (verb === "add" || verb === "edited") {
        actions.push({ type: "sync", externalId: postId });
      }
    }
  }

  return actions;
}

type FacebookWebhookDependencies = {
  client?: FacebookGraphClient;
  repository?: FacebookNewsRepository;
};

export async function processFacebookWebhook(
  payload: unknown,
  dependencies: FacebookWebhookDependencies = {},
): Promise<FacebookSyncResult> {
  if (!isFacebookIntegrationEnabled()) {
    return { disabled: true, synced: 0, archived: 0, slugs: [] };
  }

  const result: FacebookSyncResult = {
    disabled: false,
    synced: 0,
    archived: 0,
    slugs: [],
  };

  for (const action of extractFacebookWebhookActions(payload)) {
    const actionResult = action.type === "archive"
      ? await archiveFacebookPost(action.externalId, { repository: dependencies.repository })
      : await syncFacebookPostById(action.externalId, dependencies);

    result.synced += actionResult.synced;
    result.archived += actionResult.archived;
    result.slugs.push(...actionResult.slugs);
  }

  return result;
}
