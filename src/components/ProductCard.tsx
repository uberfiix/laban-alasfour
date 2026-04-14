import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Eye, Heart, ShoppingCart, Sparkles } from "lucide-react";
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
              <img
                src={getProductImage()}
                alt={product.name_ar}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onLoad={() => setImageLoaded(true)}
              />
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
    >
      <Link to={`/product/${product.slug}`} className="block group">
        <div className="relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-secondary/40 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_hsl(var(--secondary)/0.15)] hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={getProductImage()}
              alt={product.name_ar}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {product.is_new && (
                <Badge className="bg-secondary text-secondary-foreground font-semibold shadow-lg gap-1 px-3">
                  <Sparkles className="h-3 w-3" />
                  جديد
                </Badge>
              )}
              {supportsImmersivePreview && (
                <Badge variant="outline" className="bg-card/90 backdrop-blur-md border-secondary/30 text-foreground font-medium shadow-lg">
                  <Eye className="h-3 w-3" />
                  VR / 3D
                </Badge>
              )}
              {catalogMeta?.hasModel && (
                <Badge variant="outline" className="border-border/50 bg-card/90 text-foreground font-medium shadow-lg backdrop-blur-md">
                  3D مباشر
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground font-bold shadow-lg px-3">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Like Button - Always Visible */}
            <button
              onClick={handleLike}
              className="absolute top-3 left-3 z-10 h-9 w-9 rounded-full bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110"
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? "fill-destructive text-destructive scale-110" : "text-muted-foreground"}`} />
            </button>

            {/* Bottom Actions - On Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
              {isCatalogOnly ? (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-card/90 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg backdrop-blur-md">
                  <Eye className="h-4 w-4 text-secondary" />
                  عرض التفاصيل
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 rounded-xl backdrop-blur-md gap-2 font-semibold shadow-lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  أضف للسلة
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl bg-card/90 backdrop-blur-md border-border/50 shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Rating */}
            {product.rating_average && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.rating_average!) ? "fill-secondary text-secondary" : "text-border"}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground mr-1">
                  ({product.rating_average.toFixed(1)})
                </span>
              </div>
            )}

            {/* Name */}
            <h3 className="font-display font-semibold text-foreground group-hover:text-secondary transition-colors duration-300 line-clamp-2 leading-relaxed">
              {product.name_ar}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{product.name_en}</p>
            {(catalogMeta || supportsImmersivePreview) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {catalogMeta?.displayCode && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
                    {catalogMeta.displayCode}
                  </span>
                )}
                {catalogAssetCount > 0 && (
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                    {catalogAssetCount} ملف
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-1">
              {isCatalogOnly ? (
                <span className="text-sm font-semibold text-secondary">السعر حسب الطلب</span>
              ) : product.sale_price ? (
                <>
                  <span className="text-xl font-bold text-foreground">
                    {product.sale_price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">ر.س</span>
                  <span className="text-sm text-muted-foreground line-through mr-auto">
                    {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold text-foreground">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">ر.س</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
