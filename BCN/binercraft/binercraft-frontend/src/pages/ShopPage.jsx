import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ImageWithFallback from '../components/ImageWithFallback.jsx'
import { useCart } from '../context/CartContext.jsx'

const formatPrice = (value) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('همه')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedId, setAddedId] = useState(null)
  const { addToCart } = useCart()
  const reduceMotion = useReducedMotion()
  useEffect(() => { axios.get('/api/products').then(({ data }) => setProducts(Array.isArray(data) ? data : [])).catch(() => setError('دریافت محصولات ناموفق بود.')).finally(() => setLoading(false)) }, [])
  const categories = useMemo(() => ['همه', ...new Set(products.map((product) => product.category).filter(Boolean))], [products])
  const filteredProducts = category === 'همه' ? products : products.filter((product) => product.category === category)
  const handleAdd = async (id) => { const result = await addToCart(id); if (result.success) { setAddedId(id); window.setTimeout(() => setAddedId(null), 1200) } }
  return <main className="container mx-auto px-4 py-10"><motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><span className="font-bold text-primary-600 dark:text-primary-400">BINERCRAFT MARKET</span><h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">فروشگاه اختصاصی تو</h1><p className="mt-3 max-w-xl leading-8 text-text-secondary">رنک‌ها، آیتم‌ها و امکانات ویژه برای ارتقای تجربه‌ی بازی؛ سریع، امن و بدون پیچیدگی.</p></div><Link to="/cart" className="inline-flex items-center justify-center rounded-2xl border border-glass-border bg-glass-bg px-5 py-3 font-bold transition hover:-translate-y-1 hover:border-primary-500/40">مشاهده سبد خرید ←</Link></div><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${category === item ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'border-glass-border bg-glass-bg hover:border-primary-500/40'}`}>{item}</button>)}</div>{error && <div role="alert" className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">{error}</div>}{loading ? <div className="glass-card p-12 text-center text-text-secondary">در حال آماده‌سازی فروشگاه…</div> : filteredProducts.length === 0 ? <div className="glass-card p-12 text-center text-text-secondary">محصولی در این دسته پیدا نشد.</div> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.map((product, index) => <motion.article key={product.id} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : Math.min(index * .05, .25) }} className="group overflow-hidden rounded-3xl border border-glass-border bg-glass-bg/70 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-950/10"><Link to={`/product/${product.id}`} className="relative block overflow-hidden"><ImageWithFallback src={product.image} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" fallbackIcon="⛏️" /><span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">{product.category || 'ویژه'}</span></Link><div className="p-5"><h2 className="text-xl font-black">{product.name}</h2><p className="mt-2 min-h-12 text-sm leading-7 text-text-secondary">{product.description || 'محصول ویژه BinerCraft برای تجربه‌ای بهتر.'}</p><div className="mt-6 flex items-center justify-between gap-3"><strong className="text-lg">{formatPrice(product.price)}</strong><button type="button" onClick={() => handleAdd(product.id)} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700">{addedId === product.id ? '✓ اضافه شد' : 'افزودن'}</button></div></div></motion.article>)}</div>}</motion.section></main>
}
