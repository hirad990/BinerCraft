import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import NotificationBell from './NotificationBell.jsx'

const menuItems = [
  { title: 'خانه', path: '/' }, { title: 'فروشگاه', path: '/shop' },
  { title: 'وبلاگ', path: '/blog' }, { title: 'قوانین', path: '/rules' },
  { title: 'راهنما', path: '/guide' }, { title: 'پشتیبانی', path: '/support' },
  { title: 'تماس با ما', path: '/contact' }, { title: 'سوالات متداول', path: '/faq' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { isDark, toggleTheme } = useTheme()
  const { getTotalItems } = useCart()

  const readUser = () => {
    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')) }
    catch { localStorage.removeItem('user'); setUser(null) }
  }

  useEffect(() => {
    readUser()
    const refresh = () => readUser()
    window.addEventListener('storage', refresh)
    window.addEventListener('binercraft-auth-changed', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('binercraft-auth-changed', refresh) }
  }, [])

  useEffect(() => { setIsOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!isOpen) return undefined
    const outside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false) }
    const escape = (event) => { if (event.key === 'Escape') setIsOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); document.body.style.overflow = previous }
  }, [isOpen])

  const avatarUrl = useMemo(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'BinerCraft')}&background=2563eb&color=fff&size=96`, [user])
  const total = getTotalItems()
  const active = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  const close = () => setIsOpen(false)
  const logout = () => { localStorage.removeItem('user'); setUser(null); window.dispatchEvent(new Event('binercraft-auth-changed')); close(); navigate('/') }
  const linkClass = (path, mobile = false) => `${mobile ? 'w-full px-4 py-3' : 'px-3 py-2'} rounded-xl text-sm font-medium transition-all duration-300 ${active(path) ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-glass-bg'}`

  return (
    <nav ref={menuRef} className="fixed inset-x-0 top-0 z-50 border-b border-glass-border/70 bg-background/75 backdrop-blur-2xl shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3">
          <Link to="/" onClick={close} className="group flex shrink-0 items-center gap-2" aria-label="BinerCraft">
            <span className="font-rubik text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-[1.03]">BinerCraft</span>
            <span className="hidden rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 sm:inline">STORE</span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">{menuItems.map((item) => <Link key={item.path} to={item.path} className={linkClass(item.path)} aria-current={active(item.path) ? 'page' : undefined}>{item.title}</Link>)}</div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block"><NotificationBell /></div>
            <button type="button" onClick={toggleTheme} className="rounded-xl p-2.5 transition-all duration-300 hover:bg-glass-bg hover:rotate-12" aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}>{isDark ? '🌙' : '☀️'}</button>
            <Link to="/cart" onClick={close} className="relative rounded-xl p-2.5 transition-all duration-300 hover:bg-glass-bg hover:-translate-y-0.5" aria-label="سبد خرید">🛒{total > 0 && <motion.span initial={reduceMotion ? false : { scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{total}</motion.span>}</Link>
            <div className="hidden items-center gap-2 sm:flex">{user ? <><Link to="/profile" onClick={close} className="flex items-center gap-2 rounded-2xl p-1.5 transition hover:bg-glass-bg"><img src={user.avatar || avatarUrl} onError={(e) => { e.currentTarget.src = avatarUrl }} alt="پروفایل" className="h-9 w-9 rounded-full border-2 border-primary-500/70 object-cover" /><span className="max-w-24 truncate text-sm font-semibold">{user.displayName || user.username}</span></Link><button type="button" onClick={logout} className="text-sm text-red-500 transition hover:text-red-600">خروج</button></> : <><Link to="/login" className="px-3 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400">ورود</Link><Link to="/register" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-0.5 hover:bg-primary-700">ثبت‌نام</Link></>}</div>
            <button type="button" onClick={() => setIsOpen((v) => !v)} className="rounded-xl p-2.5 transition hover:bg-glass-bg lg:hidden" aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'} aria-expanded={isOpen} aria-controls="mobile-navigation"><motion.span animate={reduceMotion ? {} : { rotate: isOpen ? 90 : 0 }} className="block text-xl">{isOpen ? '✕' : '☰'}</motion.span></button>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>{isOpen && <motion.div id="mobile-navigation" initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={reduceMotion ? {} : { opacity: 1, height: 'auto' }} exit={reduceMotion ? {} : { opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }} className="overflow-y-auto border-t border-glass-border/70 bg-background/95 backdrop-blur-2xl lg:hidden"><div className="container mx-auto space-y-2 px-4 py-4">{menuItems.map((item, index) => <motion.div key={item.path} initial={reduceMotion ? false : { opacity: 0, x: 12 }} animate={reduceMotion ? {} : { opacity: 1, x: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.025 }}><Link to={item.path} onClick={close} className={`block ${linkClass(item.path, true)}`}>{item.title}</Link></motion.div>)}<div className="mt-4 space-y-2 border-t border-glass-border pt-4"><div className="flex items-center gap-2"><NotificationBell /><span className="text-sm text-text-secondary">اعلان‌ها</span></div>{user ? <><Link to="/profile" onClick={close} className={`block ${linkClass('/profile', true)}`}>👤 حساب کاربری</Link><button type="button" onClick={logout} className="w-full rounded-xl px-4 py-3 text-right text-red-500 transition hover:bg-red-500/10">خروج از حساب</button></> : <div className="grid grid-cols-2 gap-2"><Link to="/login" onClick={close} className="rounded-xl bg-primary-500/10 px-4 py-3 text-center font-semibold text-primary-600">ورود</Link><Link to="/register" onClick={close} className="rounded-xl bg-primary-600 px-4 py-3 text-center font-semibold text-white">ثبت‌نام</Link></div>}<Link to="/cart" onClick={close} className={`block ${linkClass('/cart', true)}`}>🛒 سبد خرید {total > 0 ? `(${total})` : ''}</Link><button type="button" onClick={toggleTheme} className="w-full rounded-xl px-4 py-3 text-right transition hover:bg-glass-bg">{isDark ? '☀️ حالت روشن' : '🌙 حالت تاریک'}</button></div></div></motion.div>}</AnimatePresence>
    </nav>
  )
}
