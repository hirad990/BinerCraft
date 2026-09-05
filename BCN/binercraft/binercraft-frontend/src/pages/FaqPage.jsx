import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const items = [
  ['چطور به سرور وصل شوم؟', 'Minecraft را اجرا کن، نسخه سازگار شبکه را انتخاب کن و با آدرس سرور BinerCraft وارد شو.'],
  ['چطور از فروشگاه خرید کنم؟', 'محصول را انتخاب کن، آن را به سبد اضافه کن و از صفحه سبد خرید ادامه بده.'],
  ['اگر خرید یا حسابم مشکل داشت چه کنم؟', 'از صفحه پشتیبانی یک تیکت با موضوع و توضیحات کامل ثبت کن تا پیگیری شود.'],
  ['چطور رمز عبورم را امن نگه دارم؟', 'رمز منحصربه‌فرد انتخاب کن و آن را با هیچ‌کس به اشتراک نگذار.'],
]

export default function FaqPage() {
  const [open, setOpen] = useState(0)
  const reduceMotion = useReducedMotion()
  return <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-14"><motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><span className="font-bold text-primary-600 dark:text-primary-400">HELP CENTER</span><h1 className="mt-3 text-4xl font-black">سؤالات متداول</h1><p className="mt-3 text-text-secondary">پاسخ سریع به پرسش‌های رایج بازیکنان.</p><div className="mt-8 space-y-3">{items.map(([question, answer], index) => <div key={question} className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/60"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-right font-black"><span>{question}</span><span className="text-xl text-primary-500">{open === index ? '−' : '+'}</span></button>{open === index && <div className="border-t border-glass-border px-5 pb-5 pt-4 leading-8 text-text-secondary">{answer}</div>}</div>)}</div><div className="mt-8 glass-card text-center"><h2 className="text-xl font-black">جوابت را پیدا نکردی؟</h2><p className="mt-2 text-text-secondary">تیم پشتیبانی آماده کمک به توست.</p><Link to="/support" className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">ثبت تیکت</Link></div></motion.section></main>
}
