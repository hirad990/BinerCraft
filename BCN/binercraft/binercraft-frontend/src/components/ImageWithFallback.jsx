import { useState } from 'react'

export default function ImageWithFallback({ src, alt = '', className = '', fallbackIcon = '🖼️' }) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`flex min-h-32 items-center justify-center bg-glass-bg rounded-lg ${className}`} role="img" aria-label={alt}>
        <span className="text-4xl" aria-hidden="true">{fallbackIcon}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />
}
