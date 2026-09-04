import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = '/api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await axios.get(${API_URL}/cart)
      setCart(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    try {
      const response = await axios.post(${API_URL}/cart, { productId, quantity })
      setCart(response.data)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    setLoading(true)
    try {
      const response = await axios.patch(${API_URL}/cart/, { quantity })
      setCart(response.data)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId) => {
    setLoading(true)
    try {
      const response = await axios.delete(${API_URL}/cart/)
      setCart(response.data)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      const response = await axios.delete(${API_URL}/cart)
      setCart(response.data)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
