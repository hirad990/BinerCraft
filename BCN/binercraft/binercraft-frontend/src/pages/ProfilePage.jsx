import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken, readStoredUser, refreshAuth } from '../lib/auth.js'

const formatMoney = (value) => `${new Intl.NumberFormat('fa-IR').format(Number(value || 0))} تومان`

const avatarFallback = (user) => `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'BinerCraft')}&background=2563eb&color=fff&size=256`

export default function ProfilePage() {
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const current = await refreshAuth()
        if (!alive) return
        setUser(current || readStoredUser())
      } catch (err) {
        if (alive) setError(err.response?.data?.error || 'خطا در دریافت اطلاعات حساب')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const avatar = useMemo(() => user?.avatar || avatarFallback(user), [user])

  if (loading) {
    return <main className="container mx-auto max-w-6xl px-4 py-12"><div className="h-64 animate-pulse rounded-3xl border border-glass-border bg-glass-bg" /></main>
  }

  if (!user) {
    return <main className="container mx-auto max-w-3xl px-4 py-16 text-center"><div className="rounded-3xl border border-glass-border bg-glass-bg p-10"><h1 className="text-2xl font-black">برای دیدن پروفایل وارد شوید</h1><Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-bold text-white">ورود به حساب</Link></div></main>
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {error && <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      <section className="relative overflow-hidden rounded-[2rem] border border-glass-border bg-gradient-to-br from-primary-600/15 via-glass-bg to-purple-600/10 p-6 shadow-xl sm:p-8">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <img src={avatar} onError={(e) => { e.currentTarget.src = avatarFallback(user) }} alt="پروفایل" className="h-24 w-24 rounded-3xl border-4 border-background/70 object-cover shadow-2xl sm:h-28 sm:w-28" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-500">حساب کاربری BinerCraft</p>
              <h1 className="mt-1 truncate text-2xl font-black sm:text-4xl">{user.displayName || user.username}</h1>
              <p className="mt-1 truncate text-sm text-text-secondary">@{user.username}</p>
            </div>
          </div>
          <Link to="/settings" className="inline-flex items-center justify-center rounded-xl border border-glass-border bg-background/60 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:border-primary-500/40 hover:text-primary-500">ویرایش حساب</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-5"><p className="text-sm text-text-secondary">موجودی کیف پول</p><p className="mt-2 text-2xl font-black text-primary-500">{formatMoney(user.wallet)}</p></div>
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-5"><p className="text-sm text-text-secondary">نام کاربری</p><p className="mt-2 truncate text-xl font-black">{user.username}</p></div>
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-5"><p className="text-sm text-text-secondary">ایمیل</p><p className="mt-2 truncate text-lg font-bold">{user.email || 'ثبت نشده'}</p></div>
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-5"><p className="text-sm text-text-secondary">نوع حساب</p><p className="mt-2 text-xl font-black">{user.role === 'admin' ? 'مدیر' : 'کاربر'}</p></div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/shop" className="group rounded-2xl border border-glass-border bg-glass-bg p-6 transition hover:-translate-y-1 hover:border-primary-500/40"><p className="text-sm text-text-secondary">فروشگاه</p><h2 className="mt-2 text-xl font-black">خرید محصولات</h2><p className="mt-2 text-sm text-text-secondary">رنک‌ها و آیتم‌های BinerCraft</p></Link>
        <Link to="/orders" className="group rounded-2xl border border-glass-border bg-glass-bg p-6 transition hover:-translate-y-1 hover:border-primary-500/40"><p className="text-sm text-text-secondary">سفارش‌ها</p><h2 className="mt-2 text-xl font-black">تاریخچه سفارش‌ها</h2><p className="mt-2 text-sm text-text-secondary">سفارش‌های قبلی خودت را ببین</p></Link>
        <Link to="/wallet" className="group rounded-2xl border border-glass-border bg-glass-bg p-6 transition hover:-translate-y-1 hover:border-primary-500/40"><p className="text-sm text-text-secondary">کیف پول</p><h2 className="mt-2 text-xl font-black">مدیریت موجودی</h2><p className="mt-2 text-sm text-text-secondary">شارژ و بررسی تراکنش‌ها</p></Link>
      </section>

      <section className="mt-6 rounded-2xl border border-glass-border bg-glass-bg p-6">
        <h2 className="text-lg font-black">اطلاعات حساب</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-background/50 p-4"><span className="text-xs text-text-secondary">شناسه حساب</span><p className="mt-1 break-all font-mono text-sm">{user.id || '—'}</p></div>
          <div className="rounded-xl bg-background/50 p-4"><span className="text-xs text-text-secondary">وضعیت</span><p className="mt-1 font-bold text-emerald-500">فعال</p></div>
        </div>
      </section>
    </main>
  )
}
