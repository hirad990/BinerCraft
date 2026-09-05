import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const items = [
  ['چطور به سرور وصل شوم؟', 'Minecraft را اجرا کن، نسخه سازگار شبکه را انتخاب کن و با آدرس سرور BinerCraft وارد شو.'],
  ['چطور از فروشگاه خرید کنم؟', 'محصول را انتخاب کن، آن را به سبد اضافه کن و از صفحه سبد خرید ادامه بده.'],
  ['اگر خرید یا حسابم مشکل داشت چه کنم؟', 'از صفحه پشتیبانی یک تیکت با موضوع و توضیحات کامل ثبت کن تا پیگیری شود.'],
  ['چطور رمز عبورم را امن نگه دارم؟', 'رمز منحصربه‌فرد انتخاب کن و آن را با هیچ‌کس به اشتراک نگذار.'],
]

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: .8 }

export default function FaqPage() {
  const [open, setOpen] = useState(0)
  const reduceMotion = useReducedMotion()
  return <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: .45, ease: 'easeOut' }}>
      <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="mb-8">
        <span className="font-bold text-primary-600 dark:text-primary-400">HELP CENTER</span>
        <h1 className="mt-3 text-4xl font-black">سؤالات متداول</h1>
        <p className="mt-3 text-text-secondary">پاسخ سریع به پرسش‌های رایج بازیکنان.</p>
      </motion.div>
      <div className="space-y-3">
        {items.map(([question, answer], index) => {
          const isOpen = open === index
          return <motion.div key={question} layout transition={spring} className={`overflow-hidden rounded-2xl border bg-glass-bg/60 ${isOpen ? 'border-primary-500/30 shadow-lg shadow-primary-500/5' : 'border-glass-border'}`}>
            <button type="button" onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 p-5 text-right font-black">
              <span>{question}</span>
              <motion.span animate={reduceMotion ? {} : { rotate: isOpen ? 45 : 0 }} transition={spring} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-xl text-primary-500">+</motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && <motion.div initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={reduceMotion ? {} : { height: 'auto', opacity: 1 }} exit={reduceMotion ? {} : { height: 0, opacity: 0 }} transition={reduceMotion ? { duration: 0 } : { height: { duration: .28, ease: 'easeOut' }, opacity: { duration: .2 } }}><div className="border-t border-glass-border px-5 pb-5 pt-4 leading-8 text-text-secondary">{answer}</div></motion.div>}
            </AnimatePresence>
          </motion.div>
        })}
      </div>
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} className="mt-8 glass-card text-center"><h2 className="text-xl font-black">جوابت را پیدا نکردی؟</h2><p className="mt-2 text-text-secondary">تیم پشتیبانی آماده کمک به توست.</p><Link to="/support" className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-700">ثبت تیکت</Link></motion.div>
    </motion.section>
  </main>
}
