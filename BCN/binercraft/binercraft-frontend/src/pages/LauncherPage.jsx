import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const features = [
  { icon: '⚡', title: 'سریع و سبک', text: 'لانچ سریع، رابط سبک و تجربه‌ای روان برای شروع بازی.' },
  { icon: '◈', title: 'مدیریت نسخه‌ها', text: 'نسخه‌های مختلف Minecraft را مرتب و ساده مدیریت کن.' },
  { icon: '◉', title: 'اتصال به BinerCraft', text: 'دسترسی سریع به شبکه BinerCraft و سرورهای موردعلاقه.' },
  { icon: '↻', title: 'آپدیت خودکار', text: 'لانچر را همیشه به آخرین نسخه و قابلیت‌های جدید به‌روز نگه دار.' },
  { icon: '⚙', title: 'تنظیمات هوشمند', text: 'تنظیمات بازی، حافظه و اجرای Minecraft را از یکجا کنترل کن.' },
  { icon: '◆', title: 'طراحی اختصاصی', text: 'رابط فارسی، مدرن و ساخته‌شده با هویت بصری BinerCraft.' },
]

const versions = ['1.21.11', '1.21.10', '1.21.8', '1.21', '1.20.6', '1.20.1', '1.19.4', '1.8.9']

export default function LauncherPage() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate min-h-[760px] overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_15%,rgba(37,99,235,.30),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(124,58,237,.24),transparent_30%),linear-gradient(135deg,#020617,#07152f_48%,#120c2d)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-1/2 top-28 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="container mx-auto grid min-h-[760px] items-center gap-14 px-4 py-20 lg:grid-cols-[.9fr_1.1fr]">
          <motion.div initial={reduceMotion ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} dir="rtl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-200 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" /> BinerCraft Launcher
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.12] tracking-tight md:text-7xl">
              بازی را از یک<br />
              <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">جای بهتر شروع کن.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-9 text-slate-300 md:text-xl">
              باینر لانچر، لانچر اختصاصی BinerCraft برای مدیریت نسخه‌ها، اجرای سریع Minecraft و اتصال راحت‌تر به دنیای BinerCraft است.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#download" className="rounded-2xl bg-blue-600 px-7 py-4 font-black shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-500">دانلود رایگان لانچر ↓</a>
              <Link to="/" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">بازگشت به BinerCraft</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
              <span>✓ رایگان</span><span>✓ رابط فارسی</span><span>✓ Windows</span><span>✓ اتصال سریع به سرور</span>
            </div>
          </motion.div>

          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .8, delay: .1 }} className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-600/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[.07] p-2 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080d1c]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" /><span className="h-3 w-3 rounded-full bg-yellow-400/80" /><span className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="mr-auto text-xs text-slate-500">BINER LAUNCHER</span>
                </div>
                <div className="grid min-h-[410px] grid-cols-[88px_1fr]">
                  <aside className="border-l border-white/5 bg-white/[.025] p-3">
                    <div className="mb-7 flex h-11 items-center justify-center rounded-xl bg-blue-600/20 text-xl">⛏</div>
                    <div className="space-y-3 text-center text-xs text-slate-500"><div className="rounded-xl bg-white/10 py-3 text-white">⌂<br />خانه</div><div className="py-3">◈<br />نسخه‌ها</div><div className="py-3">⚙<br />تنظیمات</div></div>
                  </aside>
                  <div className="p-6" dir="rtl">
                    <div className="flex items-center justify-between"><div><p className="text-xs text-cyan-300">خوش آمدی</p><h2 className="mt-1 text-2xl font-black">انتخاب نسخه</h2></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">● سرور آنلاین</div></div>
                    <div className="mt-6 grid grid-cols-4 gap-3">{versions.map((v, i) => <div key={v} className={`rounded-xl border p-3 text-center transition ${i === 0 ? 'border-blue-400/50 bg-blue-500/15 shadow-lg shadow-blue-600/10' : 'border-white/10 bg-white/[.035]'}`}><div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/40 to-violet-500/30 text-xs font-black">MC</div><span className="text-[11px] font-bold text-slate-300">{v}</span></div>)}</div>
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3"><div className="flex-1 text-right"><p className="text-xs text-slate-500">سرور انتخاب‌شده</p><p className="mt-1 font-bold">BinerCraft Network</p></div><button type="button" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black shadow-lg shadow-blue-600/20">PLAY ▶</button></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[.02] py-5" dir="rtl">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm text-slate-400"><span>ساخته‌شده برای BinerCraft</span><span>•</span><span>مدیریت نسخه‌ها</span><span>•</span><span>اجرای سریع</span><span>•</span><span>طراحی RTL</span><span>•</span><span>آپدیت خودکار</span></div>
      </section>

      <section className="container mx-auto px-4 py-24" dir="rtl">
        <div className="mx-auto max-w-2xl text-center"><p className="font-bold text-cyan-300">چرا باینر لانچر؟</p><h2 className="mt-3 text-4xl font-black md:text-5xl">همه‌چیز برای شروع یک بازی خوب</h2><p className="mt-5 leading-8 text-slate-400">قرار نیست لانچر فقط یک دکمه Play باشد؛ باینر لانچر قرار است مرکز کنترل تجربه Minecraft تو باشد.</p></div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map((feature, i) => <motion.div key={feature.title} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * .05 }} className="rounded-3xl border border-white/10 bg-white/[.035] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-blue-400/25 hover:bg-white/[.055]"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-cyan-300">{feature.icon}</div><h3 className="text-xl font-black">{feature.title}</h3><p className="mt-3 leading-7 text-slate-400">{feature.text}</p></motion.div>)}</div>
      </section>

      <section className="container mx-auto px-4 pb-24" dir="rtl">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-l from-blue-600/15 via-violet-600/10 to-white/[.03] p-8 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div><p className="font-bold text-cyan-300">نسخه‌ها همیشه دم دستت</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Minecraft را همان‌طور که دوست داری اجرا کن.</h2><p className="mt-4 max-w-2xl leading-8 text-slate-400">نسخه‌های محبوبت را انتخاب کن، تنظیمات را مدیریت کن و برای ورود به BinerCraft آماده شو.</p></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{versions.slice(0, 8).map(v => <span key={v} className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-center text-sm font-bold text-slate-300">{v}</span>)}</div>
          </div>
        </div>
      </section>

      <section id="download" className="container mx-auto px-4 pb-28" dir="rtl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-violet-700/15 p-10 text-center md:p-16">
          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative"><p className="font-bold text-cyan-300">Biner Launcher</p><h2 className="mt-3 text-4xl font-black md:text-6xl">آماده‌ای شروع کنیم؟</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">لانچر باینر را دریافت کن و تجربه جدید BinerCraft را از دسکتاپت شروع کن.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" className="rounded-2xl bg-blue-600 px-9 py-4 font-black shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-500">دانلود برای Windows ↓</button><span className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-slate-400">به‌زودی</span></div><p className="mt-5 text-xs text-slate-500">لینک دانلود پس از انتشار فایل رسمی لانچر فعال می‌شود.</p></div>
        </div>
      </section>
    </main>
  )
}
