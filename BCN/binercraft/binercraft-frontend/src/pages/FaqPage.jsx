import { motion } from 'framer-motion'

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
      >
        <h1 className="text-3xl font-bold mb-4">FaqPage</h1>
        <p className="text-text-secondary">
          این صفحه در حال ساخت است...
        </p>
        <div className="mt-8 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
          <p className="text-sm text-primary-600 dark:text-primary-400">
            🔧 در حال توسعه
          </p>
        </div>
      </motion.div>
    </div>
  )
}
