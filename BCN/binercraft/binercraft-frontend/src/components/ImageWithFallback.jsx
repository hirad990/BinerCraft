import { useState } from 'react'

export default function ImageWithFallback({ src, alt, className = '', fallbackIcon = '❓' }) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={lex items-center justify-center bg-glass-bg rounded-lg }>
        <span className="text-4xl">{fallbackIcon}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
