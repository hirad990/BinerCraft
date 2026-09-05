import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const modes = [
  { title: 'SkyMine', text: 'پیشرفت بی‌پایان در آسمان', icon: '☁️' },
  { title: 'Survival', text: 'ماجراجویی، اقتصاد و رقابت', icon: '🌲' },
  { title: 'PracticePvP', text: 'تمرین کن، رقابت کن، قهرمان شو', icon: '⚔️' },
]

export default function HomePage() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative overflow-hidden">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,.18),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,.16),transparent_32%)]" />
        <div className="container mx-auto grid min-h-[620px] items-center gap-12 px-4 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
            <span className="mb-5 inline-flex rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-300">BinerCraft Network • تجربه‌ای فراتر از یک سرور</span>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.15] tracking-tight md:text-7xl">دنیای خودت را<br /><span className="bg-gradient-to-l from-primary-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">بساز و فتح کن.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-9 text-text-secondary">یک شبکه‌ی ماینکرفتی حرفه‌ای با گیم‌مودهای متنوع، اقتصاد پویا، رقابت واقعی و جامعه‌ای که هر روز بزرگ‌تر می‌شود.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-2xl bg-primary-600 px-7 py-4 font-bold text-white shadow-xl shadow-primary-600/20 transition hover:-translate-y-1 hover:bg-primary-700">ورود به فروشگاه ←</Link>
              <Link to="/guide" className="rounded-2xl border border-glass-border bg-glass-bg px-7 py-4 font-bold transition hover:-translate-y-1 hover:border-primary-500/40">راهنمای شروع</Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-glass-border pt-6">
              <div><strong className="text-2xl font-black">24/7</strong><p className="mt-1 text-sm text-text-secondary">آنلاین و آماده</p></div>
              <div><strong className="text-2xl font-black">3+</strong><p className="mt-1 text-sm text-text-secondary">گیم‌مود جذاب</p></div>
              <div><strong className="text-2xl font-black">100%</strong><p className="mt-1 text-sm text-text-secondary">تجربه اختصاصی</p></div>
            </div>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .1 }} className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-primary-500/15 blur-3xl" />
            <div className="glass-card relative overflow-hidden border-primary-500/20 p-2 shadow-2xl shadow-primary-950/20">
              <div className="rounded-[1.25rem] bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-8 text-white md:p-12">
                <div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-xs">NETWORK STATUS</span><span className="flex items-center gap-2 text-xs text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400" /> آنلاین</span></div>
                <div className="py-20 text-center"><div className="mb-6 text-7xl">⛏️</div><h2 className="text-4xl font-black tracking-tight">BINERCRAFT</h2><p className="mt-3 text-blue-200">PLAY. CREATE. DOMINATE.</p></div>
                <div className="flex items-center justify-between border-t border-white/10 pt-5 text-sm text-blue-100"><span>play.binercraft.ir</span><span>نسخه Java</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-24 pt-8"><div className="mb-8 flex items-end justify-between"><div><p className="font-semibold text-primary-600 dark:text-primary-400">انتخاب کن</p><h2 className="mt-2 text-3xl font-black md:text-4xl">هر سبک بازی، یک ماجرا</h2></div><Link to="/shop" className="hidden text-sm font-bold text-primary-600 md:block">مشاهده همه ←</Link></div><div className="grid gap-5 md:grid-cols-3">{modes.map((mode, index) => <motion.div key={mode.title} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="glass-card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-2 hover:border-primary-500/30"><div className="mb-8 text-5xl transition group-hover:scale-110">{mode.icon}</div><h3 className="text-2xl font-black">{mode.title}</h3><p className="mt-2 text-text-secondary">{mode.text}</p><div className="mt-7 text-sm font-bold text-primary-600 dark:text-primary-400">ورود به گیم‌مود <span>←</span></div></motion.div>)}</div></section>
      <section className="container mx-auto px-4 pb-24"><div className="rounded-3xl border border-primary-500/20 bg-gradient-to-l from-primary-600/15 via-purple-500/10 to-transparent p-8 md:p-12"><div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="font-semibold text-primary-600 dark:text-primary-300">آماده‌ای؟</p><h2 className="mt-2 text-3xl font-black">ماجراجویی بعدی تو از همین‌جا شروع می‌شود.</h2></div><Link to="/register" className="rounded-2xl bg-primary-600 px-7 py-4 font-bold text-white transition hover:bg-primary-700">ساخت حساب رایگان</Link></div></div></section>
    </main>
  )
}
