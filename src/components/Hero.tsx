import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Boxes, ChevronDown, LampFloor, Play, ScanSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-living-room.jpg";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

const heroHighlights = [
  { icon: Boxes, label: "وحدات خشبية بتفاصيل تنفيذية دقيقة" },
  { icon: LampFloor, label: "إضاءة وظيفية وزخرفية ضمن نفس التكوين" },
  { icon: ScanSearch, label: "معاينة المنتج داخل المساحة عبر VR قبل الطلب" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <motion.img
          src={heroImage}
          alt="وحدات خشبية راقية مع إضاءة داخلية وتجربة عرض واقعية"
          className="h-[118%] w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(18,28,40,0.94)_0%,rgba(18,28,40,0.78)_42%,rgba(18,28,40,0.52)_70%,rgba(18,28,40,0.76)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,162,66,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(140,94,42,0.28),transparent_28%)]" />
      </motion.div>

      <motion.div
        className="relative z-10 container mx-auto flex min-h-[100svh] items-center px-4 pb-32 pt-24"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="grid w-full items-end gap-12 lg:grid-cols-[1.3fr_0.7fr]" dir="rtl">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-7"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/12 px-5 py-2.5 text-sm font-medium text-secondary backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                متجر متخصص في الوحدات الخشبية ووحدات الإضاءة مع تجربة VR قبل الشراء
              </span>
            </motion.div>

            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                className="font-display text-5xl font-bold leading-[1.02] text-primary-foreground md:text-7xl xl:text-8xl"
              >
                وحدات خشبية
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="font-display text-5xl font-bold leading-[1.02] text-secondary md:text-7xl xl:text-8xl"
              >
                وإضاءة محسوبة
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
                className="font-display text-4xl font-bold leading-[1.08] text-primary-foreground md:text-6xl xl:text-7xl"
              >
                تُجرَّب داخل مساحتك قبل اعتماد الطلب
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85 }}
                className="mt-8 max-w-2xl text-base leading-8 text-primary-foreground/96 md:text-lg"
            >
              نصمم تجربة شراء أوضح وأكثر ثقة: وحدات تلفاز، مكتبات، حلول تخزين، وطقم إضاءة
              متكامل يظهر لك قبل التنفيذ عبر VR، حتى ترى الخامة، توزيع الضوء، وحجم القطعة في
              مكانها الفعلي لا في صورة معزولة.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-8 grid gap-3 md:max-w-2xl md:grid-cols-3"
            >
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-primary-foreground/16 bg-primary-foreground/10 p-4 backdrop-blur-md"
                >
                  <item.icon className="mb-3 h-5 w-5 text-secondary" />
                  <p className="text-sm leading-6 text-primary-foreground/95">{item.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/living">
                <Button variant="hero" size="lg" className="group text-base">
                  ابدأ بالوحدات الخشبية
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Link to="/vr">
                <Button
                  variant="heroOutline"
                  size="lg"
                  className="group border-primary-foreground/20 text-base text-primary-foreground hover:border-secondary hover:text-secondary"
                >
                  <Play className="ml-2 h-5 w-5" />
                  جرّب المنتج عبر VR
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="hidden lg:block"
          >
            <div className="relative mr-auto max-w-sm">
              <div className="rounded-[2rem] border border-primary-foreground/16 bg-primary-foreground/10 p-6 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs tracking-[0.25em] text-primary-foreground/92">DESIGN SNAPSHOT</span>
                  <span className="rounded-full bg-secondary/18 px-3 py-1 text-xs font-semibold text-secondary">VR READY</span>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-primary-foreground/12 bg-black/15 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/88">خامة مقترحة</p>
                    <p className="mt-2 font-display text-2xl text-primary-foreground">جوز طبيعي مع نحاس معتّق</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-primary-foreground/12 bg-black/15 p-4">
                      <p className="text-xs text-primary-foreground/88">مستوى الإضاءة</p>
                      <p className="mt-2 text-2xl font-bold text-secondary">3000K</p>
                      <p className="mt-1 text-xs text-primary-foreground/92">دفء بصري مثالي للخشب</p>
                    </div>
                    <div className="rounded-2xl border border-primary-foreground/12 bg-black/15 p-4">
                      <p className="text-xs text-primary-foreground/88">زمن المعاينة</p>
                      <p className="mt-2 text-2xl font-bold text-secondary">5 دقائق</p>
                      <p className="mt-1 text-xs text-primary-foreground/92">حتى ترى المشهد قبل الشراء</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-secondary/35 bg-secondary/12 p-5">
                    <p className="text-sm leading-7 text-primary-foreground/95">
                      نعرض لك القطعة داخل المشهد الحقيقي، مع إمكانية مقارنة الخامات ودرجات الضوء
                      قبل اتخاذ القرار.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.25 }}
        className="absolute inset-x-0 bottom-0 z-10"
      >
        <div className="container mx-auto px-4">
          <div className="rounded-t-[2rem] border border-border/30 bg-card/95 shadow-elevated backdrop-blur-xl">
            <div className="grid grid-cols-2 divide-x divide-border/30 rtl:divide-x-reverse md:grid-cols-4" dir="rtl">
              {[
                { value: 240, suffix: "+", label: "وحدة خشبية قابلة للتخصيص" },
                { value: 90, suffix: "+", label: "تكوين إضاءة مدروس" },
                { value: 1200, suffix: "+", label: "جلسة معاينة VR" },
                { value: 96, suffix: "%", label: "قرارات شراء أكثر وضوحاً" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.35 + index * 0.08 }}
                  className="px-4 py-6 text-center md:py-8"
                >
                  <div className="font-display text-3xl font-bold text-secondary md:text-4xl">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground md:text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ChevronDown className="h-5 w-5 text-primary-foreground/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
