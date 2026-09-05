import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const rules = [
  ['احترام جامعه', 'با بازیکنان، سازندگان و تیم پشتیبانی محترمانه رفتار کن. توهین، تهدید و ایجاد مزاحمت قابل قبول نیست.'],
  ['تقلب ممنوع', 'از چیت، کلاینت‌های غیرمجاز، ابزارهای اتوماسیون یا هر روش ناعادلانه برای برتری استفاده نکن.'],
  ['سوءاستفاده از باگ', 'باگ‌ها را گزارش کن و از استفاده عمدی برای به‌دست‌آوردن مزیت، آیتم یا دسترسی غیرمجاز خودداری کن.'],
  ['اسپم و تبلیغات', 'اسپم، تبلیغات مزاحم، فریب کاربران و ارسال محتوای نامناسب در چت یا تیکت ممنوع است.'],
  ['امنیت حساب', 'رمز عبور و اطلاعات ورودت را در اختیار دیگران قرار نده و نسبت به لینک‌ها و درخواست‌های مشکوک دقت کن.'],
  ['خرید و پرداخت', 'رسید و اطلاعات سفارش را نگه دار و در صورت وجود مشکل مالی یا محصولی از پشتیبانی کمک بگیر.'],
  ['تصمیم تیم', 'در مواردی که یک رفتار صریحاً در این فهرست ذکر نشده اما به امنیت یا تجربه جامعه آسیب می‌زند، تیم BinerCraft می‌تواند برای جلوگیری از سوءاستفاده اقدام کند.']
]

export default function RulesPage() {
  const reduceMotion = useReducedMotion()
  return <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
      <div className="mb-8 text-center"><span className="font-bold text-primary-600 dark:text-primary-400">BINERCRAFT COMMUNITY</span><h1 className="mt-3 text-4xl font-black sm:text-5xl">قوانین سرور</h1><p className="mx-auto mt-3 max-w-2xl leading-8 text-text-secondary">قوانین برای حفظ امنیت، عدالت و یک تجربه خوب برای همه بازیکنان نوشته شده‌اند.</p></div>
      <div className="space-y-4">{rules.map(([title, text], index) => <motion.article key={title} initial={reduceMotion ? false : { opacity: 0, x: index % 2 ? 18 : -18 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .35, delay: index * .035 }} className="flex gap-4 rounded-3xl border border-glass-border bg-glass-bg/60 p-5 shadow-sm sm:p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 font-black text-primary-600 dark:text-primary-400">{index + 1}</span><div><h2 className="font-black sm:text-lg">{title}</h2><p className="mt-2 leading-8 text-text-secondary">{text}</p></div></motion.article>)}</div>
      <div className="mt-8 rounded-3xl border border-primary-500/20 bg-primary-500/5 p-6 text-center"><h2 className="font-black">قانونی پیدا نکردی؟</h2><p className="mt-2 text-sm text-text-secondary">اگر درباره یک مورد مطمئن نیستی، قبل از انجامش از پشتیبانی سؤال کن.</p><Link to="/support" className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5">ارتباط با پشتیبانی</Link></div>
    </motion.section>
  </main>
}
