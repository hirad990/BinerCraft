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

axios.defaults.baseURL = API_ORIGIN
axios.interceptors.request.use((config) => {
  const url = config.url || ''
  if (url.startsWith('/api/')) {
    config.url = `${API_PREFIX}${url}`
  }
  return config
})

const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    return nativeFetch(`${API_ORIGIN}${API_PREFIX}${input}`, init)
  }

  if (input instanceof Request) {
    const requestUrl = new URL(input.url)
    if (requestUrl.origin === window.location.origin && requestUrl.pathname.startsWith('/api/')) {
      requestUrl.pathname = `${API_PREFIX}${requestUrl.pathname}`
      return nativeFetch(requestUrl.toString(), init || input)
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
