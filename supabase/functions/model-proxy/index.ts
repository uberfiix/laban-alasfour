const ALLOWED_HOSTS = new Set(["laban-alasfour.s3.amazonaws.com"]);

const CONTENT_TYPES: Record<string, string> = {
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  obj: "model/obj",
  mtl: "text/plain; charset=utf-8",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bin: "application/octet-stream",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const requestedUrl = new URL(request.url).searchParams.get("url");
  if (!requestedUrl) {
    return new Response("Missing model url", { status: 400, headers: corsHeaders });
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(requestedUrl);
  } catch {
    return new Response("Invalid model url", { status: 400, headers: corsHeaders });
  }

  if (sourceUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(sourceUrl.hostname)) {
    return new Response("Model host is not allowed", { status: 403, headers: corsHeaders });
  }

  const upstreamHeaders = new Headers();
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    upstreamHeaders.set("range", rangeHeader);
  }

  const upstreamResponse = await fetch(sourceUrl, {
    method: request.method,
    headers: upstreamHeaders,
  });

  const responseHeaders = new Headers(corsHeaders);
  const extension = sourceUrl.pathname.split(".").pop()?.toLowerCase() ?? "";
  responseHeaders.set(
    "Content-Type",
    upstreamResponse.headers.get("Content-Type") || CONTENT_TYPES[extension] || "application/octet-stream",
  );
  responseHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=604800");

  for (const headerName of ["Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]) {
    const value = upstreamResponse.headers.get(headerName);
    if (value) {
      responseHeaders.set(headerName, value);
    }
  }

  return new Response(request.method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
});