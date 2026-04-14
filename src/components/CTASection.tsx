import { motion } from "framer-motion";
import { ArrowLeft, Phone, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { buildPhoneLink } from "@/lib/company";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-28" dir="rtl">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-[130px]" />
      <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-secondary/8 blur-[110px]" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl rounded-[2rem] border border-primary-foreground/10 bg-primary-foreground/6 p-8 text-center backdrop-blur-xl md:p-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
            <ScanSearch className="h-4 w-4" />
            القرار يبدأ بالمعاينة
          </span>

          <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
            هل تريد أن ترى الوحدة
            <span className="block text-secondary">والإضاءة في مساحتك قبل الطلب؟</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-primary-foreground/92 md:text-lg">
            ابدأ من المنتجات الجاهزة، أو اطلب استشارة سريعة لنحدد لك التكوين المناسب من الخشب
            والإضاءة، ثم نجهز لك تجربة VR تمنحك وضوحاً حقيقياً قبل الشراء.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/vr">
              <Button variant="hero" size="lg" className="group text-base">
                ابدأ تجربة VR
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
            <Link to="/lighting">
              <Button
                variant="heroOutline"
                size="lg"
                className="group border-primary-foreground/20 text-base text-primary-foreground hover:border-secondary hover:text-secondary"
              >
                تصفح وحدات الإضاءة
              </Button>
            </Link>
            <a href={buildPhoneLink()}>
              <Button
                variant="ghost"
                size="lg"
                className="text-base text-primary-foreground hover:bg-secondary/10 hover:text-secondary"
              >
                <Phone className="ml-2 h-5 w-5" />
                تواصل مع فريق المبيعات
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
