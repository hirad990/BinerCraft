import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const formatPrice = (value) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`

export default function CartPage() {
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4 mb-6"><div><h1 className="text-3xl font-extrabold">سبد خرید</h1><p className="text-text-secondary mt-1">محصولات انتخاب‌شده شما</p></div><Link to="/shop" className="text-primary-600 dark:text-primary-400 hover:underline">ادامه خرید</Link></div>
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-500">{error}</div>}
        {cart.length === 0 ? (
          <div className="glass-card text-center py-14"><div className="text-5xl mb-4">🛒</div><h2 className="text-xl font-bold">سبد خرید خالی است</h2><p className="text-text-secondary mt-2 mb-6">از فروشگاه یک محصول انتخاب کنید.</p><Link to="/shop" className="inline-flex rounded-xl bg-primary-600 text-white px-5 py-3 hover:bg-primary-700 transition">رفتن به فروشگاه</Link></div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className="flex-1"><h2 className="font-bold">{item.product?.name || `محصول ${item.productId}`}</h2><p className="text-sm text-text-secondary mt-1">{formatPrice(item.product?.price)}</p></div>
                <div className="flex items-center gap-2"><button type="button" disabled={loading} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 rounded-lg glass hover:bg-glass-bg">−</button><span className="w-8 text-center">{item.quantity}</span><button type="button" disabled={loading} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 rounded-lg glass hover:bg-glass-bg">+</button></div>
                <strong className="sm:w-32 sm:text-left">{formatPrice((item.product?.price || 0) * item.quantity)}</strong>
                <button type="button" disabled={loading} onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600">حذف</button>
              </div>
            ))}
            <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="text-sm text-text-secondary">مبلغ کل</p><p className="text-2xl font-extrabold mt-1">{formatPrice(getTotalPrice())}</p></div><div className="flex gap-2"><button type="button" disabled={loading} onClick={clearCart} className="rounded-xl px-4 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10">خالی کردن</button><button type="button" className="rounded-xl bg-primary-600 text-white px-5 py-3 hover:bg-primary-700 transition">ادامه پرداخت</button></div></div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
