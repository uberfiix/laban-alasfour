import type { Json } from "@/integrations/supabase/types";
import { catalogLinks, type CatalogLinkEntry } from "@/generated/catalog-links";

export type CatalogRoute = "living" | "bedroom" | "lighting" | "kitchen";

export type CatalogFallbackProduct = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  short_description_ar: string | null;
  price: number;
  sale_price: number | null;
  images: Json;
  rating_average: number | null;
  rating_count: number | null;
  is_new: boolean | null;
  has_vr_experience: boolean | null;
  model_3d_url: string | null;
  video_url: string | null;
  colors: string[] | null;
  materials: string[] | null;
  dimensions: Json;
  specifications: Json;
  stock_quantity: number;
  category_id: string | null;
  fallbackCategory: CatalogRoute;
};

const lightingPrefixes = new Set(["ap", "ar", "cl", "el", "gl", "lm", "sg", "tl"]);
const bedroomPrefixes = new Set(["am", "br", "cs", "dv", "lb", "rp"]);
const kitchenPrefixes = new Set(["k"]);

const categoryLabels: Record<CatalogRoute, string> = {
  living: "غرف المعيشة",
  bedroom: "غرف النوم",
  lighting: "الإضاءة",
  kitchen: "المطابخ",
};

function humanizeCatalogTitle(title: string, slug: string): string {
  const source = (title || slug).trim();

  return source
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCatalogImages(entry: CatalogLinkEntry): Json {
  const urls = Array.from(
    new Set(
      [entry.primaryImageUrl, ...entry.galleryImageUrls, ...Object.values(entry.colorImageUrls)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  if (urls.length === 0) {
    return [{ url: "/placeholder.svg", is_primary: true }];
  }

  return urls.map((url, index) => ({
    url,
    is_primary: index === 0,
  }));
}

function detectCatalogCategory(slug: string, title: string): CatalogRoute {
  const prefix = slug.toLowerCase().split("-")[0] ?? "";
  const fingerprint = `${slug} ${title}`.toLowerCase();

  if (kitchenPrefixes.has(prefix) || /\bkitchen|cucina|cucine\b/.test(fingerprint)) {
    return "kitchen";
  }

  if (
    lightingPrefixes.has(prefix) ||
    /\blight|lamp|focus|cover|bean|spot|pendant|wall\b/.test(fingerprint)
  ) {
    return "lighting";
  }

  if (
    bedroomPrefixes.has(prefix) ||
    /\bbed|wardrobe|armadio|letto|night|dresser|comodino\b/.test(fingerprint)
  ) {
    return "bedroom";
  }

  return "living";
}

function buildFallbackProduct(slug: string, entry: CatalogLinkEntry): CatalogFallbackProduct {
  const title = humanizeCatalogTitle(entry.title, slug);
  const fallbackCategory = detectCatalogCategory(slug, title);
  const galleryCount = entry.galleryImageUrls.length;
  const colorCount = Object.keys(entry.colorImageUrls).length;
  const assetCount = 1 + galleryCount + colorCount + Number(Boolean(entry.modelUrl));

  return {
    id: `catalog-${slug}`,
    slug,
    name_ar: title,
    name_en: title.toUpperCase(),
    description_ar: `عنصر معروض مباشرة من الكتالوج السحابي ضمن قسم ${categoryLabels[fallbackCategory]}، ويشمل ${assetCount} ملفاً مرتبطاً${entry.modelUrl ? " مع نموذج ثلاثي الأبعاد جاهز للعرض" : " مع صور مرجعية متعددة"}.`,
    description_en: `Catalog-backed product for ${categoryLabels[fallbackCategory]}.`,
    short_description_ar: `ملف كتالوج مباشر قابل للبحث باسم المجلد والملفات المرتبطة.`,
    price: 0,
    sale_price: null,
    images: buildCatalogImages(entry),
    rating_average: null,
    rating_count: null,
    is_new: null,
    has_vr_experience: Boolean(entry.modelUrl),
    model_3d_url: entry.modelUrl,
    video_url: null,
    colors: colorCount > 0 ? Object.keys(entry.colorImageUrls) : null,
    materials: null,
    dimensions: null,
    specifications: {
      "رمز المجلد": slug.toUpperCase(),
      "عدد الصور": 1 + galleryCount + colorCount,
      "عدد الملفات": assetCount,
      "ملف ثلاثي الأبعاد": entry.modelUrl ? "متوفر" : "غير متوفر",
    },
    stock_quantity: 0,
    category_id: null,
    fallbackCategory,
  };
}

const catalogFallbackProductsCache = Object.entries(catalogLinks)
  .map(([slug, entry]) => buildFallbackProduct(slug, entry))
  .sort(
    (a, b) =>
      Number(b.has_vr_experience) - Number(a.has_vr_experience) ||
      Object.keys((b.specifications as Record<string, number | string>) ?? {}).length -
        Object.keys((a.specifications as Record<string, number | string>) ?? {}).length ||
      a.name_ar.localeCompare(b.name_ar),
  );

export function getCatalogFallbackCategoryLabel(category: CatalogRoute): string {
  return categoryLabels[category];
}

export function getCatalogFallbackProducts(options: {
  category?: string | null;
  requireModel?: boolean;
  limit?: number;
} = {}): CatalogFallbackProduct[] {
  let items = catalogFallbackProductsCache;

  const category = options.category?.toLowerCase() as CatalogRoute | undefined;

  if (category && categoryLabels[category]) {
    const categoryItems = items.filter((item) => item.fallbackCategory === category);
    if (categoryItems.length > 0) {
      items = categoryItems;
    }
  }

  if (options.requireModel) {
    const modelItems = items.filter((item) => item.has_vr_experience || item.model_3d_url);
    if (modelItems.length > 0) {
      items = modelItems;
    }
  }

  if (typeof options.limit === "number") {
    return items.slice(0, options.limit);
  }

  return items;
}

export function getCatalogFallbackProductBySlug(slug: string | null | undefined): CatalogFallbackProduct | null {
  if (!slug) {
    return null;
  }

  return catalogFallbackProductsCache.find((item) => item.slug === slug) ?? null;
}