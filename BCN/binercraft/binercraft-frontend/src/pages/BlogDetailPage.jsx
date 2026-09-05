import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

const Icon = ({ name, size = 20 }) => {
  const paths = { back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>, calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></> }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function BlogDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/blog').then((r) => r.ok ? r.json() : []).then((items) => setPost(items.find((item) => String(item.id) === String(id)) || null)).catch(() => setPost(null)).finally(() => setLoading(false)) }, [id])

  if (loading) return <main className="container mx-auto max-w-4xl px-4 py-14"><div className="h-96 animate-pulse rounded-3xl bg-glass-bg/50" /></main>
  if (!post) return <main className="container mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-3xl font-black">مطلب پیدا نشد</h1><Link to="/blog" className="mt-5 inline-flex items-center gap-2 font-bold text-primary-500"><Icon name="back"/> بازگشت به وبلاگ</Link></main>

  return <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-14"><Link to="/blog" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-primary-500"><Icon name="back"/> همه مطالب</Link><motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-glass-border bg-glass-bg/50 shadow-xl">
    {post.image && <img src={post.image} alt="" className="max-h-[28rem] w-full object-cover" />}
    <div className="p-6 sm:p-10"><div className="mb-5 flex items-center gap-2 text-sm text-text-secondary"><Icon name="calendar" size={16}/>{post.date || '—'} {post.category ? `· ${post.category}` : ''}</div><h1 className="text-3xl font-black leading-tight sm:text-5xl">{post.title}</h1>{post.summary && <p className="mt-5 text-lg leading-8 text-text-secondary">{post.summary}</p>}<div className="prose prose-slate mt-9 max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-8"><ReactMarkdown>{post.content || post.summary || ''}</ReactMarkdown></div><div className="mt-10 border-t border-glass-border pt-5 text-sm text-text-secondary">نویسنده: {post.author || 'تیم BinerCraft'}</div></div>
  </motion.article></main>
}
