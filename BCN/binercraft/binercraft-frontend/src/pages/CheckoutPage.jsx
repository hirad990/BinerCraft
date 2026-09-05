import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext.jsx'

const money = (value) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [method, setMethod] = useState('wallet')
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } }, [])
  const subtotal = getTotalPrice()
  const total = discount?.finalAmount ?? subtotal

  async function applyDiscount() {
    if (!discountCode.trim()) return
    setError(''); setDiscount(null)
    try { const { data } = await axios.post('/api/discounts/apply', { code: discountCode.trim(), amount: subtotal }); setDiscount(data) }
    catch (err) { setError(err.response?.data?.error || 'کد تخفیف معتبر نیست.') }
  }

  async function pay() {
    if (!user?.id) { navigate('/login'); return }
    if (!cart.length) return
    setBusy(true); setError(''); setSuccess('')
    try {
      if (method === 'wallet') {
        const { data } = await axios.post('/api/pay-with-wallet', { userId: user.id, amount: total })
        const order = await axios.post('/api/orders', { userId: user.id, items: cart, subtotal, discount: discount?.discountAmount || 0, total, paymentMethod: 'wallet', status: 'paid', paymentReference: `wallet-${Date.now()}` })
        localStorage.setItem('user', JSON.stringify({ ...user, wallet: data.newBalance }))
        await clearCart()
        setSuccess(`پرداخت موفق بود. سفارش ${order.data.id} ثبت شد.`)
      } else {
        const { data } = await axios.post('/api/create-bale-invoice', { amount: total, userId: user.id, description: 'خرید از BinerCraft' })
        if (!data.configured || !data.paymentUrl) throw new Error('درگاه بله هنوز در محیط سرور پیکربندی نشده است.')
        window.location.href = data.paymentUrl
      }
    } catch (err) { setError(err.response?.data?.error || err.message || 'پرداخت انجام نشد.') }
    finally { setBusy(false) }
  }

  if (!cart.length && !success) return <div className="container mx-auto max-w-3xl px-4 py-12"><div className="glass-card text-center"><div className="text-5xl">🛒</div><h1 className="mt-4 text-2xl font-black">سبد خرید خالی است</h1><Link to="/shop" className="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 font-bold text-white">بازگشت به فروشگاه</Link></div></div>

  return <div className="container mx-auto max-w-5xl px-4 py-10"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="mb-8"><span className="text-sm font-bold text-primary-600 dark:text-primary-400">SECURE CHECKOUT</span><h1 className="mt-2 text-4xl font-black">تکمیل سفارش</h1><p className="mt-2 text-text-secondary">پرداخت امن و ثبت سفارش BinerCraft</p></div>{error && <div role="alert" className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">{error}</div>}{success && <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600">{success}</div>}<div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="glass-card"><h2 className="text-xl font-black">روش پرداخت</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setMethod('wallet')} className={`rounded-2xl border p-4 text-right transition ${method === 'wallet' ? 'border-primary-500 bg-primary-500/10' : 'border-glass-border'}`}><div className="text-2xl">💰</div><strong className="mt-2 block">کیف پول BinerCraft</strong><span className="text-xs text-text-secondary">پرداخت فوری از موجودی حساب</span></button><button type="button" onClick={() => setMethod('bale')} className={`rounded-2xl border p-4 text-right transition ${method === 'bale' ? 'border-primary-500 bg-primary-500/10' : 'border-glass-border'}`}><div className="text-2xl">💳</div><strong className="mt-2 block">درگاه بله</strong><span className="text-xs text-text-secondary">پرداخت از طریق درگاه تنظیم‌شده</span></button></div><div className="mt-6 flex gap-2"><input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف" className="input-field flex-1" /><button type="button" onClick={applyDiscount} className="rounded-2xl border border-glass-border px-5 font-bold hover:border-primary-500/40">اعمال</button></div><button type="button" onClick={pay} disabled={busy || !!success} className="mt-6 w-full rounded-2xl bg-primary-600 px-5 py-4 font-black text-white transition hover:bg-primary-700 disabled:opacity-60">{busy ? 'در حال پردازش…' : `پرداخت ${money(total)}`}</button></section><aside className="glass-card h-fit"><h2 className="text-xl font-black">خلاصه سفارش</h2><div className="mt-5 space-y-3">{cart.map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="truncate">{item.product?.name || 'محصول'} × {item.quantity}</span><strong>{money((item.product?.price || 0) * item.quantity)}</strong></div>)}</div><div className="my-5 border-t border-glass-border" /><div className="flex justify-between text-sm"><span>جمع</span><span>{money(subtotal)}</span></div>{discount && <div className="mt-2 flex justify-between text-sm text-emerald-600"><span>تخفیف</span><span>− {money(discount.discountAmount)}</span></div>}<div className="mt-4 flex justify-between text-xl font-black"><span>قابل پرداخت</span><span>{money(total)}</span></div></aside></div></motion.div></div>
}
