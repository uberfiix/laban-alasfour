import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Star, Eye, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { getCatalogSearchMetadata, getProductPrimaryImage, hasCatalogModel } from "@/lib/catalog-links";
import type { Json } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    sale_price: number | null;
    images: Json;
    rating_average: number | null;
    is_new: boolean | null;
    has_vr_experience: boolean | null;
    slug: string;
  };
  index: number;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, index, viewMode }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();
  const catalogMeta = getCatalogSearchMetadata(product.slug);
  const supportsImmersivePreview = product.has_vr_experience || hasCatalogModel(product.slug);
  const catalogAssetCount = catalogMeta?.assetCount ?? 0;
  const isCatalogOnly = product.id.startsWith("catalog-") || product.price <= 0;
  const isUploadedModel = product.id.startsWith("uploaded-");

  const getProductImage = () => {
    return getProductPrimaryImage(product.images, product.slug);
  };

  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (isCatalogOnly) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      sale_price: product.sale_price,
      image: getProductImage(),
      slug: product.slug,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
      >
        <Link to={`/product/${product.slug}`}>
          <div className="group flex bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-secondary/40 transition-all duration-500 hover:shadow-[0_8px_40px_-8px_hsl(var(--secondary)/0.15)]">
            <div className="relative w-56 h-56 overflow-hidden flex-shrink-0">
              {isUploadedModel ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-navy-light to-secondary/70 p-6 text-primary-foreground">
                  <div className="text-center">
                    <Box className="mx-auto mb-3 h-12 w-12 text-secondary" />
                    <p className="text-sm font-semibold">نموذج 3D مباشر</p>
                    <p className="mt-1 text-xs text-primary-foreground/85">{product.name_en}</p>
                  </div>
                </div>
              ) : (
                <img
                  src={getProductImage()}
                  alt={product.name_ar}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              {discount > 0 && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-destructive text-destructive-foreground font-bold px-3 py-1">
                    -{discount}%
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                    {product.name_ar}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 transition-colors ${isLiked ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{product.name_en}</p>
                {(catalogMeta || supportsImmersivePreview) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {catalogMeta?.displayCode && (
                      <Badge variant="outline" className="border-secondary/20 bg-secondary/10 text-secondary">
                        {catalogMeta.displayCode}
                      </Badge>
                    )}
                    {catalogAssetCount > 0 && (
                      <Badge variant="outline" className="border-border/60 bg-muted/60 text-foreground">
                        {catalogAssetCount} ملف كتالوج
                      </Badge>
                    )}
                    {supportsImmersivePreview && (
                      <Badge variant="vr" className="gap-1">
                        <Eye className="h-3 w-3" />
                        VR / 3D
                      </Badge>
                    )}
                  </div>
                )}
                {product.rating_average && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(product.rating_average!) ? "fill-secondary text-secondary" : "text-border"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground mr-1">({product.rating_average.toFixed(1)})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-baseline gap-2">
                  {isCatalogOnly ? (
                    <span className="text-base font-semibold text-secondary">السعر حسب الطلب</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-foreground">
                        {(product.sale_price || product.price).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">ر.س</span>
                      {product.sale_price && (
                        <span className="text-sm text-muted-foreground line-through">{product.price.toLocaleString()}</span>
                      )}
                    </>
                  )}
                </div>
                {isCatalogOnly ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل
                  </span>
                ) : (
                  <Button size="sm" className="gap-2 rounded-xl" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    أضف للسلة
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link to={`/product/${product.slug}`} className="group block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_2px_12px_-4px_hsl(var(--foreground)/0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/50 hover:shadow-[0_24px_50px_-18px_hsl(var(--secondary)/0.35)]">
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/60 via-muted/30 to-background">
            {!imageLoaded && (
              !isUploadedModel && <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {isUploadedModel ? (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-navy-light to-secondary/70 p-6 text-primary-foreground">
                <div className="text-center">
                  <Box className="mx-auto mb-4 h-14 w-14 text-secondary" />
                  <p className="font-display text-lg font-bold">نموذج ثلاثي الأبعاد</p>
                  <p className="mt-2 text-xs text-primary-foreground/85">جاهز للمعاينة أو التحميل</p>
                </div>
              </div>
            ) : (
              <img
                src={getProductImage()}
                alt={product.name_ar}
                loading="lazy"
                className={`h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.08] ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-foreground/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Top Badges — calm, unified pills */}
            <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
              {product.is_new && (
                <Badge className="gap-1 rounded-full border border-secondary/30 bg-card/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-foreground backdrop-blur-md">
                  <Sparkles className="h-2.5 w-2.5 text-secondary" />
                  جديد
                </Badge>
              )}
              {supportsImmersivePreview && (
                <Badge className="gap-1 rounded-full border border-secondary/30 bg-card/90 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
                  <Eye className="h-2.5 w-2.5 text-secondary" />
                  VR / 3D
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="rounded-full border border-destructive/30 bg-destructive/90 px-2.5 py-0.5 text-[10px] font-bold text-destructive-foreground backdrop-blur-md">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              aria-label="إضافة للمفضلة"
              className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/85 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-card hover:shadow-soft"
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? "scale-110 fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>

            {/* Catalog code chip on image */}
            {catalogMeta?.displayCode && (
              <div className="absolute bottom-3 right-3 z-10 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-foreground/80 backdrop-blur-md">
                {catalogMeta.displayCode}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            {/* Rating */}
            <div className="mb-2 flex items-center justify-between min-h-[18px]">
              {product.rating_average ? (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.round(product.rating_average!) ? "fill-secondary text-secondary" : "text-border"}`}
                    />
                  ))}
                  <span className="mr-1 text-[11px] text-muted-foreground">
                    ({product.rating_average.toFixed(1)})
                  </span>
                </div>
              ) : <span />}
              {catalogAssetCount > 0 && (
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  {catalogAssetCount} ملف
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-display text-[15px] font-semibold leading-snug text-foreground line-clamp-2 min-h-[2.75em] transition-colors duration-300 group-hover:text-secondary">
              {product.name_ar}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.name_en}</p>

            {/* Divider */}
            <div className="my-3 h-px bg-gradient-to-l from-transparent via-border to-transparent" />

            {/* Price */}
            <div className="mb-3 flex min-h-[2.5rem] flex-col justify-end">
              {isCatalogOnly ? (
                <span className="text-sm font-bold text-secondary">السعر حسب الطلب</span>
              ) : product.sale_price ? (
                <>
                  <span className="text-[11px] text-muted-foreground line-through">
                    {product.price.toLocaleString()} ر.س
                  </span>
                  <span className="font-display text-xl font-bold text-secondary">
                    {product.sale_price.toLocaleString()}
                    <span className="mr-1 text-xs font-medium text-muted-foreground">ر.س</span>
                  </span>
                </>
              ) : (
                <span className="font-display text-xl font-bold text-foreground">
                  {product.price.toLocaleString()}
                  <span className="mr-1 text-xs font-medium text-muted-foreground">ر.س</span>
                </span>
              )}
            </div>

            {/* CTA Row */}
            <div className="mt-auto flex items-center gap-2">
              <span className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 text-xs font-semibold text-foreground transition-colors group-hover:border-secondary/50 group-hover:text-secondary">
                <Eye className="h-3.5 w-3.5" />
                عرض التفاصيل
              </span>
              {!isCatalogOnly && (
                <Button
                  size="icon"
                  aria-label="أضف للسلة"
                  className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-charcoal shadow-gold transition-all hover:shadow-elevated"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
