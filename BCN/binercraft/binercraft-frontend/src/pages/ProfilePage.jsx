import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      if (!stored) { navigate('/login', { replace: true }); return }
      setUser(stored)
      axios.get(`/api/wallet/${encodeURIComponent(stored.id)}`).then(({ data }) => setWallet(data.wallet)).catch(() => setWallet(stored.wallet || 0))
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  if (!user) return null

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <div className="flex items-center gap-4 mb-8"><img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=3b82f6&color=fff&size=96`} alt="پروفایل" className="w-20 h-20 rounded-full border-2 border-primary-500" /><div><h1 className="text-2xl font-extrabold">{user.displayName || user.username}</h1><p className="text-text-secondary">@{user.username}</p></div></div>
        <div className="grid sm:grid-cols-2 gap-4"><div className="rounded-xl bg-glass-bg p-4"><p className="text-sm text-text-secondary">ایمیل</p><p className="font-semibold mt-1 break-all">{user.email}</p></div><div className="rounded-xl bg-glass-bg p-4"><p className="text-sm text-text-secondary">موجودی کیف پول</p><p className="font-semibold mt-1">{Number(wallet ?? user.wallet ?? 0).toLocaleString('fa-IR')} تومان</p></div></div>
        <Link to="/shop" className="inline-flex mt-6 rounded-xl bg-primary-600 text-white px-5 py-3 hover:bg-primary-700 transition">رفتن به فروشگاه</Link>
      </motion.div>
    </div>
  )
}
