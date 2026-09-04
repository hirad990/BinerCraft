import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', displayName: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('تکرار رمز عبور یکسان نیست.')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/users/register', { username: form.username, email: form.email, displayName: form.displayName || form.username, password: form.password })
      localStorage.setItem('user', JSON.stringify(data))
      window.dispatchEvent(new Event('binercraft-auth-changed'))
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'ثبت‌نام انجام نشد. دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <h1 className="text-3xl font-bold mb-2">ساخت حساب</h1>
        <p className="text-text-secondary mb-6">به جامعه BinerCraft بپیوندید.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block"><span className="text-sm font-medium">نام کاربری</span><input value={form.username} onChange={update('username')} required minLength={3} pattern="[-_a-zA-Z0-9]+" className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="username" /></label>
          <label className="block"><span className="text-sm font-medium">ایمیل</span><input type="email" value={form.email} onChange={update('email')} required className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="email" /></label>
          <label className="block"><span className="text-sm font-medium">نام نمایشی</span><input value={form.displayName} onChange={update('displayName')} className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="name" /></label>
          <label className="block"><span className="text-sm font-medium">رمز عبور</span><input type="password" value={form.password} onChange={update('password')} required minLength={8} className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="new-password" /></label>
          <label className="block"><span className="text-sm font-medium">تکرار رمز عبور</span><input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required minLength={8} className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="new-password" /></label>
          {error && <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">{error}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">{loading ? 'در حال ساخت حساب…' : 'ثبت‌نام'}</button>
        </form>
        <p className="mt-6 text-sm text-text-secondary">حساب دارید؟ <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">وارد شوید</Link></p>
      </motion.div>
    </div>
  )
}
