import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './styles/index.css'

const API_BASE_URL = 'https://binercraft.ir/fozing'

axios.defaults.baseURL = API_BASE_URL

// A number of pages use the native fetch API instead of axios.
// In production those calls must also reach the Node backend under /fozing.
const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    return nativeFetch(`${API_BASE_URL}${input}`, init)
  }
  if (input instanceof Request && input.url.startsWith(window.location.origin + '/api/')) {
    const target = `${API_BASE_URL}${new URL(input.url).pathname}${new URL(input.url).search}`
    return nativeFetch(target, init || input)
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
