import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './styles/index.css'

const API_ORIGIN = 'https://binercraft.ir'
const API_PREFIX = '/fozing'
const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`
const LOCAL_API_ORIGINS = new Set(['http://localhost:3000', 'http://127.0.0.1:3000'])

const normalizeApiUrl = (value) => {
  if (!value) return value

  try {
    const url = new URL(value, window.location.origin)

    if (LOCAL_API_ORIGINS.has(url.origin) && url.pathname.startsWith('/api/')) {
      return `${API_BASE_URL}${url.pathname}${url.search}${url.hash}`
    }

    if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
      return `${API_BASE_URL}${url.pathname}${url.search}${url.hash}`
    }

    if (url.origin === API_ORIGIN && url.pathname.startsWith(`${API_PREFIX}/`)) {
      return url.toString()
    }
  } catch {
    // Keep invalid/non-URL values unchanged and let the caller handle them.
  }

  if (value.startsWith('/api/')) return `${API_BASE_URL}${value}`
  return value
}

axios.defaults.baseURL = API_ORIGIN
axios.interceptors.request.use((config) => {
  const url = config.url || ''
  const normalized = normalizeApiUrl(url)

  if (normalized !== url) {
    if (normalized.startsWith(API_BASE_URL)) {
      config.baseURL = ''
      config.url = normalized
    } else {
      config.url = normalized
    }
  } else if (url.startsWith('/api/')) {
    config.url = `${API_PREFIX}${url}`
  }

  return config
})

const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  if (typeof input === 'string') {
    const normalized = normalizeApiUrl(input)
    return nativeFetch(normalized, init)
  }

  if (input instanceof Request) {
    const normalized = normalizeApiUrl(input.url)
    if (normalized !== input.url) {
      return nativeFetch(normalized, init || input)
    }
  }

  return nativeFetch(input, init)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
