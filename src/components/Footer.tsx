import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Send,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  ScanSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyProfile } from "@/lib/company";
import logo from "@/assets/logo.png";

const footerLinks = {
  products: [
    { name: "وحدات المعيشة", href: "/living" },
    { name: "غرف النوم", href: "/bedroom" },
    { name: "وحدات الإضاءة", href: "/lighting" },
    { name: "حلول المطابخ", href: "/kitchen" },
    { name: "تجربة VR", href: "/vr" },
  ],
  company: [
    { name: "عن المتجر", href: "/about" },
    { name: "آلية المعاينة", href: "/vr" },
    { name: "حلول المشاريع", href: "/projects" },
    { name: "تواصل معنا", href: "/contact" },
  ],
  support: [
    { name: "الأسئلة الشائعة", href: "/faq" },
    { name: "الشحن والتركيب", href: "/shipping" },
    { name: "سياسة الاسترجاع", href: "/returns" },
    { name: "دليل الخامات", href: "/materials" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

const trustFeatures = [
  { icon: Truck, label: "شحن وتركيب", desc: "تنسيق واضح حتى التسليم" },
  { icon: Shield, label: "ضمان جودة", desc: "خامات وتشطيبات مدروسة" },
  { icon: RotateCcw, label: "قرار أوضح", desc: "معاينة قبل الدفع" },
  { icon: CreditCard, label: "دفع آمن", desc: "وسائل دفع متعددة" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background" dir="rtl">
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 divide-y divide-background/10 md:grid-cols-4 md:divide-x md:divide-y-0 md:rtl:divide-x-reverse">
            {trustFeatures.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 px-4 py-6 md:justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <feature.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-background/92">{feature.label}</p>
                  <p className="text-xs text-background/82">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-between gap-10 lg:flex-row"
          >
            <div className="max-w-lg text-center lg:text-right">
              <h3 className="font-display text-3xl font-bold">
                محتوى يلهمك لاختيار
                <span className="block text-gradient-gold">الخامة والإضاءة بشكل أدق</span>
              </h3>
              <p className="mt-4 text-sm leading-7 text-background/86">
                اشترك ليصلك الجديد من الوحدات الخشبية، مشاهد الإضاءة، ونصائح المعاينة قبل الشراء.
              </p>
            </div>

            <div className="flex w-full gap-2 lg:w-auto">
              <div className="relative flex-1 lg:min-w-[340px]">
                <Input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                    className="h-12 rounded-xl border-background/15 bg-background/5 pl-12 pr-4 text-background placeholder:text-background/72 focus:border-secondary/50"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-6 inline-block">
              <img src={logo} alt="لبن العصفور" className="h-14 brightness-0 invert opacity-85" />
            </Link>
            <p className="mb-8 max-w-md text-sm leading-8 text-background/86">
              متجر مخصص للوحدات الخشبية ووحدات الإضاءة التي تُعرض كجزء من مشهد متكامل، مع تجربة VR
              تساعدك على رؤية النتيجة قبل اعتماد الشراء.
            </p>

            <div className="mb-8 rounded-[1.5rem] border border-background/10 bg-background/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/12">
                  <ScanSearch className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-background/88">ميزة المتجر الأساسية</p>
                    <p className="mt-1 text-sm leading-7 text-background/86">
                    تقليل التردد في قرار الشراء عبر معاينة الخشب والإضاءة داخل مساحة أقرب للواقع.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: MapPin, text: companyProfile.showroomCity },
                { icon: Phone, text: companyProfile.phoneDisplay, dir: "ltr" as const },
                { icon: Mail, text: companyProfile.email },
              ].map((item) => (
                <div key={item.text} className="group flex items-center gap-3 text-sm text-background/84 transition-colors hover:text-background">
                  <item.icon className="h-4 w-4 flex-shrink-0 text-secondary/60 transition-colors group-hover:text-secondary" />
                  <span dir={item.dir}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "المنتجات", links: footerLinks.products },
            { title: "المتجر", links: footerLinks.company },
            { title: "الدعم", links: footerLinks.support },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="relative mb-6 inline-block font-display text-sm font-semibold text-background/88">
                {section.title}
                <span className="absolute -bottom-1 right-0 h-0.5 w-8 rounded-full bg-secondary/40" />
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                        className="group flex items-center gap-2 text-sm text-background/84 transition-colors duration-300 hover:text-secondary"
                    >
                      <span className="h-px w-0 bg-secondary transition-all duration-300 group-hover:w-3" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-xs text-background/78">
              © {new Date().getFullYear()} لبن العصفور. جميع الحقوق محفوظة.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/5 text-background/84 transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:shadow-gold"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <motion.button
              onClick={scrollToTop}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
