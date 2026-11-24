const FALLBACK_RECAPTCHA_SITE_KEY = "6LduAbcsAAAAALH4trqOFkE3SMvCUWEISgoG2UAA";

function readEnv(value: string | undefined) {
  if (value && value !== "undefined" && value.trim() !== "") {
    return value.replace(/\/$/, "");
  }
  return undefined;
}

export const PLATFORM_ID = "d978d55e-8b28-49fe-b6fa-d548bccf730e";
export const PLATFORM_NAME = "VFE";

export function getVfeApiUrl() {
  return readEnv(process.env.NEXT_PUBLIC_VFE_API_URL) ?? "https://dev-vfe-api.vowsforeternity.com";
}

export function getPackageContentsApiUrl() {
  return readEnv(process.env.NEXT_PUBLIC_PACKAGE_API_URL) ?? "https://dev-vfe-api.vowsforeternity.com";
}

export function getMatchMakingApiUrl() {
  return (
    readEnv(process.env.NEXT_PUBLIC_MATCH_MAKING_API_URL) ??
    "https://dev-matchmaking-api.vowsforeternity.com"
  );
}

export function getAiApiUrl() {
  return readEnv(process.env.NEXT_PUBLIC_AI_API_URL) ?? "https://uat-ai-api.vowsforeternity.com";
}

export function getWordpressUrl() {
  return readEnv(process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL) ?? "https://prod-wordpress.vowsforeternity.com";
}

export function getWebAppUrl() {
  return readEnv(process.env.NEXT_PUBLIC_WEB_APP_URL) ?? "https://dev-webapp.vowsforeternity.com";
}

export function getRecaptchaSiteKey() {
  return readEnv(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) ?? FALLBACK_RECAPTCHA_SITE_KEY;
}
