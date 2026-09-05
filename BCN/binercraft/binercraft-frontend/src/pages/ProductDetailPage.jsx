import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import axios from 'axios'
import ImageWithFallback from '../components/ImageWithFallback.jsx'
import { useCart } from '../context/CartContext.jsx'

const price = (value) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, loading: cartLoading } = useCart()
  const reduceMotion = useReducedMotion()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let active = true
    axios.get('/api/products').then(({ data }) => {
      const found = (Array.isArray(data) ? data : []).find((item) => String(item.id) === String(id))
      if (active) { setProduct(found || null); if (!found) setError('محصول موردنظر پیدا نشد.') }
    }).catch(() => active && setError('دریافت اطلاعات محصول ناموفق بود.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const handleAdd = async () => {
    if (!product) return
    const result = await addToCart(product.id)
    if (result.success) { setAdded(true); window.setTimeout(() => setAdded(false), 1600) }
  }

  if (loading) return <div className="container mx-auto px-4 py-16"><div className="glass-card p-12 text-center text-text-secondary">در حال آماده‌سازی محصول…</div></div>
  if (error || !product) return <div className="container mx-auto max-w-2xl px-4 py-16"><div className="glass-card text-center"><div className="text-5xl">⛏️</div><h1 className="mt-5 text-2xl font-black">محصول پیدا نشد</h1><p className="mt-2 text-text-secondary">{error || 'این محصول دیگر در فروشگاه موجود نیست.'}</p><Link to="/shop" className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">بازگشت به فروشگاه</Link></div></div>

  return <main className="container mx-auto max-w-6xl px-4 py-10 sm:py-14"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-2"><div className="overflow-hidden rounded-3xl border border-glass-border bg-glass-bg shadow-2xl"><ImageWithFallback src={product.image} alt={product.name} className="min-h-[320px] w-full object-cover sm:min-h-[480px]" fallbackIcon="⛏️" /></div><section className="flex flex-col justify-center"><Link to="/shop" className="mb-6 text-sm font-bold text-primary-600 dark:text-primary-400">← بازگشت به فروشگاه</Link><span className="w-fit rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-600 dark:text-primary-300">{product.category || 'محصول ویژه'}</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{product.name}</h1><p className="mt-5 text-lg leading-9 text-text-secondary">{product.description || 'یک محصول ویژه برای ارتقای تجربه‌ی شما در BinerCraft.'}</p><div className="mt-8 rounded-2xl border border-glass-border bg-glass-bg p-5"><span className="text-sm text-text-secondary">قیمت نهایی</span><strong className="mt-1 block text-3xl font-black">{price(product.price)}</strong></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button onClick={handleAdd} disabled={cartLoading} className="flex-1 rounded-2xl bg-primary-600 px-6 py-4 font-black text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60">{added ? '✓ به سبد اضافه شد' : cartLoading ? 'در حال افزودن…' : 'افزودن به سبد خرید'}</button><Link to="/cart" className="rounded-2xl border border-glass-border px-6 py-4 text-center font-bold transition hover:border-primary-500/40">مشاهده سبد</Link></div></section></motion.div></main>
}
