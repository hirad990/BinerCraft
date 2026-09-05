import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Icon = ({ name, size = 22 }) => {
  const p = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-4-.9L4 20l1.5-3.4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/></>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>
}

export default function ContactPage() {
  const [settings, setSettings] = useState({ siteName: 'BinerCraft', supportEmail: 'support@binercraft.ir', supportHours: 'هر روز، ۹ تا ۲۳', contactText: 'تیم BinerCraft آماده پاسخ‌گویی به شماست.' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  useEffect(() => {
    fetch('/api/site-settings').then(r => r.ok ? r.json() : null).then(data => data && setSettings(x => ({ ...x, ...data }))).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSent(false)
    setError('')
    const rawUser = localStorage.getItem('binercraft_user') || localStorage.getItem('user')
    const token = localStorage.getItem('binercraft_user_token') || (() => {
      try { return JSON.parse(rawUser || '{}').token || '' } catch { return '' }
    })()
    if (!token) {
      setError('برای ثبت و پیگیری پیام، ابتدا وارد حساب کاربری شوید و سپس دوباره تلاش کنید.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: form.subject,
          message: `نام: ${form.name}\nایمیل: ${form.email}\n\n${form.message}`,
          category: 'contact',
          priority: 'normal'
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'ارسال پیام ناموفق بود.')
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.message || 'ارسال پیام ناموفق بود.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
    <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400"><Icon name="message" size={17}/> ارتباط با {settings.siteName}</div>
      <h1 className="text-4xl font-black sm:text-5xl">تماس با ما</h1>
      <p className="mx-auto mt-3 max-w-2xl text-text-secondary">{settings.contactText}</p>
    </motion.header>
    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <section className="space-y-4">
        <div className="rounded-3xl border border-glass-border bg-glass-bg/50 p-6"><div className="mb-4 inline-flex rounded-2xl bg-primary-500/10 p-3 text-primary-500"><Icon name="mail" size={24}/></div><h2 className="text-xl font-black">ایمیل پشتیبانی</h2><p className="mt-2 text-text-secondary">{settings.supportEmail}</p></div>
        <div className="rounded-3xl border border-glass-border bg-glass-bg/50 p-6"><div className="mb-4 inline-flex rounded-2xl bg-primary-500/10 p-3 text-primary-500"><Icon name="clock" size={24}/></div><h2 className="text-xl font-black">زمان پاسخ‌گویی</h2><p className="mt-2 text-text-secondary">{settings.supportHours}</p></div>
        <div className="rounded-3xl border border-primary-500/15 bg-primary-500/5 p-6"><h2 className="text-lg font-black">پیگیری سریع‌تر</h2><p className="mt-2 text-sm leading-7 text-text-secondary">پیام شما به‌صورت یک تیکت ثبت می‌شود تا تیم پشتیبانی بتواند پاسخ و وضعیت آن را پیگیری کند.</p><Link to="/support" className="mt-4 inline-flex rounded-xl border border-primary-500/30 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400">رفتن به پشتیبانی</Link></div>
      </section>
      <motion.form onSubmit={submit} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl border border-glass-border bg-glass-bg/50 p-6 shadow-xl sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-2 block text-sm font-bold">نام</label><input required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></div>
          <div><label className="mb-2 block text-sm font-bold">ایمیل</label><input required type="email" className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary-500" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div>
        </div>
        <div className="mt-4"><label className="mb-2 block text-sm font-bold">موضوع</label><input required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary-500" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}/></div>
        <div className="mt-4"><label className="mb-2 block text-sm font-bold">پیام</label><textarea required rows="6" className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary-500" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/></div>
        {error && <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm font-bold text-amber-600"><Icon name="alert" size={18}/><span>{error}</span></div>}
        {sent && <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-600"><Icon name="check" size={18}/> پیام شما به‌عنوان تیکت ثبت شد و قابل پیگیری است.</div>}
        <button disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-black text-white disabled:opacity-60"><Icon name="send" size={18}/>{busy ? 'در حال ارسال...' : 'ارسال پیام'}</button>
      </motion.form>
    </div>
  </main>
}