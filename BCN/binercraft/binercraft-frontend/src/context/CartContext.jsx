import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = '/api'
const CartContext = createContext(null)

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id || 'guest'
  } catch {
    return 'guest'
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/cart`, { params: { userId: getUserId() } })
      setCart(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      setCart([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
    window.addEventListener('binercraft-auth-changed', fetchCart)
    return () => window.removeEventListener('binercraft-auth-changed', fetchCart)
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_URL}/cart`, { userId: getUserId(), productId, quantity })
      setCart(Array.isArray(response.data) ? response.data : [])
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message
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
      const response = await axios.patch(`${API_URL}/cart/${encodeURIComponent(cartItemId)}`, { userId: getUserId(), quantity })
      setCart(Array.isArray(response.data) ? response.data : [])
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message
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
      const response = await axios.delete(`${API_URL}/cart/${encodeURIComponent(cartItemId)}`, { params: { userId: getUserId() } })
      setCart(Array.isArray(response.data) ? response.data : [])
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message
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
      const response = await axios.delete(`${API_URL}/cart`, { params: { userId: getUserId() } })
      setCart(Array.isArray(response.data) ? response.data : [])
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const getTotalItems = () => cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
  const getTotalPrice = () => cart.reduce((total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0), 0)

  const value = useMemo(() => ({ cart, loading, error, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice }), [cart, loading, error, fetchCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
