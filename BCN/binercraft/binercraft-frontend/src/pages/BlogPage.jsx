import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const Icon = ({ name, size = 20 }) => {
  const paths = {
    article: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
    tag: <><path d="M20 13 13 20 4 11V4h7l9 9Z"/><path d="M8 8h.01"/></>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    fetch('/api/blog').then((r) => r.ok ? r.json() : []).then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false))
  }, [])

  return <main className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
    <motion.header initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400"><Icon name="article" size={17}/> مجله BinerCraft</div>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">آخرین اخبار و مطالب</h1>
      <p className="mx-auto mt-3 max-w-2xl text-text-secondary">اخبار سرور، آموزش‌ها، رویدادها و جدیدترین اتفاقات BinerCraft را اینجا دنبال کنید.</p>
    </motion.header>
    {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-72 animate-pulse rounded-3xl border border-glass-border bg-glass-bg/50" />)}</div> : posts.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.map((post, index) => <motion.article key={post.id} initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.06 }} className="group overflow-hidden rounded-3xl border border-glass-border bg-glass-bg/50 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-xl">
      {post.image ? <img src={post.image} alt="" className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary-600/20 via-background to-purple-600/20"><Icon name="article" size={52}/></div>}
      <div className="p-6"><div className="mb-3 flex items-center gap-3 text-xs text-text-secondary"><span className="inline-flex items-center gap-1"><Icon name="calendar" size={14}/>{post.date || '—'}</span>{post.category && <span className="inline-flex items-center gap-1"><Icon name="tag" size={14}/>{post.category}</span>}</div><h2 className="text-xl font-black leading-8">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-7 text-text-secondary">{post.summary || post.content || 'برای مطالعه این مطلب وارد صفحه آن شوید.'}</p><Link to={`/blog/${post.id}`} className="mt-5 inline-flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400">مطالعه مطلب <Icon name="arrow" size={17}/></Link></div>
    </motion.article>)}</div> : <div className="rounded-3xl border border-dashed border-glass-border p-12 text-center text-text-secondary"><Icon name="article" size={38}/><p className="mt-4 font-bold">هنوز مطلبی منتشر نشده است.</p></div>}
  </main>
}
