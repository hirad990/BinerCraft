import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const steps = [
  ['01', 'اکانت بساز', 'در چند ثانیه یک حساب BinerCraft بساز و وارد پنل خودت شو.'],
  ['02', 'به سرور وصل شو', 'Minecraft را اجرا کن و با آدرس سرور BinerCraft وارد شبکه شو.'],
  ['03', 'گیم‌مودت را انتخاب کن', 'بین SkyMine، Survival و PracticePvP سبک بازی موردعلاقه‌ات را انتخاب کن.'],
  ['04', 'تجربه‌ات را ارتقا بده', 'از فروشگاه آیتم‌ها و امکانات ویژه را تهیه کن و از بازی لذت ببر.'],
]

export default function GuidePage() {
  const reduceMotion = useReducedMotion()
  return <main className="container mx-auto max-w-6xl px-4 py-10 sm:py-14"><motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><span className="font-bold text-primary-600 dark:text-primary-400">BINERCRAFT GUIDE</span><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">شروع بازی، ساده و سریع</h1><p className="mt-4 max-w-2xl leading-8 text-text-secondary">همه‌چیز برای شروع در شبکه BinerCraft؛ از ساخت حساب تا انتخاب گیم‌مود و خرید از فروشگاه.</p></motion.section><div className="mt-10 grid gap-5 md:grid-cols-2">{steps.map(([number, title, text], index) => <motion.article key={number} initial={reduceMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * .06 }} className="glass-card relative overflow-hidden"><span className="text-5xl font-black text-primary-500/20">{number}</span><h2 className="mt-2 text-2xl font-black">{title}</h2><p className="mt-2 leading-8 text-text-secondary">{text}</p></motion.article>)}</div><section className="glass-card mt-8 bg-primary-500/5"><h2 className="text-2xl font-black">آماده‌ای؟</h2><p className="mt-2 text-text-secondary">از همین حالا وارد شبکه شو یا امکانات ویژه را ببین.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/shop" className="rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">رفتن به فروشگاه</Link><Link to="/register" className="rounded-xl border border-glass-border px-5 py-3 font-bold">ساخت حساب</Link></div></section></main>
}
