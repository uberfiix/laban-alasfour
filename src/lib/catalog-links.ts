import type { Json } from "@/integrations/supabase/types";
import { catalogLinks } from "@/generated/catalog-links";

type ProductImage = {
  url: string;
  is_primary?: boolean;
};

export type CatalogSearchMetadata = {
  folderName: string;
  displayCode: string;
  title: string;
  fileNames: string[];
  assetCount: number;
  imageCount: number;
  modelFileName: string | null;
  hasModel: boolean;
  normalizedSearchText: string;
};

const catalogSearchMetadataCache = new Map<string, CatalogSearchMetadata>();

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function getFileNameFromUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const fileName = new URL(url).pathname.split("/").pop();
    return fileName ? decodeURIComponent(fileName) : null;
  } catch {
    const fileName = url.split("/").pop();
    return fileName ? decodeURIComponent(fileName) : null;
  }
}

export function normalizeCatalogSearchValue(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[._/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCatalogLinkEntry(slug: string | null | undefined) {
  if (!slug) {
    return null;
  }

  return catalogLinks[slug] ?? null;
}

export function getCatalogProductImageUrls(slug: string | null | undefined): string[] {
  const entry = getCatalogLinkEntry(slug);

  if (!entry) {
    return [];
  }

  const urls = [
    entry.primaryImageUrl,
    ...entry.galleryImageUrls,
    ...Object.values(entry.colorImageUrls),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(urls));
}

export function getCatalogSearchMetadata(slug: string | null | undefined): CatalogSearchMetadata | null {
  if (!slug) {
    return null;
  }

  const cachedMetadata = catalogSearchMetadataCache.get(slug);
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const entry = getCatalogLinkEntry(slug);
  if (!entry) {
    return null;
  }

  const imageUrls = [
    entry.primaryImageUrl,
    ...entry.galleryImageUrls,
    ...Object.values(entry.colorImageUrls),
  ];

  const fileNames = uniqueStrings(
    [entry.productUrl, entry.modelUrl, ...imageUrls].map((url) => getFileNameFromUrl(url)),
  );

  const metadata: CatalogSearchMetadata = {
    folderName: slug,
    displayCode: slug.toUpperCase(),
    title: entry.title,
    fileNames,
    assetCount: fileNames.length,
    imageCount: uniqueStrings(imageUrls.map((url) => getFileNameFromUrl(url))).length,
    modelFileName: getFileNameFromUrl(entry.modelUrl),
    hasModel: Boolean(entry.modelUrl),
    normalizedSearchText: normalizeCatalogSearchValue([slug, entry.title, ...fileNames].join(" ")),
  };

  catalogSearchMetadataCache.set(slug, metadata);

  return metadata;
}

export function getCatalogModelUrl(slug: string | null | undefined): string | null {
  return getCatalogLinkEntry(slug)?.modelUrl ?? null;
}

export function getProductImageUrls(images: Json, slug: string | null | undefined): string[] {
  const catalogImageUrls = getCatalogProductImageUrls(slug);
  if (catalogImageUrls.length > 0) {
    return catalogImageUrls;
  }

  if (!Array.isArray(images)) {
    return ["/placeholder.svg"];
  }

  const urls = (images as ProductImage[])
    .map((image) => image?.url)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  return urls.length > 0 ? urls : ["/placeholder.svg"];
}

export function getProductPrimaryImage(images: Json, slug: string | null | undefined): string {
  return getProductImageUrls(images, slug)[0] || "/placeholder.svg";
}

export function hasCatalogModel(slug: string | null | undefined): boolean {
  return Boolean(getCatalogModelUrl(slug));
}
