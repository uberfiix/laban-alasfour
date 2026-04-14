import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3, LayoutList, SlidersHorizontal, Loader2, Search, X, ChevronDown, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getCatalogSearchMetadata, normalizeCatalogSearchValue } from "@/lib/catalog-links";
import { getCatalogFallbackProducts } from "@/lib/catalog-fallback";

interface Product {
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
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string | null;
  image_url: string | null;
}

type CatalogAwareProduct = Product & {
  catalogMeta: ReturnType<typeof getCatalogSearchMetadata>;
  effectivePrice: number;
};

const categorySlugMap: Record<string, string> = {
  living: "غرف-المعيشة",
  bedroom: "غرف-النوم",
  lighting: "الإضاءة",
  kitchen: "المطابخ",
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derive slug from path or param
  const currentSlug = useMemo(() => {
    const path = location.pathname.replace("/", "");
    if (categorySlugMap[path]) return path;
    return category || "";
  }, [location.pathname, category]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name_ar, name_en, slug, description_ar, image_url")
        .eq("is_active", true)
        .order("sort_order");
      setAllCategories(cats || []);

      const arabicSlug = currentSlug ? categorySlugMap[currentSlug] || currentSlug : "";

      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .or(`slug.eq.${currentSlug},slug.eq.${arabicSlug}`)
        .single();

        const fallbackProducts = getCatalogFallbackProducts({ category: currentSlug });

      if (catData) {
        setCategoryInfo(catData);
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name_ar, name_en, price, sale_price, images, rating_average, is_new, has_vr_experience, slug")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
          setProducts((productsData?.length ?? 0) > 0 ? productsData || [] : fallbackProducts);
      } else {
        setCategoryInfo(null);
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name_ar, name_en, price, sale_price, images, rating_average, is_new, has_vr_experience, slug")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
          setProducts((productsData?.length ?? 0) > 0 ? productsData || [] : fallbackProducts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
        setProducts(getCatalogFallbackProducts({ category: currentSlug }));
    } finally {
      setLoading(false);
    }
  }, [currentSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const catalogAwareProducts = useMemo<CatalogAwareProduct[]>(
    () =>
      products.map((product) => ({
        ...product,
        catalogMeta: getCatalogSearchMetadata(product.slug),
        effectivePrice: product.sale_price ?? product.price,
      })),
    [products],
  );

  const priceCeiling = useMemo(() => {
    const highestPrice = catalogAwareProducts.reduce(
      (maxPrice, product) => Math.max(maxPrice, product.effectivePrice),
      0,
    );

    if (highestPrice <= 0) {
      return 50000;
    }

    if (highestPrice <= 5000) {
      return 5000;
    }

    return Math.ceil(highestPrice / 1000) * 1000;
  }, [catalogAwareProducts]);

  useEffect(() => {
    setPriceRange((currentRange) => {
      if (currentRange[0] === 0 && currentRange[1] === priceCeiling) {
        return currentRange;
      }

      return [0, priceCeiling];
    });
  }, [currentSlug, priceCeiling]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeCatalogSearchValue(searchQuery);

    return catalogAwareProducts
      .filter((p) => {
        const searchableText = [
          normalizeCatalogSearchValue(p.name_ar),
          normalizeCatalogSearchValue(p.name_en),
          normalizeCatalogSearchValue(p.slug),
          p.catalogMeta?.normalizedSearchText ?? "",
        ].join(" ");

        const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
        const matchesPrice = p.effectivePrice >= priceRange[0] && p.effectivePrice <= priceRange[1];
        return matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc": return a.effectivePrice - b.effectivePrice;
          case "price-desc": return b.effectivePrice - a.effectivePrice;
          case "rating": return (b.rating_average || 0) - (a.rating_average || 0);
          default: return 0;
        }
      });
  }, [catalogAwareProducts, searchQuery, priceRange, sortBy]);

  const categoryTitle = categoryInfo?.name_ar || getCategoryTitle(currentSlug);
  const activeFilters = (searchQuery.trim() ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < priceCeiling ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Premium Hero */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary/80" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-16 h-0.5 bg-secondary mx-auto mb-6"
            />

            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
              {categoryTitle}
            </h1>
            <p className="text-primary-foreground/78 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              {categoryInfo?.description_ar || "اكتشف مجموعتنا الحصرية من الأثاث الفاخر والتصاميم العصرية"}
            </p>

            {/* Product Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10"
            >
              <Package className="h-4 w-4 text-secondary" />
              <span className="text-primary-foreground/88 text-sm">
                {loading ? "..." : `${filteredProducts.length} منتج متاح`}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-8 p-3 md:p-4 bg-card rounded-2xl border border-border/50 shadow-soft"
          >
            {/* Left: Filters & Search */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-xl relative shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">الفلاتر</span>
                    {activeFilters > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle className="font-display text-xl">تصفية المنتجات</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-8">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-semibold mb-4 block text-foreground">نطاق السعر</label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={priceCeiling}
                        step={250}
                        className="mt-3"
                      />
                      <div className="flex justify-between mt-3">
                        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
                          {priceRange[0].toLocaleString()} ر.س
                        </span>
                        <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
                          {priceRange[1].toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Sort in filter panel for mobile */}
                    <div>
                      <label className="text-sm font-semibold mb-4 block text-foreground">الترتيب</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "newest", label: "الأحدث" },
                          { value: "price-asc", label: "الأقل سعراً" },
                          { value: "price-desc", label: "الأعلى سعراً" },
                          { value: "rating", label: "الأعلى تقييماً" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                              sortBy === opt.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-secondary/50 text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                          setPriceRange([0, priceCeiling]);
                        setSearchQuery("");
                        setSortBy("newest");
                      }}
                    >
                      إعادة تعيين الكل
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث باسم المنتج أو اسم المجلد أو الملف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 rounded-xl border-border/50 bg-muted/70 placeholder:text-muted-foreground focus:bg-card"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Sort & View Toggle */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 rounded-xl border-border/50 hidden md:flex">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-asc">السعر: الأقل</SelectItem>
                  <SelectItem value="price-desc">السعر: الأعلى</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-xl border border-border/50 overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 text-xs leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">بحث أذكى:</span>
            <span>يمكنك الآن البحث باسم المنتج، كود المجلد، أو اسم أي ملف مرتبط مثل AM-01 أو white-2.</span>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground text-sm">جاري تحميل المنتجات...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                لم نتمكن من العثور على منتجات تطابق اسم المنتج أو اسم المجلد أو الملف الذي تبحث عنه. جرّب تعديل الفلاتر.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange([0, priceCeiling]);
                }}
              >
                إعادة تعيين الفلاتر
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function getCategoryTitle(slug: string): string {
  const titles: Record<string, string> = {
    living: "غرف المعيشة",
    bedroom: "غرف النوم",
    lighting: "الإضاءة",
    kitchen: "المطابخ",
  };
  return titles[slug] || "جميع المنتجات";
}
