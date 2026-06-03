import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCart();

  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + shipping + tax;
  const freeShippingRemaining = Math.max(0, 500 - subtotal);
  const savings = items.reduce(
    (sum, i) => sum + (i.sale_price != null ? (i.price - i.sale_price) * i.quantity : 0),
    0,
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-elevated"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold">سلة التسوق</h2>
                  <span className="text-xs text-muted-foreground">{itemCount} منتجات</span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && freeShippingRemaining > 0 && (
              <div className="px-5 py-3 bg-secondary/5 border-b border-border/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Truck className="w-3.5 h-3.5 text-secondary" />
                  أضف {freeShippingRemaining.toLocaleString()} ر.س للحصول على شحن مجاني
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {items.length > 0 && freeShippingRemaining <= 0 && (
              <div className="px-5 py-2.5 bg-secondary/5 border-b border-border/30 flex items-center gap-2 text-xs text-secondary font-medium">
                <Truck className="w-3.5 h-3.5" />
                🎉 مبروك! شحن مجاني على طلبك
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-semibold mb-1">سلة التسوق فارغة</p>
                    <p className="text-sm text-muted-foreground">اكتشف منتجاتنا المميزة</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsCartOpen(false)} className="rounded-xl">
                    تصفح المنتجات
                  </Button>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-3 bg-card rounded-xl p-3 border border-border/30 hover:border-border/60 transition-colors"
                    >
                      <Link to={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)}>
                        <img src={item.image} alt={item.name_ar} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name_ar}</h3>
                        <p className="text-secondary font-bold mt-1 text-sm">
                          {(item.sale_price ?? item.price).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ر.س</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors mr-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors pt-1"
                  >
                    إفراغ السلة
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-5 space-y-4 bg-card/50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{subtotal.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                      {shipping === 0 ? "مجاني" : `${shipping} ر.س`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الضريبة (15%)</span>
                    <span>{tax.toLocaleString()} ر.س</span>
                  </div>
                  <div className="section-divider my-2" />
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>الإجمالي</span>
                    <span className="text-secondary">{total.toLocaleString()} ر.س</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button variant="hero" size="lg" className="w-full h-12 text-base">
                    إتمام الطلب
                    <ArrowLeft className="w-4 h-4 mr-1" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
