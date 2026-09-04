import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function ImageUpload({ onUpload, className = '' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      onUpload?.(file, reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false) }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
        className={`w-full glass-card border-2 border-dashed transition-all text-right ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-glass-border'}`}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="پیش‌نمایش" className="w-full h-auto max-h-64 object-contain rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">تغییر عکس</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3" aria-hidden="true">📤</div>
            <p className="text-text-secondary text-sm">عکس را اینجا بکشید یا کلیک کنید</p>
            <p className="text-text-secondary text-xs mt-1">PNG، JPG یا WEBP</p>
          </div>
        )}
      </motion.button>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFile(event.target.files?.[0])} className="hidden" />
    </div>
  )
}
