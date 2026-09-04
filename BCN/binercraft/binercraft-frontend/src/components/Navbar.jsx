import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import NotificationBell from './NotificationBell.jsx'

const menuItems = [
  { title: 'خانه', path: '/' },
  { title: 'فروشگاه', path: '/shop' },
  { title: 'وبلاگ', path: '/blog' },
  { title: 'قوانین', path: '/rules' },
  { title: 'راهنما', path: '/guide' },
  { title: 'پشتیبانی', path: '/support' },
  { title: 'تماس با ما', path: '/contact' },
  { title: 'سوالات متداول', path: '/faq' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const { isDark, toggleTheme } = useTheme()
  const { getTotalItems } = useCart()

  const readUser = () => {
    try {
      const storedUser = localStorage.getItem('user')
      setUser(storedUser ? JSON.parse(storedUser) : null)
    } catch {
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  useEffect(() => {
    readUser()
    const handleAuthChanged = () => readUser()
    window.addEventListener('storage', handleAuthChanged)
    window.addEventListener('binercraft-auth-changed', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleAuthChanged)
      window.removeEventListener('binercraft-auth-changed', handleAuthChanged)
    }
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const avatarUrl = useMemo(() => {
    const name = user?.displayName || user?.username || 'BinerCraft'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('binercraft-auth-changed'))
    setIsOpen(false)
    navigate('/')
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const linkClass = (path, mobile = false) => [
    mobile ? 'block w-full px-4 py-3 rounded-xl' : 'px-2 py-2 rounded-lg',
    'text-sm font-medium transition-all duration-200',
    isActive(path)
      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
      : 'text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-glass-bg',
  ].join(' ')

  const closeMenu = () => setIsOpen(false)

  return (
    <nav ref={menuRef} className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between min-h-16 gap-3">
          <Link to="/" onClick={closeMenu} className="shrink-0 flex items-center gap-2" aria-label="BinerCraft">
            <span className="font-rubik text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              BinerCraft
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} className={linkClass(item.path)} aria-current={isActive(item.path) ? 'page' : undefined}>
                {item.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block"><NotificationBell /></div>
            <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-glass-bg transition-colors" aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}>
              <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
            </button>
            <Link to="/cart" onClick={closeMenu} className="relative p-2 rounded-lg hover:bg-glass-bg transition-colors" aria-label="سبد خرید">
              <span aria-hidden="true">🛒</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-glass-bg transition-colors">
                    <img src={user.avatar || avatarUrl} alt={user.displayName || user.username || 'پروفایل'} className="w-8 h-8 rounded-full border-2 border-primary-500" onError={(event) => { event.currentTarget.src = avatarUrl }} />
                  </Link>
                  <button type="button" onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 transition-colors">خروج</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400">ورود</Link>
                  <Link to="/register" className="px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">ثبت‌نام</Link>
                </>
              )}
            </div>
            <button type="button" onClick={() => setIsOpen((value) => !value)} className="lg:hidden p-2 rounded-lg hover:bg-glass-bg transition-colors" aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'} aria-expanded={isOpen} aria-controls="mobile-navigation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="lg:hidden glass border-t border-glass-border overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {menuItems.map((item) => <Link key={item.path} to={item.path} onClick={closeMenu} className={linkClass(item.path, true)}>{item.title}</Link>)}
              <div className="pt-3 mt-3 border-t border-glass-border space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <NotificationBell />
                  <span className="text-sm text-text-secondary">اعلان‌ها</span>
                </div>
                {user ? (
                  <>
                    <Link to="/profile" onClick={closeMenu} className={linkClass('/profile', true)}>👤 پروفایل</Link>
                    <button type="button" onClick={handleLogout} className="w-full text-right px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10">خروج از حساب</button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={closeMenu} className="text-center px-4 py-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">ورود</Link>
                    <Link to="/register" onClick={closeMenu} className="text-center px-4 py-3 rounded-xl bg-primary-600 text-white">ثبت‌نام</Link>
                  </div>
                )}
                <Link to="/cart" onClick={closeMenu} className={linkClass('/cart', true)}>🛒 سبد خرید {getTotalItems() > 0 ? `(${getTotalItems()})` : ''}</Link>
                <button type="button" onClick={toggleTheme} className="w-full text-right px-4 py-3 rounded-xl hover:bg-glass-bg transition-colors">
                  {isDark ? '☀️ حالت روشن' : '🌙 حالت تاریک'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
