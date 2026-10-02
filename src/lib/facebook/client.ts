import { getFacebookGraphConfig, type FacebookGraphConfig } from "@/lib/facebook/config";

export type FacebookMedia = {
  image?: { src?: string };
  source?: string;
};

export type FacebookAttachment = {
  media_type?: string;
  type?: string;
  title?: string;
  url?: string;
  media?: FacebookMedia;
  subattachments?: { data?: FacebookAttachment[] };
};

export type FacebookGraphPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
  status_type?: string;
  attachments?: { data?: FacebookAttachment[] };
};

type FacebookGraphListResponse<T> = {
  data?: T[];
  error?: { message?: string; type?: string; code?: number };
};

type FacebookGraphErrorResponse = {
  error?: { message?: string; type?: string; code?: number };
};

const postFields = [
  "id",
  "message",
  "created_time",
  "permalink_url",
  "full_picture",
  "status_type",
  "attachments{media_type,type,title,url,media,subattachments{data{media_type,type,title,url,media}}}",
].join(",");

export class FacebookGraphApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "FacebookGraphApiError";
  }
}

export class FacebookGraphClient {
  constructor(
    private readonly config: FacebookGraphConfig,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  private async request<T>(path: string, searchParams: Record<string, string>): Promise<T> {
    const url = new URL(
      `${this.config.graphApiVersion}/${path.replace(/^\//, "")}`,
      "https://graph.facebook.com/",
    );

    for (const [name, value] of Object.entries(searchParams)) {
      url.searchParams.set(name, value);
    }

    const response = await this.fetchImplementation(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.config.pageAccessToken}`,
      },
      signal: AbortSignal.timeout(15_000),
    });

    const body = (await response.json().catch(() => ({}))) as T & FacebookGraphErrorResponse;

    if (!response.ok || body.error) {
      const graphMessage = body.error?.message ?? "Réponse Graph API invalide";
      throw new FacebookGraphApiError(
        `Meta Graph API a refusé la requête (${response.status}) : ${graphMessage}`,
        response.status,
      );
    }

    return body;
  }

  async getPost(postId: string): Promise<FacebookGraphPost> {
    return this.request<FacebookGraphPost>(encodeURIComponent(postId), {
      fields: postFields,
    });
  }

  async getRecentPosts(limit = 10): Promise<FacebookGraphPost[]> {
    const response = await this.request<FacebookGraphListResponse<FacebookGraphPost>>(
      `${encodeURIComponent(this.config.pageId)}/posts`,
      {
        fields: postFields,
        limit: String(Math.min(Math.max(limit, 1), 50)),
      },
    );

    return response.data ?? [];
  }
}

export function createFacebookGraphClient() {
  return new FacebookGraphClient(getFacebookGraphConfig());
}
