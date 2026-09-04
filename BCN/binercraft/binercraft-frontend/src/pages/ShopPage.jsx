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
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    axios.get('/api/products')
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError('دریافت محصولات ناموفق بود.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['همه', ...new Set(products.map((product) => product.category).filter(Boolean))], [products])
  const filteredProducts = category === 'همه' ? products : products.filter((product) => product.category === category)

  const handleAdd = async (id) => {
    const result = await addToCart(id)
    if (result.success) {
      setAddedId(id)
      window.setTimeout(() => setAddedId(null), 1200)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.section initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div><p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">فروشگاه BinerCraft</p><h1 className="text-3xl md:text-4xl font-extrabold">آیتم‌های سرور</h1><p className="text-text-secondary mt-2">محصول موردنظر را انتخاب کنید و به سبد خرید اضافه کنید.</p></div>
          <Link to="/cart" className="inline-flex justify-center rounded-xl bg-primary-600 text-white px-5 py-3 hover:bg-primary-700 transition">مشاهده سبد خرید</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${category === item ? 'bg-primary-600 text-white' : 'glass hover:bg-glass-bg'}`}>{item}</button>)}
        </div>
        {error && <div role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-500">{error}</div>}
        {loading ? <div className="glass-card text-center">در حال دریافت محصولات…</div> : filteredProducts.length === 0 ? <div className="glass-card text-center text-text-secondary">محصولی پیدا نشد.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, index) => (
              <motion.article key={product.id} initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.2) }} className="glass-card p-0 overflow-hidden group">
                <Link to={`/product/${product.id}`} className="block">
                  <ImageWithFallback src={product.image} alt={product.name} className="w-full h-48 object-cover" fallbackIcon="⛏️" />
                </Link>
                <div className="p-5">
                  <span className="text-xs text-primary-600 dark:text-primary-400">{product.category || 'محصول'}</span>
                  <h2 className="font-bold text-lg mt-1">{product.name}</h2>
                  <p className="text-sm text-text-secondary mt-2 min-h-10">{product.description || 'محصول ویژه BinerCraft'}</p>
                  <div className="flex items-center justify-between gap-3 mt-5"><strong>{formatPrice(product.price)}</strong><button type="button" onClick={() => handleAdd(product.id)} className="rounded-xl bg-primary-600 text-white px-4 py-2 text-sm hover:bg-primary-700 transition">{addedId === product.id ? '✓ اضافه شد' : 'افزودن'}</button></div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
