import { env } from "@/lib/env";

const MODEL_PROXY_HOSTS = new Set([
  "laban-alasfour.s3.amazonaws.com",
]);

export function getModelViewerUrl(modelUrl: string | null | undefined): string | null {
  if (!modelUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(modelUrl);
    if (MODEL_PROXY_HOSTS.has(parsedUrl.hostname)) {
      return `${env.supabaseUrl.replace(/\/+$/, "")}/functions/v1/model-proxy?url=${encodeURIComponent(modelUrl)}`;
    }
  } catch {
    return modelUrl;
  }

  return modelUrl;
}