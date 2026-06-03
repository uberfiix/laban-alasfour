import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  Check,
  Shield,
  Lock,
  Banknote,
  Building2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Step = "info" | "payment" | "confirm";
type PaymentMethod = "cod" | "bank" | "card";

const PAYMENT_METHODS: {
  key: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
  disabled?: boolean;
}[] = [
  { key: "cod", label: "الدفع عند الاستلام", desc: "ادفع نقداً عند وصول الطلب", icon: Banknote },
  { key: "bank", label: "تحويل بنكي", desc: "حوّل المبلغ على حسابنا البنكي", icon: Building2 },
  { key: "card", label: "بطاقة ائتمانية", desc: "قريباً", icon: CreditCard, disabled: true },
];

const STORAGE_KEY = "checkout-info";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { name: "", phone: "", email: "", city: "", address: "", notes: "" };
  });

  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + shipping + tax;
  const savings = items.reduce(
    (sum, i) => sum + (i.sale_price != null ? (i.price - i.sale_price) * i.quantity : 0),
    0,
  );

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city || !form.address) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = () => {
    toast.success("تم تأكيد طلبك بنجاح! سنتواصل معك قريباً 🎉");
    clearCart();
    navigate("/");
  };

  if (items.length === 0 && step !== "confirm") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">السلة فارغة</h1>
            <p className="text-muted-foreground mb-6 text-sm">لا توجد منتجات في سلة التسوق</p>
            <Link to="/">
              <Button variant="hero" size="lg">العودة للمتجر</Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 pt-8 pb-20 container mx-auto px-4" dir="rtl">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-12">
          {([
            { key: "info", label: "بيانات الشحن", icon: MapPin, num: 1 },
            { key: "payment", label: "طريقة الدفع", icon: Wallet, num: 2 },
            { key: "confirm", label: "تأكيد الطلب", icon: Check, num: 3 },
          ] as { key: Step; label: string; icon: typeof MapPin; num: number }[]).map((s, i) => {
            const order: Step[] = ["info", "payment", "confirm"];
            const isActive = step === s.key;
            const isDone = order.indexOf(step) > order.indexOf(s.key);
            return (
              <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <div className={`w-6 sm:w-16 h-px transition-colors ${isDone || isActive ? "bg-secondary" : "bg-border"}`} />
                )}
                <div className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-gold"
                    : isDone
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                }`}>
                  <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs font-bold">
                    {isDone ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form / Confirmation */}
          <div className="lg:col-span-2">
            {step === "info" ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 space-y-6"
              >
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-secondary rounded-full" />
                  بيانات الشحن
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الاسم الكامل <span className="text-destructive">*</span></Label>
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="محمد أحمد" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم الهاتف <span className="text-destructive">*</span></Label>
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="05xxxxxxxx" required dir="ltr" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" type="email" dir="ltr" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المدينة <span className="text-destructive">*</span></Label>
                    <Input name="city" value={form.city} onChange={handleChange} placeholder="الرياض" required className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العنوان التفصيلي <span className="text-destructive">*</span></Label>
                  <Input name="address" value={form.address} onChange={handleChange} placeholder="الحي، الشارع، رقم المبنى" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ملاحظات إضافية</Label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="أي تعليمات خاصة بالتوصيل..."
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto gap-2 h-12">
                  متابعة
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Button>
              </motion.form>
            ) : step === "payment" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 space-y-6"
              >
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-secondary rounded-full" />
                  طريقة الدفع
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const selected = payment === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        disabled={m.disabled}
                        onClick={() => !m.disabled && setPayment(m.key)}
                        className={`w-full flex items-center gap-4 rounded-xl border p-4 text-right transition-all ${
                          m.disabled
                            ? "border-border/30 opacity-50 cursor-not-allowed"
                            : selected
                              ? "border-secondary bg-secondary/5 shadow-gold"
                              : "border-border/50 hover:border-secondary/50"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selected ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? "border-secondary bg-secondary text-secondary-foreground" : "border-border"
                        }`}>
                          {selected && <Check className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("info")} className="rounded-xl">
                    رجوع
                  </Button>
                  <Button variant="hero" size="lg" onClick={() => setStep("confirm")} className="flex-1 h-12 gap-2">
                    متابعة
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 space-y-6"
              >
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-secondary rounded-full" />
                  تأكيد الطلب
                </h2>

                {/* Shipping info summary */}
                <div className="bg-muted/50 rounded-xl p-5 space-y-2 text-sm border border-border/30">
                  <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-3">بيانات الشحن</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-muted-foreground">الاسم:</span> <span className="font-medium">{form.name}</span></div>
                    <div><span className="text-muted-foreground">الهاتف:</span> <span className="font-medium" dir="ltr">{form.phone}</span></div>
                    {form.email && <div><span className="text-muted-foreground">البريد:</span> <span className="font-medium">{form.email}</span></div>}
                    <div><span className="text-muted-foreground">المدينة:</span> <span className="font-medium">{form.city}</span></div>
                  </div>
                  <div className="pt-2 border-t border-border/30 mt-3">
                    <span className="text-muted-foreground">العنوان:</span> <span className="font-medium">{form.address}</span>
                  </div>
                </div>

                {/* Payment method summary */}
                <div className="bg-muted/50 rounded-xl p-5 text-sm border border-border/30 flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">طريقة الدفع:</span>
                  <span className="font-medium">
                    {PAYMENT_METHODS.find((m) => m.key === payment)?.label}
                  </span>
                </div>

                {/* Order items */}
                <div>
                  <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-3">المنتجات</p>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border/30">
                        <img src={item.image} alt={item.name_ar} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name_ar}</p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-secondary">
                          {((item.sale_price ?? item.price) * item.quantity).toLocaleString()} ر.س
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("payment")} className="rounded-xl">
                    رجوع
                  </Button>
                  <Button variant="hero" size="lg" onClick={handlePlaceOrder} className="flex-1 h-12 gap-2">
                    <Lock className="w-4 h-4" />
                    تأكيد وإتمام الطلب
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-28 space-y-5">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <div className="w-1.5 h-5 bg-secondary rounded-full" />
                ملخص الطلب
              </h3>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground truncate max-w-[60%]">{item.name_ar} × {item.quantity}</span>
                    <span className="font-medium">{((item.sale_price ?? item.price) * item.quantity).toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
              <div className="section-divider" />
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString()} ر.س</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>وفّرت</span>
                    <span className="font-medium">-{savings.toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> الشحن</span>
                  <span className={shipping === 0 ? "text-secondary font-medium" : ""}>{shipping === 0 ? "مجاني" : `${shipping} ر.س`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                  <span>{tax.toLocaleString()} ر.س</span>
                </div>
              </div>
              <div className="section-divider" />
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>الإجمالي</span>
                <span className="text-secondary">{total.toLocaleString()} ر.س</span>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-secondary" />
                  دفع آمن
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-secondary" />
                  بيانات مشفرة
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
