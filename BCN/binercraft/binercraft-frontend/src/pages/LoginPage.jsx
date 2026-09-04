import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/users/login', { identifier, password })
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('binercraft-auth-changed'))
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'ورود انجام نشد. دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <h1 className="text-3xl font-bold mb-2">ورود به BinerCraft</h1>
        <p className="text-text-secondary mb-6">با حساب کاربری خود وارد شوید.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block"><span className="text-sm font-medium">نام کاربری یا ایمیل</span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="username" /></label>
          <label className="block"><span className="text-sm font-medium">رمز عبور</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500" autoComplete="current-password" /></label>
          {error && <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">{error}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">{loading ? 'در حال ورود…' : 'ورود'}</button>
        </form>
        <p className="mt-6 text-sm text-text-secondary">حساب ندارید؟ <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline">ثبت‌نام کنید</Link></p>
      </motion.div>
    </div>
  )
}
