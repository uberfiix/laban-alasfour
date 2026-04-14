import { motion } from "framer-motion";
import { ArrowLeft, Headset, Layers3, LampDesk, Play, ScanSearch, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import vrImage from "@/assets/vr-experience.jpg";

const features = [
  {
    icon: ScanSearch,
    title: "افحص النسب والحجم",
    description: "تأكد أن الوحدة تناسب الجدار فعلاً قبل أن تبدأ الشحنة أو التنفيذ.",
  },
  {
    icon: LampDesk,
    title: "بدّل سيناريو الإضاءة",
    description: "قارن بين درجات الضوء الدافئ والمحايد وشاهد أثرها على لون الخشب.",
  },
  {
    icon: Layers3,
    title: "جرّب أكثر من تشطيب",
    description: "استعرض الجوز والبلوط والدرجات الداكنة ضمن المشهد نفسه.",
  },
];

export function VRExperience() {
  return (
    <section className="relative overflow-hidden py-32" dir="rtl">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)",
          backgroundSize: "38px 38px",
        }}
      />
      <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-secondary/8 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <span className="inline-block text-xs font-medium uppercase tracking-[0.24em] text-secondary/85">
              — التجربة التي تحسم القرار
            </span>

            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              شاهد الوحدة الخشبية
              <span className="block text-secondary">والضوء المحيط بها قبل أن تشتريها</span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-primary-foreground/94 md:text-lg">
              VR هنا ليس مجرد ميزة إضافية. هو أداة لتقليل التردد: هل المقاس صحيح؟ هل الإضاءة
              ناعمة أم حادة؟ هل الخشب يبدو دافئاً مع أرضيتك الحالية؟ نمنحك إجابة مرئية قبل القرار.
            </p>

            <div className="mt-10 space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.35 + index * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/6 p-4 backdrop-blur-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/12">
                    <feature.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-primary-foreground/90">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/vr">
                <Button variant="secondary" size="lg" className="group">
                  ابدأ تجربة VR
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                className="text-primary-foreground hover:bg-secondary/10 hover:text-secondary"
              >
                <Play className="ml-2 h-5 w-5" />
                شاهد كيف تعمل التجربة
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-primary-foreground/10 bg-primary-foreground/5 p-3 backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <div className="aspect-[4/5] lg:aspect-[5/6]">
                  <img src={vrImage} alt="تجربة معاينة وحدات خشبية وإضاءة عبر VR" className="h-full w-full object-cover" />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,40,0.08)_0%,rgba(18,28,40,0.52)_100%)]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    className="group flex h-20 w-20 items-center justify-center rounded-full bg-secondary/92 shadow-gold"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="mr-[-2px] h-8 w-8 fill-current text-secondary-foreground" />
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.75 }}
              className="absolute -bottom-6 -left-3 rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-elevated lg:-left-8"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold">
                  <Headset className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-foreground">+2,000</div>
                  <div className="text-xs text-muted-foreground">جلسة معاينة قبل الشراء</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.9 }}
              className="absolute -right-2 top-8 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/8 p-4 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15">
                  <Smartphone className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">تجربة من الجوال أو النظارة</p>
                  <p className="text-xs text-primary-foreground/92">للوصول السريع أو الغامر حسب الحاجة</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
