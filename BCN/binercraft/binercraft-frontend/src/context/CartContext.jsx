import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { getToken, readStoredUser } from '../lib/auth.js'

const API_URL = '/api'
const CartContext = createContext(null)

const getUserId = () => {
  try {
    const user = readStoredUser() || JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id || 'guest'
  } catch {
    return 'guest'
  }
}

const authConfig = () => {
  const token = getToken()
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

const normalizeCart = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (data?.id || data?.productId) return [data]
  return []
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/cart`, { ...authConfig(), params: { userId: getUserId() } })
      setCart(normalizeCart(response.data))
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'خطا در دریافت سبد خرید')
      setCart([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
    const refresh = () => fetchCart()
    window.addEventListener('binercraft-auth-changed', refresh)
    return () => window.removeEventListener('binercraft-auth-changed', refresh)
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    setError(null)
    try {
      await axios.post(`${API_URL}/cart`, { userId: getUserId(), productId, quantity }, authConfig())
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'افزودن به سبد خرید ناموفق بود'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeFromCart(cartItemId)
    setLoading(true)
    setError(null)
    try {
      await axios.patch(`${API_URL}/cart/${encodeURIComponent(cartItemId)}`, { userId: getUserId(), quantity }, authConfig())
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'تغییر تعداد ناموفق بود'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId) => {
    setLoading(true)
    setError(null)
    try {
      await axios.delete(`${API_URL}/cart/${encodeURIComponent(cartItemId)}`, { ...authConfig(), params: { userId: getUserId() } })
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'حذف از سبد خرید ناموفق بود'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    setError(null)
    try {
      await axios.delete(`${API_URL}/cart`, { ...authConfig(), params: { userId: getUserId() } })
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'خالی کردن سبد خرید ناموفق بود'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const getTotalItems = () => cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
  const getTotalPrice = () => cart.reduce((total, item) => total + Number(item.product?.price ?? item.price ?? 0) * Number(item.quantity || 0), 0)

  const value = useMemo(() => ({ cart, loading, error, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice }), [cart, loading, error, fetchCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
