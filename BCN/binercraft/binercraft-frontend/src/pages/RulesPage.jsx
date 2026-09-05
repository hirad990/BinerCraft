import { motion, useReducedMotion } from 'framer-motion'

const rules = ['احترام بازیکنان و تیم پشتیبانی الزامی است.', 'از تقلب، ابزارهای غیرمجاز و سوءاستفاده از باگ‌ها استفاده نکن.', 'اسپم، تبلیغات مزاحم و محتوای نامناسب ممنوع است.', 'از اطلاعات حساب خود محافظت کن و آن را در اختیار دیگران قرار نده.', 'اگر مشکلی دیدی، از مرکز پشتیبانی تیکت ثبت کن.']

export default function RulesPage() {
  const reduceMotion = useReducedMotion()
  return <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-14"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card"><span className="font-bold text-primary-600 dark:text-primary-400">BINERCRAFT COMMUNITY</span><h1 className="mt-3 text-4xl font-black">قوانین شبکه</h1><p className="mt-3 leading-8 text-text-secondary">برای اینکه همه تجربه‌ای سالم و لذت‌بخش داشته باشند، این قوانین را رعایت کن.</p><div className="mt-8 space-y-3">{rules.map((rule, index) => <div key={rule} className="flex gap-4 rounded-2xl border border-glass-border bg-glass-bg/60 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/10 font-black text-primary-600">{index + 1}</span><p className="leading-7">{rule}</p></div>)}</div></motion.div></main>
}
