import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getCatalogFallbackProducts } from "@/lib/catalog-fallback";

type FeaturedProduct = {
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

type FeaturedProductRow = FeaturedProduct & {
  is_featured: boolean | null;
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name_ar, name_en, price, sale_price, images, rating_average, is_new, has_vr_experience, slug, is_featured")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) {
          throw error;
        }

        if (isMounted) {
          const featuredProducts = ((data as FeaturedProductRow[] | null) || []).map(({ is_featured, ...product }) => product);
          setProducts(featuredProducts.length > 0 ? featuredProducts : getCatalogFallbackProducts({ limit: 4 }));
        }
      } catch (error) {
        console.error("Error loading featured products:", error);
        if (isMounted) {
          setProducts(getCatalogFallbackProducts({ limit: 4 }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-muted/20 py-28" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-[0.22em] text-secondary">
              — اختيارات البداية
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              وحدات مختارة
              <span className="block text-gradient-gold">تعكس هوية المتجر من أول نظرة</span>
            </h2>
          </div>
          <div className="max-w-xl">
            <p className="text-sm leading-8 text-muted-foreground md:text-base">
              نعرض هنا منتجات حقيقية من المخزون الحالي مع ملفات الكتالوج المرتبطة بها، لتبدأ من قطع
              جاهزة للمعاينة والبحث والانتقال السلس إلى تجربة VR.
            </p>
            <Link to="/living" className="mt-5 inline-block">
              <Button variant="outline" className="group border-border/60 hover:border-secondary">
                عرض جميع المنتجات
                <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.8rem] border border-border/50 bg-card shadow-soft"
              >
                <div className="aspect-[4/5] animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-6 w-4/5 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-muted" />
                  <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-border/50 bg-card p-10 text-center text-muted-foreground shadow-soft">
            ستظهر المنتجات المضافة في لوحة التحكم هنا تلقائياً بمجرد توفرها في الكتالوج.
          </div>
        )}
      </div>
    </section>
  );
}
