import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, Globe, Phone, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { companyProfile } from "@/lib/company";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "الرئيسية", nameEn: "Home", href: "/" },
  { name: "وحدات المعيشة", nameEn: "Living Systems", href: "/living" },
  { name: "غرف النوم", nameEn: "Bedroom Units", href: "/bedroom" },
  { name: "وحدات الإضاءة", nameEn: "Lighting Units", href: "/lighting" },
  { name: "حلول المطابخ", nameEn: "Kitchen Solutions", href: "/kitchen" },
  { name: "تجربة VR", nameEn: "VR Preview", href: "/vr" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isArabic, setIsArabic] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <div className="hidden bg-foreground text-xs text-background/95 lg:block">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between" dir="rtl">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-secondary" />
                <span dir="ltr">{companyProfile.phoneDisplay}</span>
              </span>
              <span className="text-background/55">|</span>
              <span>وحدات خشبية وإضاءة مدروسة مع معاينة VR قبل الشراء</span>
            </div>

            <button
              onClick={() => setIsArabic(!isArabic)}
              className="flex items-center gap-1.5 transition-colors hover:text-secondary"
            >
              <Globe className="h-3 w-3" />
              {isArabic ? "EN" : "العربية"}
            </button>
          </div>
        </div>
      </div>

      <header
        className={`sticky left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-border/50 bg-background/92 shadow-soft backdrop-blur-xl"
            : "border-b border-border/30 bg-background/88 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-[78px] items-center justify-between">
            <Link to="/" className="relative z-10 flex items-center gap-3">
              <motion.img
                src={logo}
                alt="لبن العصفور - متجر الوحدات الخشبية ووحدات الإضاءة"
                className="h-12 w-auto"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="hidden xl:block" dir="rtl">
                <p className="text-sm font-semibold text-foreground">Laban Alasfour</p>
                <p className="text-xs text-muted-foreground/90">Wood Units, Lighting, VR Preview</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex" dir={isArabic ? "rtl" : "ltr"}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                      className={`group relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                        isActive ? "text-secondary" : "text-foreground/86 hover:text-foreground"
                    }`}
                  >
                    {isArabic ? link.name : link.nameEn}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-secondary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-secondary/30 transition-all duration-300 group-hover:w-6" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-10 w-10 rounded-xl text-foreground/72 hover:bg-muted/80 hover:text-foreground md:flex"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              <Link to="/vr" className="hidden lg:block">
                <Button variant="outline" size="sm" className="rounded-xl border-secondary/25 text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  <ScanSearch className="ml-2 h-4 w-4" />
                  احجز معاينة VR
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl text-foreground/72 hover:bg-muted/80 hover:text-foreground"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-gold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden border-t border-border/50 bg-background/98 backdrop-blur-xl lg:hidden"
            >
              <nav className="container mx-auto flex flex-col gap-1 px-4 py-6" dir={isArabic ? "rtl" : "ltr"}>
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.href;

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: isArabic ? 18 : -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className={`block rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                          isActive
                            ? "border-r-2 border-secondary bg-secondary/10 text-secondary"
                            : "text-foreground/86 hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        {isArabic ? link.name : link.nameEn}
                      </Link>
                    </motion.div>
                  );
                })}

                <Link to="/vr" className="mt-3">
                  <Button className="w-full gap-2 rounded-xl">
                    <ScanSearch className="h-4 w-4" />
                    ابدأ معاينة VR
                  </Button>
                </Link>

                <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                  <button
                    onClick={() => setIsArabic(!isArabic)}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    {isArabic ? "English" : "العربية"}
                  </button>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {companyProfile.phoneDisplay}
                  </span>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
