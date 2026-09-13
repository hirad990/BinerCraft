import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './styles/index.css'

const API_ORIGIN = 'https://binercraft.ir'
const API_PREFIX = '/loloh'
const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`
const LOCAL_API_ORIGINS = new Set(['http://localhost:3000', 'http://127.0.0.1:3000'])
const LEGACY_API_PREFIX = '/fozing'

const normalizeApiUrl = (value) => {
  if (!value) return value
  try {
    const url = new URL(value, window.location.origin)
    const isApiPath = url.pathname === '/api' || url.pathname.startsWith('/api/')
    const isLegacyPath = url.pathname === LEGACY_API_PREFIX || url.pathname.startsWith(`${LEGACY_API_PREFIX}/`)

    if ((LOCAL_API_ORIGINS.has(url.origin) || url.origin === window.location.origin) && isApiPath) {
      return `${API_BASE_URL}${url.pathname === '/api' ? '/api' : url.pathname}${url.search}${url.hash}`
    }

    if (url.origin === API_ORIGIN && isLegacyPath) {
      const path = url.pathname.replace(new RegExp(`^${LEGACY_API_PREFIX}(?=/|$)`), '') || '/'
      return `${API_BASE_URL}${path}${url.search}${url.hash}`
    }

    if (url.origin === API_ORIGIN && (url.pathname === API_PREFIX || url.pathname.startsWith(`${API_PREFIX}/`))) return url.toString()
  } catch {}

  if (value === '/api' || value.startsWith('/api/')) return `${API_BASE_URL}${value}`
  if (value === LEGACY_API_PREFIX || value.startsWith(`${LEGACY_API_PREFIX}/`)) return `${API_BASE_URL}${value.slice(LEGACY_API_PREFIX.length) || '/'}`
  return value
}

axios.defaults.baseURL = API_ORIGIN
axios.interceptors.request.use((config) => {
  const normalized = normalizeApiUrl(config.url || '')
  if (normalized && normalized !== config.url) {
    config.baseURL = ''
    config.url = normalized
  } else if ((config.url || '').startsWith('/api/')) {
    config.baseURL = API_ORIGIN
    config.url = `${API_PREFIX}${config.url}`
  }

  const token = localStorage.getItem('token')
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  if (typeof input === 'string') return nativeFetch(normalizeApiUrl(input), init)
  if (input instanceof Request) {
    const normalized = normalizeApiUrl(input.url)
    if (normalized !== input.url) return nativeFetch(new Request(normalized, input), init)
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
