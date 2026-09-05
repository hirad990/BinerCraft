import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'

const API = '/api'
const TOKEN_KEY = 'binercraft_admin_token'
const USER_KEY = 'binercraft_user'

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'خطایی رخ داد')
  return data
}

const emptyProduct = { name: '', category: 'رتبه‌ها', price: '', description: '', image: '' }

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [login, setLogin] = useState({ username: 'hirad990', password: '' })
  const [loginError, setLoginError] = useState('')
  const [active, setActive] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [product, setProduct] = useState(emptyProduct)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const adminUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
  }, [token])

  const load = async () => {
    setError('')
    try {
      const [stats, userList, productList, orderList, ticketList] = await Promise.all([
        api('/admin/overview'), api('/users'), api('/products'), api('/orders'), api('/tickets')
      ])
      setOverview(stats)
      setUsers(userList)
      setProducts(productList)
      setOrders(orderList)
      setTickets(ticketList)
    } catch (err) {
      if (err.message === 'Authentication required' || err.message === 'Admin access required') logout()
      else setError(err.message)
    }
  }

  useEffect(() => { if (token) load() }, [token])

  async function handleLogin(event) {
    event.preventDefault()
    setBusy(true); setLoginError('')
    try {
      const data = await fetch(`${API}/auth/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login)
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.error || 'ورود ناموفق بود')
        return body
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setToken(data.token)
    } catch (err) { setLoginError(err.message) }
    finally { setBusy(false) }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  async function createProduct(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await api('/products', { method: 'POST', body: JSON.stringify({ ...product, price: Number(product.price) }) })
      setProduct(emptyProduct); await load(); setActive('products')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  async function deleteProduct(id) {
    if (!window.confirm('این محصول حذف شود؟')) return
    try { await api(`/products/${id}`, { method: 'DELETE' }); await load() } catch (err) { setError(err.message) }
  }

  async function toggleRole(user) {
    const role = user.role === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`نقش ${user.username} به ${role} تغییر کند؟`)) return
    try { await api(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ role }) }); await load() } catch (err) { setError(err.message) }
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <motion.form onSubmit={handleLogin} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-7">
          <div className="mb-7">
            <div className="inline-flex rounded-2xl bg-primary-500/10 px-3 py-2 text-primary-600 dark:text-primary-400 text-sm font-bold mb-4">BinerCraft • ADMIN</div>
            <h1 className="text-3xl font-black">ورود مدیریت</h1>
            <p className="text-text-secondary mt-2">برای ورود به مرکز مدیریت، اطلاعات ادمین را وارد کنید.</p>
          </div>
          {loginError && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{loginError}</div>}
          <label className="block text-sm font-bold mb-2">نام کاربری</label>
          <input className="w-full rounded-xl border border-border bg-background px-4 py-3 mb-4" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} autoComplete="username" />
          <label className="block text-sm font-bold mb-2">رمز عبور</label>
          <input type="password" className="w-full rounded-xl border border-border bg-background px-4 py-3 mb-6" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} autoComplete="current-password" />
          <button disabled={busy} className="w-full rounded-xl bg-primary-600 px-4 py-3 font-black text-white disabled:opacity-60">{busy ? 'در حال ورود...' : 'ورود به پنل'}</button>
        </motion.form>
      </div>
    )
  }

  if (adminUser && adminUser.role !== 'admin') return <Navigate to="/" replace />

  const cards = overview ? [
    ['کاربران', overview.users, '👥'], ['محصولات', overview.products, '🛒'], ['سفارش‌ها', overview.orders, '📦'], ['تیکت‌های باز', overview.openTickets, '🎫'],
    ['درآمد', `${Number(overview.revenue || 0).toLocaleString('fa-IR')} تومان`, '💰'], ['مدیران', overview.admins, '🛡️']
  ] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
        <div><div className="text-sm font-bold text-primary-500 mb-1">CONTROL CENTER</div><h1 className="text-3xl md:text-4xl font-black">پنل مدیریت BinerCraft</h1><p className="text-text-secondary mt-2">سلام {adminUser?.displayName || 'مدیر'} 👋</p></div>
        <button onClick={logout} className="rounded-xl border border-border px-4 py-2.5 font-bold hover:bg-black/5 dark:hover:bg-white/5">خروج امن</button>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        {cards.map(([label, value, icon]) => <div key={label} className="glass-card p-5"><div className="text-2xl mb-3">{icon}</div><div className="text-2xl font-black">{value}</div><div className="text-sm text-text-secondary mt-1">{label}</div></div>)}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
          {[['overview','داشبورد'],['users','کاربران'],['products','محصولات'],['orders','سفارش‌ها'],['tickets','تیکت‌ها'],['new-product','محصول جدید']].map(([id,label]) => <button key={id} onClick={() => setActive(id)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${active === id ? 'bg-primary-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>{label}</button>)}
        </div>

        <div className="p-5 md:p-7">
          {active === 'overview' && overview && <div className="grid md:grid-cols-2 gap-5"><div className="rounded-2xl border border-border p-5"><h2 className="font-black text-xl mb-4">وضعیت سرور</h2><div className="flex justify-between py-2"><span>وضعیت</span><b className="text-emerald-500">{overview.serverStats?.status || 'online'}</b></div><div className="flex justify-between py-2"><span>بازیکنان</span><b>{overview.serverStats?.players ?? 0}</b></div><div className="flex justify-between py-2"><span>پایداری</span><b>{overview.serverStats?.stability ?? 0}%</b></div></div><div className="rounded-2xl border border-border p-5"><h2 className="font-black text-xl mb-4">خلاصه عملیات</h2><div className="flex justify-between py-2"><span>سفارش در انتظار</span><b>{overview.pendingOrders}</b></div><div className="flex justify-between py-2"><span>تیکت باز</span><b>{overview.openTickets}</b></div><div className="flex justify-between py-2"><span>کد تخفیف</span><b>{overview.discounts}</b></div></div></div>}

          {active === 'users' && <div><h2 className="text-xl font-black mb-4">مدیریت کاربران</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-right border-b border-border"><th className="p-3">کاربر</th><th className="p-3">ایمیل</th><th className="p-3">نقش</th><th className="p-3">کیف پول</th><th className="p-3">عملیات</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-border/60"><td className="p-3 font-bold">{user.displayName || user.username}</td><td className="p-3">{user.email || '-'}</td><td className="p-3"><span className="rounded-full px-2.5 py-1 text-xs font-bold bg-primary-500/10 text-primary-500">{user.role}</span></td><td className="p-3">{Number(user.wallet || 0).toLocaleString('fa-IR')}</td><td className="p-3"><button onClick={() => toggleRole(user)} className="rounded-lg border border-border px-3 py-1.5 font-bold">تغییر نقش</button></td></tr>)}</tbody></table></div></div>}

          {active === 'products' && <div><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-black">مدیریت محصولات</h2><button onClick={() => setActive('new-product')} className="rounded-xl bg-primary-500 px-4 py-2 text-white font-bold">+ محصول</button></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{products.map((item) => <div key={item.id} className="rounded-2xl border border-border p-5"><div className="font-black text-lg">{item.name}</div><div className="text-sm text-text-secondary mt-1">{item.category}</div><div className="font-black text-primary-500 mt-4">{Number(item.price || 0).toLocaleString('fa-IR')} تومان</div><button onClick={() => deleteProduct(item.id)} className="mt-4 rounded-lg border border-red-500/20 px-3 py-2 text-red-500 font-bold">حذف محصول</button></div>)}</div></div>}

          {active === 'orders' && <div><h2 className="text-xl font-black mb-4">مدیریت سفارش‌ها</h2><div className="space-y-3">{orders.length ? orders.map((order) => <div key={order.id} className="rounded-2xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"><div><b>#{String(order.id).slice(-8)}</b><div className="text-sm text-text-secondary">کاربر: {order.userId}</div></div><div className="font-bold">{Number(order.total || order.amount || 0).toLocaleString('fa-IR')} تومان</div><span className="rounded-full bg-primary-500/10 text-primary-500 px-3 py-1 text-xs font-bold">{order.status}</span></div>) : <p className="text-text-secondary">هنوز سفارشی ثبت نشده.</p>}</div></div>}

          {active === 'tickets' && <div><h2 className="text-xl font-black mb-4">تیکت‌های پشتیبانی</h2><div className="space-y-3">{tickets.length ? tickets.map((ticket) => <div key={ticket.id} className="rounded-2xl border border-border p-4"><div className="flex justify-between gap-3"><b>{ticket.subject || 'تیکت بدون عنوان'}</b><span className="text-xs font-bold text-primary-500">{ticket.status}</span></div><p className="text-sm text-text-secondary mt-2">کاربر: {ticket.userId}</p></div>) : <p className="text-text-secondary">تیکتی وجود ندارد.</p>}</div></div>}

          {active === 'new-product' && <form onSubmit={createProduct} className="max-w-2xl"><h2 className="text-xl font-black mb-5">ایجاد محصول جدید</h2><div className="grid md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-2">نام محصول</label><input required className="w-full rounded-xl border border-border bg-background px-4 py-3" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} /></div><div><label className="block text-sm font-bold mb-2">دسته‌بندی</label><input className="w-full rounded-xl border border-border bg-background px-4 py-3" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} /></div><div><label className="block text-sm font-bold mb-2">قیمت</label><input required min="0" type="number" className="w-full rounded-xl border border-border bg-background px-4 py-3" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} /></div><div><label className="block text-sm font-bold mb-2">تصویر</label><input className="w-full rounded-xl border border-border bg-background px-4 py-3" value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} placeholder="URL" /></div></div><label className="block text-sm font-bold mb-2 mt-4">توضیحات</label><textarea rows="4" className="w-full rounded-xl border border-border bg-background px-4 py-3" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} /><button disabled={busy} className="mt-5 rounded-xl bg-primary-500 px-5 py-3 font-black text-white disabled:opacity-60">{busy ? 'در حال ذخیره...' : 'ایجاد محصول'}</button></form>}
        </div>
      </div>
    </div>
  )
}