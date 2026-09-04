import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import axios from 'axios'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const getUserId = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')?.id || 'guest'
    } catch {
      return 'guest'
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', { params: { userId: getUserId() } })
      const items = Array.isArray(response.data) ? response.data : []
      setNotifications(items)
      setUnreadCount(items.filter((notification) => !notification.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = window.setInterval(fetchNotifications, 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${encodeURIComponent(id)}`, { read: true })
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications', { read: true, userId: getUserId() })
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="relative p-2 rounded-lg hover:bg-glass-bg transition-colors" aria-label="اعلان‌ها" aria-expanded={isOpen}>
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{unreadCount}</span>}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto glass rounded-xl shadow-xl z-50"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">اعلان‌ها</h3>
                {unreadCount > 0 && <button type="button" onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 transition-colors">خواندن همه</button>}
              </div>
              {notifications.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-8">اعلانی وجود ندارد</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <button type="button" key={notification.id} onClick={() => markAsRead(notification.id)} className={`w-full text-right p-3 rounded-lg transition-colors hover:bg-glass-bg ${notification.read ? 'opacity-70' : 'bg-primary-500/5'}`}>
                      <p className="text-sm">{notification.message}</p>
                      <span className="text-xs text-text-secondary">{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('fa-IR') : ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
