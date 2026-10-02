export type FacebookGraphConfig = {
  pageId: string;
  pageAccessToken: string;
  graphApiVersion: string;
};

export class FacebookConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FacebookConfigurationError";
  }
}

export function isFacebookIntegrationEnabled() {
  return process.env.FACEBOOK_INTEGRATION_ENABLED?.trim().toLowerCase() === "true";
}

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new FacebookConfigurationError(`La variable serveur ${name} est manquante.`);
  }

  return value;
}

export function getFacebookGraphConfig(): FacebookGraphConfig {
  const graphApiVersion = requireEnvironmentVariable("GRAPH_API_VERSION");

  if (!/^v\d+\.\d+$/.test(graphApiVersion)) {
    throw new FacebookConfigurationError(
      "GRAPH_API_VERSION doit utiliser le format vXX.X fourni par Meta.",
    );
  }

  return {
    pageId: requireEnvironmentVariable("FACEBOOK_PAGE_ID"),
    pageAccessToken: requireEnvironmentVariable("FACEBOOK_PAGE_ACCESS_TOKEN"),
    graphApiVersion,
  };
}

export function getFacebookAppSecret() {
  return requireEnvironmentVariable("FACEBOOK_APP_SECRET");
}

export function getFacebookVerifyToken() {
  return requireEnvironmentVariable("FACEBOOK_VERIFY_TOKEN");
}

export function getFacebookSyncSecret() {
  return requireEnvironmentVariable("FACEBOOK_SYNC_SECRET");
}
