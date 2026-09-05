import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const fallbackAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'BinerCraft')}&background=2563eb&color=fff&size=160`

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      if (!stored) { navigate('/login', { replace: true }); return }
      setUser(stored)
      axios.get(`/api/wallet/${encodeURIComponent(stored.id)}`).then(({ data }) => setWallet(data.wallet)).catch(() => setWallet(stored.wallet || 0))
    } catch { navigate('/login', { replace: true }) }
  }, [navigate])

  const displayName = user?.displayName || user?.username || 'کاربر BinerCraft'
  const avatar = useMemo(() => user?.avatar || fallbackAvatar(displayName), [user, displayName])
  if (!user) return null

  const cards = [
    { icon: '💰', title: 'کیف پول', value: `${Number(wallet ?? user.wallet ?? 0).toLocaleString('fa-IR')} تومان`, link: '/wallet', label: 'مدیریت موجودی' },
    { icon: '🛍️', title: 'سفارش‌های من', value: 'مشاهده سفارش‌ها', link: '/orders', label: 'پیگیری خریدها' },
    { icon: '🔔', title: 'اعلان‌ها', value: 'مرکز پیام‌ها', link: '/notifications', label: 'مشاهده اعلان‌ها' },
  ]

  return <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative overflow-hidden rounded-3xl border border-glass-border bg-gradient-to-br from-primary-600/15 via-background to-purple-600/10 p-6 shadow-xl shadow-primary-900/5 sm:p-10">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6"><img src={avatar} onError={(e) => { e.currentTarget.src = fallbackAvatar(displayName) }} alt="پروفایل" className="h-24 w-24 rounded-3xl border-4 border-background object-cover shadow-lg sm:h-32 sm:w-32" /><div><p className="mb-1 text-sm font-medium text-primary-600 dark:text-primary-400">حساب کاربری BinerCraft</p><h1 className="text-2xl font-black sm:text-4xl">{displayName}</h1><p className="mt-2 text-text-secondary">@{user.username || 'user'} · {user.email || 'ایمیل ثبت نشده'}</p></div></div>
        <Link to="/shop" className="rounded-2xl bg-primary-600 px-5 py-3 text-center font-bold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-1 hover:bg-primary-700">ادامه خرید ←</Link>
      </div>
    </motion.div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map((card, index) => <motion.div key={card.title} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.08 }}><Link to={card.link} className="group block rounded-2xl border border-glass-border bg-glass-bg/50 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-xl"><div className="flex items-start justify-between"><span className="text-2xl">{card.icon}</span><span className="text-text-secondary transition group-hover:-translate-x-1">←</span></div><h2 className="mt-5 font-bold">{card.title}</h2><p className="mt-2 truncate text-lg font-black text-primary-600 dark:text-primary-400">{card.value}</p><p className="mt-1 text-sm text-text-secondary">{card.label}</p></Link></motion.div>)}</div>
    <motion.section initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-8 rounded-2xl border border-glass-border bg-glass-bg/40 p-6"><h2 className="text-lg font-black">اطلاعات حساب</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-text-secondary">نام کاربری</p><p className="mt-1 font-semibold">{user.username || '—'}</p></div><div><p className="text-sm text-text-secondary">ایمیل</p><p className="mt-1 break-all font-semibold">{user.email || '—'}</p></div></div></motion.section>
  </main>
}
