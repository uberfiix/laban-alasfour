import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Play,
  Loader2,
  Check,
  Eye,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoomExperience } from "@/components/RoomExperience";
import { supabase } from "@/integrations/supabase/client";
import { getCatalogModelUrl, getProductImageUrls } from "@/lib/catalog-links";
import { getCatalogFallbackCategoryLabel, getCatalogFallbackProductBySlug } from "@/lib/catalog-fallback";
import { fetchUploadedProductModelBySlug } from "@/lib/uploaded-product-assets";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { buildWhatsAppLink } from "@/lib/company";
import type { Json } from "@/integrations/supabase/types";

interface Product {
  id: string;
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
}

interface Category {
  name_ar: string;
  slug: string;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error && !getCatalogFallbackProductBySlug(slug)) throw error;

      if (!data) {
        const fallbackProduct = getCatalogFallbackProductBySlug(slug);

        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setCategory({
            name_ar: getCatalogFallbackCategoryLabel(fallbackProduct.fallbackCategory),
            slug: fallbackProduct.fallbackCategory,
          });

          if (fallbackProduct.colors && fallbackProduct.colors.length > 0) {
            setSelectedColor(fallbackProduct.colors[0]);
          }

          return;
        }

        const uploadedModel = await fetchUploadedProductModelBySlug(slug);
        if (uploadedModel) {
          setProduct({
            id: uploadedModel.id,
            name_ar: uploadedModel.name_ar,
            name_en: uploadedModel.name_en,
            description_ar: `ملف ثلاثي الأبعاد مرفوع من لوحة الملفات (${uploadedModel.originalName}) ويمكن فتحه مباشرة لتجربة المنتج أو تحميله.`,
            description_en: uploadedModel.name_en,
            short_description_ar: `نموذج ${uploadedModel.extension.toUpperCase()} مباشر من مخزن ${uploadedModel.bucketId}.`,
            price: 0,
            sale_price: null,
            images: [{ url: "/placeholder.svg", is_primary: true }],
            rating_average: null,
            rating_count: null,
            is_new: true,
            has_vr_experience: true,
            model_3d_url: uploadedModel.modelUrl,
            video_url: null,
            colors: null,
            materials: null,
            dimensions: null,
            specifications: {
              "اسم الملف": uploadedModel.originalName,
              "الصيغة": uploadedModel.extension.toUpperCase(),
              "المخزن": uploadedModel.bucketId,
              "المسار": uploadedModel.filePath,
            },
            stock_quantity: 0,
            category_id: null,
          });
          setCategory({ name_ar: "ملفات 3D", slug: "vr" });
          return;
        }

        setProduct(null);
        return;
      }

      setProduct(data);

      if (data.category_id) {
        const { data: catData } = await supabase
          .from("categories")
          .select("name_ar, slug")
          .eq("id", data.category_id)
          .single();
        setCategory(catData);
      }

      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getImages = () => {
    if (!product) {
      return ["/placeholder.svg"];
    }

    return getProductImageUrls(product.images, slug);
  };

  const images = getImages();
  const resolvedModelUrl = getCatalogModelUrl(slug) || product?.model_3d_url || null;
  const hasVrExperience = Boolean(product?.has_vr_experience || resolvedModelUrl);
  const isCatalogOnly = Boolean(product && (product.id.startsWith("catalog-") || product.price <= 0));

  const getDimensions = (): { width?: number; height?: number; depth?: number } | null => {
    if (!product?.dimensions || typeof product.dimensions !== 'object' || Array.isArray(product.dimensions)) return null;
    const dims = product.dimensions as Record<string, unknown>;
    return {
      width: typeof dims.width === 'number' ? dims.width : undefined,
      height: typeof dims.height === 'number' ? dims.height : undefined,
      depth: typeof dims.depth === 'number' ? dims.depth : undefined,
    };
  };

  const getSpecifications = (): Record<string, string> | null => {
    if (!product?.specifications || typeof product.specifications !== 'object' || Array.isArray(product.specifications)) return null;
    return product.specifications as Record<string, string>;
  };

  const dimensions = getDimensions();
  const specifications = getSpecifications();

  const handleAddToCart = () => {
    if (!product) return;
    const imgs = getImages();
    addItem({
      id: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      sale_price: product.sale_price,
      image: imgs[0] || "/placeholder.svg",
      slug: slug || "",
    }, quantity);
    toast.success("تمت الإضافة إلى السلة");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <span className="text-sm text-muted-foreground">جاري تحميل المنتج...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 px-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3 font-display">المنتج غير موجود</h1>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <Link to="/">
            <Button variant="hero">العودة للرئيسية</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8 pb-16" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-secondary transition-colors">الرئيسية</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            {category && (
              <>
                <Link to={`/category/${category.slug}`} className="hover:text-secondary transition-colors">{category.name_ar}</Link>
                <ChevronLeft className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-foreground font-medium">{product.name_ar}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border/50 group">
                {!imageLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                )}
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name_ar}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  onLoad={() => setImageLoaded(true)}
                />

                {/* Top badges — calm unified pills */}
                <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                  {product.is_new && (
                    <Badge className="rounded-full border border-secondary/30 bg-card/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md">
                      جديد
                    </Badge>
                  )}
                  {hasVrExperience && (
                    <Badge className="gap-1 rounded-full border border-secondary/30 bg-card/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md">
                      <Play className="h-3 w-3 text-secondary" /> VR / 3D
                    </Badge>
                  )}
                  {discountPercent > 0 && (
                    <Badge className="rounded-full border border-destructive/30 bg-destructive/90 px-3 py-1 text-[11px] font-bold text-destructive-foreground backdrop-blur-md">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background shadow-soft"
                      onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background shadow-soft"
                      onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-xs text-muted-foreground border border-border/50">
                    <Eye className="w-3.5 h-3.5" />
                    اضغط للتكبير
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedImage(index); setImageLoaded(false); }}
                      className={`relative flex-shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden border transition-all duration-300 ${
                        selectedImage === index
                          ? "border-secondary ring-2 ring-secondary/25 ring-offset-2 ring-offset-background"
                          : "border-border/60 opacity-70 hover:opacity-100 hover:border-secondary/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Title */}
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
                  {product.name_ar}
                </h1>
                <p className="text-muted-foreground text-sm">{product.name_en}</p>
              </div>

              {/* Rating */}
              {product.rating_average && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.rating_average!)
                            ? "fill-secondary text-secondary"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating_average} ({product.rating_count} تقييم)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-y border-border/50 py-5">
                {isCatalogOnly ? (
                  <span className="font-display text-3xl font-bold text-secondary md:text-4xl">السعر حسب الطلب</span>
                ) : product.sale_price ? (
                  <>
                    <span className="font-display text-3xl font-bold text-secondary md:text-4xl">
                      {product.sale_price.toLocaleString()} <span className="text-lg">ر.س</span>
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.price.toLocaleString()} ر.س
                    </span>
                    <Badge className="rounded-full border border-destructive/25 bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive">
                      وفّر {(product.price - product.sale_price).toLocaleString()} ر.س
                    </Badge>
                  </>
                ) : (
                  <span className="font-display text-3xl font-bold text-foreground md:text-4xl">
                    {product.price.toLocaleString()} <span className="text-lg text-muted-foreground font-normal">ر.س</span>
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description_ar && (
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {product.short_description_ar}
                </p>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    اللون: <span className="text-secondary">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedColor === color
                            ? "border-secondary bg-secondary/10 text-secondary shadow-gold"
                            : "border-border hover:border-secondary/40 text-foreground/70"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {resolvedModelUrl && (
                <div className="space-y-3 rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">تجربة الغرفة الافتراضية</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        حرّك القطعة داخل الغرفة، غيّر لونها، ودوّرها لمعاينة كل التفاصيل.
                      </p>
                    </div>
                    <a href={resolvedModelUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="border-secondary/30 hover:border-secondary">
                        فتح ملف 3D
                      </Button>
                    </a>
                  </div>
                  <RoomExperience
                    modelUrl={resolvedModelUrl}
                    initialColors={product.colors}
                    className="h-[480px]"
                  />
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">الكمية</label>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-secondary" />
                    {isCatalogOnly
                      ? "متوفر عبر الطلب والاستفسار"
                      : product.stock_quantity > 0
                        ? `${product.stock_quantity} متوفر`
                        : "غير متوفر"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isCatalogOnly ? (
                    <a
                      href={buildWhatsAppLink(`أرغب في معرفة سعر المنتج ${product.name_ar} (${slug})`)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1"
                    >
                      <Button size="lg" variant="hero" className="h-12 w-full gap-2 text-base">
                        <ShoppingCart className="h-5 w-5" />
                        اطلب التسعير
                      </Button>
                    </a>
                  ) : (
                    <Button
                      size="lg"
                      variant="hero"
                      className="flex-1 gap-2 h-12 text-base"
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      أضف للسلة
                    </Button>
                  )}
                  <Button size="lg" variant="outline" className="h-12 w-12 rounded-xl border-border hover:border-secondary hover:text-secondary">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 w-12 rounded-xl border-border hover:border-secondary hover:text-secondary">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                {[
                  { icon: Truck, title: "توصيل مجاني", sub: "فوق 500 ر.س" },
                  { icon: Shield, title: "ضمان سنتين", sub: "ضمان شامل" },
                  { icon: RotateCcw, title: "استرجاع سهل", sub: "خلال 14 يوم" },
                ].map((feat) => (
                  <div key={feat.title} className="text-center p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <feat.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <p className="text-xs font-medium">{feat.title}</p>
                    <p className="text-[10px] text-muted-foreground">{feat.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <Tabs defaultValue="description" dir="rtl">
              <TabsList className="w-full justify-start border-b border-border/50 rounded-none bg-transparent h-auto p-0 gap-0">
                {[
                  { value: "description", label: "الوصف" },
                  { value: "specifications", label: "المواصفات" },
                  { value: "reviews", label: "التقييمات" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:text-secondary px-6 py-3 text-sm font-medium"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="description" className="mt-8">
                <div className="prose prose-lg max-w-none text-muted-foreground bg-card rounded-2xl border border-border/50 p-8">
                  {product.description_ar || "لا يوجد وصف متاح لهذا المنتج."}
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {dimensions && (
                    <div className="bg-card rounded-2xl p-6 border border-border/50">
                      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-secondary rounded-full" />
                        الأبعاد
                      </h3>
                      <div className="space-y-3 text-sm">
                        {dimensions.width && (
                          <div className="flex justify-between py-2 border-b border-border/30">
                            <span className="text-muted-foreground">العرض</span>
                            <span className="font-medium">{dimensions.width} سم</span>
                          </div>
                        )}
                        {dimensions.height && (
                          <div className="flex justify-between py-2 border-b border-border/30">
                            <span className="text-muted-foreground">الارتفاع</span>
                            <span className="font-medium">{dimensions.height} سم</span>
                          </div>
                        )}
                        {dimensions.depth && (
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">العمق</span>
                            <span className="font-medium">{dimensions.depth} سم</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {product.materials && product.materials.length > 0 && (
                    <div className="bg-card rounded-2xl p-6 border border-border/50">
                      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-secondary rounded-full" />
                        المواد
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((material) => (
                          <span key={material} className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {specifications && Object.keys(specifications).length > 0 && (
                    <div className="bg-card rounded-2xl p-6 border border-border/50 md:col-span-2">
                      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-secondary rounded-full" />
                        مواصفات إضافية
                      </h3>
                      <div className="grid md:grid-cols-2 gap-x-8">
                        {Object.entries(specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-border/30 text-sm">
                            <span className="text-muted-foreground">{key}</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <Star className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">لا توجد تقييمات بعد</p>
                  <p className="text-sm text-muted-foreground/70">كن أول من يقيم هذا المنتج!</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
