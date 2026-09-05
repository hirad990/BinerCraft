import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import BlogDetailPage from './pages/BlogDetailPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import RulesPage from './pages/RulesPage.jsx'
import GuidePage from './pages/GuidePage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FaqPage from './pages/FaqPage.jsx'

function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname]); return null }

export default function App() {
  const location = useLocation(); const shouldReduceMotion = useReducedMotion()
  return <div className="min-h-screen flex flex-col"><ScrollToTop /><Navbar /><main className="flex-grow pt-16"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }} exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }} transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}><Routes location={location}><Route path="/" element={<HomePage />} /><Route path="/shop" element={<ShopPage />} /><Route path="/product/:id" element={<ProductDetailPage />} /><Route path="/blog" element={<BlogPage />} /><Route path="/blog/:id" element={<BlogDetailPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/cart" element={<CartPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/admin" element={<AdminPanel />} /><Route path="/rules" element={<RulesPage />} /><Route path="/guide" element={<GuidePage />} /><Route path="/support" element={<SupportPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/faq" element={<FaqPage />} /><Route path="*" element={<HomePage />} /></Routes></motion.div></AnimatePresence></main><Footer /></div>
}
