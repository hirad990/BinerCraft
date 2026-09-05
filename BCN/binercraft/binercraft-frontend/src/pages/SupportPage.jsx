import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { refreshAuth } from '../lib/auth.js'

const categories = ['پرداخت و سفارش', 'محصولات و خرید', 'مشکل فنی', 'حساب کاربری', 'سایر']
function formatDate(value) { try { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) } catch { return value } }

export default function SupportPage() {
  const reduceMotion = useReducedMotion(); const navigate = useNavigate()
  const [user, setUser] = useState(null); const [authLoading, setAuthLoading] = useState(true)
  const [tickets, setTickets] = useState([]); const [selectedId, setSelectedId] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [reply, setReply] = useState('')
  const [form, setForm] = useState({ subject: '', category: categories[0], priority: 'normal', message: '' })
  const selected = useMemo(() => tickets.find(ticket => ticket.id === selectedId) || null, [tickets, selectedId])

  useEffect(() => { let alive = true; refreshAuth().then(current => { if (!alive) return; if (!current) { navigate('/login', { replace: true }); return } setUser(current) }).finally(() => { if (alive) setAuthLoading(false) }); return () => { alive = false } }, [navigate])

  useEffect(() => {
    if (!user?.token) { if (!authLoading) setLoading(false); return }
    setLoading(true); setError('')
    fetch('/api/tickets', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(async response => { const data = await response.json().catch(() => []); if (!response.ok) throw new Error(data.error || 'خطا در دریافت تیکت‌ها'); return data })
      .then(data => { const list = Array.isArray(data) ? data : []; setTickets(list); setSelectedId(current => current || list[0]?.id || null) })
      .catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [user, authLoading])

  async function createTicket(event) {
    event.preventDefault(); if (!user?.token || !form.subject.trim() || !form.message.trim()) return
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ ...form, userId: user.id, username: user.username || 'کاربر', messages: [{ id: Date.now().toString(), sender: 'user', message: form.message.trim(), createdAt: new Date().toISOString() }] }) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'ساخت تیکت انجام نشد')
      setTickets(current => [data, ...current]); setSelectedId(data.id); setForm({ subject: '', category: categories[0], priority: 'normal', message: '' })
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function sendReply(event) {
    event.preventDefault(); if (!selected || !reply.trim() || !user?.token) return
    setSaving(true); setError('')
    try {
      const response = await fetch(`/api/tickets/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ message: reply.trim(), sender: 'user' }) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'ارسال پاسخ انجام نشد')
      setTickets(current => current.map(ticket => ticket.id === data.id ? data : ticket)); setReply('')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  if (authLoading) return <main className="container mx-auto max-w-7xl px-4 py-14"><div className="h-96 animate-pulse rounded-3xl border border-glass-border bg-glass-bg/50"/></main>

  return <main className="container mx-auto max-w-7xl px-4 py-8 sm:py-12"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="mb-3 inline-flex rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-600 dark:text-primary-300">پشتیبانی اختصاصی BinerCraft</span><h1 className="text-3xl font-black tracking-tight sm:text-5xl">مرکز پشتیبانی</h1><p className="mt-3 text-text-secondary">تیکتت را ثبت کن؛ تیم ما با دقت پیگیری می‌کند.</p></div><Link to="/faq" className="rounded-2xl border border-glass-border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:border-primary-500/40">سؤالات متداول ←</Link></motion.div>
    {error && <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]"><motion.form onSubmit={createTicket} initial={reduceMotion ? false : { opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="glass-card h-fit space-y-4 p-5 sm:p-6"><div><h2 className="text-xl font-black">تیکت جدید</h2><p className="mt-1 text-sm text-text-secondary">مشکل یا درخواستت را واضح بنویس.</p></div><input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="موضوع تیکت" className="input-field"/><div className="grid grid-cols-2 gap-3"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">{categories.map(item => <option key={item}>{item}</option>)}</select><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field"><option value="low">کم</option><option value="normal">عادی</option><option value="high">مهم</option></select></div><textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="توضیحات کامل..." className="input-field resize-none"/><button disabled={saving} className="w-full rounded-2xl bg-primary-600 px-4 py-3 font-bold text-white transition hover:bg-primary-700 disabled:opacity-60">{saving ? 'در حال ارسال...' : 'ثبت تیکت'}</button></motion.form>
      <section className="glass-card min-h-[560px] overflow-hidden"><div className="border-b border-glass-border p-5 sm:p-6"><h2 className="text-xl font-black">تیکت‌های من</h2><p className="mt-1 text-sm text-text-secondary">{tickets.length} گفت‌وگو در حساب شما</p></div><div className="grid md:grid-cols-[280px_1fr]"><div className="border-b border-glass-border md:border-b-0 md:border-l md:border-glass-border">{loading ? <p className="p-6 text-sm text-text-secondary">در حال بارگذاری...</p> : tickets.length === 0 ? <p className="p-6 text-sm text-text-secondary">هنوز تیکتی ثبت نکرده‌ای.</p> : tickets.map(ticket => <button key={ticket.id} onClick={() => setSelectedId(ticket.id)} className={`w-full border-b border-glass-border p-4 text-right transition ${selectedId === ticket.id ? 'bg-primary-500/10' : 'hover:bg-background/50'}`}><div className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{ticket.subject}</strong><span className="text-[10px] text-text-secondary">{ticket.status === 'closed' ? 'بسته' : 'باز'}</span></div><p className="mt-1 text-xs text-text-secondary">{formatDate(ticket.createdAt)}</p></button>)}</div><div className="flex min-h-[420px] flex-col p-5 sm:p-6">{selected ? <><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-black">{selected.subject}</h3><p className="mt-1 text-xs text-text-secondary">{selected.category} · {formatDate(selected.createdAt)}</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">{selected.status === 'closed' ? 'بسته شده' : 'در حال پیگیری'}</span></div><div className="flex-1 space-y-3">{(selected.messages || [{ message: selected.message, sender: 'user', createdAt: selected.createdAt }]).map((item, index) => <div key={item.id || index} className={`max-w-[90%] rounded-2xl p-4 text-sm ${item.sender === 'admin' ? 'bg-primary-500/10' : 'mr-auto bg-background/70'}`}><p>{item.message}</p><p className="mt-2 text-[10px] text-text-secondary">{formatDate(item.createdAt)}</p></div>)}</div><form onSubmit={sendReply} className="mt-5 flex gap-2"><input value={reply} onChange={e => setReply(e.target.value)} placeholder="پاسخ خود را بنویس..." className="input-field flex-1"/><button disabled={saving} className="rounded-2xl bg-primary-600 px-4 font-bold text-white disabled:opacity-60">ارسال</button></form></> : <div className="m-auto text-center text-text-secondary"><div className="mb-3 text-4xl">✦</div><p>برای مشاهده گفتگو، یک تیکت را انتخاب کن.</p></div>}</div></div></section></div>
  </main>
}
