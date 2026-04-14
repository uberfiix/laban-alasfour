import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Maximize2, Eye, Box, Smartphone, Monitor, ChevronRight, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModelViewer } from "@/components/ModelViewer";
import { supabase } from "@/integrations/supabase/client";
import { getCatalogModelUrl, getProductPrimaryImage, hasCatalogModel } from "@/lib/catalog-links";
import { getCatalogFallbackProducts } from "@/lib/catalog-fallback";
import { Link } from "react-router-dom";
import vrExperienceImage from "@/assets/vr-experience.jpg";
import type { Json } from "@/integrations/supabase/types";

interface VRProduct {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  images: Json;
  model_3d_url: string | null;
  has_vr_experience: boolean | null;
  slug: string;
}

const features = [
  {
    icon: Eye,
    title: "رؤية 360°",
    description: "شاهد الأثاث من جميع الزوايا بتفاصيل عالية الدقة",
  },
  {
    icon: Box,
    title: "نماذج ثلاثية الأبعاد",
    description: "استكشف النماذج التفاعلية للمنتجات قبل الشراء",
  },
  {
    icon: Smartphone,
    title: "تجربة الواقع المعزز",
    description: "ضع الأثاث في غرفتك باستخدام كاميرا هاتفك",
  },
  {
    icon: Monitor,
    title: "معاينة حية",
    description: "شاهد كيف سيبدو الأثاث في بيئتك الفعلية",
  },
];

const steps = [
  {
    number: "01",
    title: "اختر المنتج",
    description: "تصفح كتالوج المنتجات واختر القطعة التي تريد تجربتها",
  },
  {
    number: "02",
    title: "افتح تجربة VR",
    description: "اضغط على زر تجربة VR للدخول في العرض التفاعلي",
  },
  {
    number: "03",
    title: "استكشف وتفاعل",
    description: "قم بتدوير المنتج، تكبيره، ومشاهدته من جميع الزوايا",
  },
  {
    number: "04",
    title: "جربه في غرفتك",
    description: "استخدم AR لوضع المنتج في مساحتك الفعلية",
  },
];

export default function VRExperiencePage() {
  const [vrProducts, setVRProducts] = useState<VRProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVRProducts();
  }, []);

  const fetchVRProducts = async () => {
    try {
      const { data } = await supabase
        .from("products")
        .select("id, name_ar, name_en, price, images, model_3d_url, has_vr_experience, slug")
        .eq("is_active", true)
        .limit(24);

      const productsWithVR = (data || [])
        .filter((product) => product.has_vr_experience || product.model_3d_url || hasCatalogModel(product.slug))
        .slice(0, 8);

      setVRProducts(productsWithVR.length > 0 ? productsWithVR : getCatalogFallbackProducts({ requireModel: true, limit: 8 }));
    } catch (error) {
      console.error("Error fetching VR products:", error);
      setVRProducts(getCatalogFallbackProducts({ requireModel: true, limit: 8 }));
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: VRProduct) => {
    return getProductPrimaryImage(product.images, product.slug);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      constFeaturedModelUrl

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={vrExperienceImage}
            alt="VR Experience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,40,0.85)_0%,rgba(18,28,40,0.7)_50%,rgba(18,28,40,0.92)_100%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center pt-20" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30">
              تقنية حصرية
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
              تجربة الواقع الافتراضي
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/84 max-w-3xl mx-auto mb-10">
              استكشف الأثاث بتقنية ثلاثية الأبعاد متطورة واستمتع بتجربة تسوق غامرة تجعلك ترى المنتج كما لو كان أمامك
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2 text-lg px-8">
                <Play className="h-5 w-5" />
                ابدأ التجربة
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                شاهد الفيديو التعريفي
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: "500+", label: "منتج بتقنية VR" },
              { value: "50K+", label: "تجربة مكتملة" },
              { value: "4.9", label: "تقييم المستخدمين" },
              { value: "360°", label: "زاوية مشاهدة" },
            ].map((stat, index) => (
              <div key={index} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/15">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">{stat.value}</div>
                <div className="text-sm text-primary-foreground/82">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              مميزات تجربة VR
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              تقنيات متطورة لتجربة تسوق استثنائية
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-secondary/40 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" dir="rtl">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              كيف تعمل التجربة؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              خطوات بسيطة للاستمتاع بتجربة VR
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-secondary/15 absolute -top-4 right-0">
                  {step.number}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -left-4 h-8 w-8 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VR Products */}
      <section className="py-20 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                منتجات بتجربة VR
              </h2>
              <p className="text-muted-foreground">
                استكشف المنتجات التي تدعم تقنية الواقع الافتراضي
              </p>
            </div>
            <Link to="/living">
              <Button variant="outline" className="gap-2">
                عرض الكل
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </motion.div>

          {/* Featured 3D Model Viewer */}
          {vrProducts.length > 0 && (getCatalogModelUrl(vrProducts[0].slug) || vrProducts[0].model_3d_url) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <ModelViewer
                  modelUrl={(getCatalogModelUrl(vrProducts[0].slug) || vrProducts[0].model_3d_url)!}
                  className="aspect-[4/3] lg:aspect-auto lg:min-h-[450px]"
                />
                <div className="flex flex-col justify-center p-6 rounded-2xl border border-border/50 bg-card">
                  <Badge variant="vr" className="w-fit mb-4 gap-1">
                    <View className="h-3 w-3" /> عرض ثلاثي الأبعاد مباشر
                  </Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{vrProducts[0].name_ar}</h3>
                  <p className="text-muted-foreground leading-7 mb-6">
                    قم بتدوير النموذج، تكبيره، ومشاهدته من جميع الزوايا. استخدم الماوس أو إصبعك للتحكم بالعرض.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-secondary">{vrProducts[0].price.toLocaleString()} ر.س</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/product/${vrProducts[0].slug}`}>
                      <Button variant="secondary" className="gap-2">
                        <Eye className="h-4 w-4" />
                        تفاصيل المنتج
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري تحميل منتجات VR...
            </div>
          ) : vrProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vrProducts.map((product, index) => {
                const modelUrl = getCatalogModelUrl(product.slug);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/product/${product.slug}`}>
                      <Card className="group overflow-hidden hover:border-secondary/40 transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={getProductImage(product)}
                            alt={product.name_ar}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <Badge variant="vr" className="gap-1">
                              <Box className="h-3 w-3" /> VR
                            </Badge>
                            {modelUrl && (
                              <Badge className="bg-secondary/90 text-secondary-foreground gap-1 text-[10px]">
                                3D مباشر
                              </Badge>
                            )}
                          </div>

                          {/* VR Button Overlay */}
                          <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Button variant="secondary" className="gap-2">
                              <Play className="h-4 w-4" />
                              تجربة VR
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
                            {product.name_ar}
                          </h3>
                          <p className="text-secondary font-bold mt-2">{product.price.toLocaleString()} ر.س</p>
                          {modelUrl && (
                            <p className="mt-2 text-xs text-muted-foreground">ملف 3D مباشر من المخزن السحابي</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد منتجات بتجربة VR متاحة حالياً
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 text-center border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              جاهز لتجربة المستقبل؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              انضم إلى آلاف العملاء الذين استمتعوا بتجربة التسوق بتقنية الواقع الافتراضي
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/living">
                <Button size="lg" className="gap-2">
                  تصفح المنتجات
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                تحميل تطبيق VR
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
