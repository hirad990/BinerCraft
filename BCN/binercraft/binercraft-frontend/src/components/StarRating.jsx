import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function StarRating({ rating = 0, onChange, readonly = false, maxStars = 5 }) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const displayRating = hoveredRating > 0 && !readonly ? hoveredRating : Number(rating) || 0

  return (
    <div className="flex gap-1" dir="ltr" aria-label={`امتیاز ${displayRating} از ${maxStars}`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const isFilled = index < displayRating
        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => !readonly && onChange?.(index + 1)}
            onMouseEnter={() => !readonly && setHoveredRating(index + 1)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            className={`text-2xl transition-colors ${isFilled ? 'text-yellow-400' : 'text-text-secondary/40'} ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'}`}
            whileHover={readonly || shouldReduceMotion ? undefined : { scale: 1.15 }}
            whileTap={readonly || shouldReduceMotion ? undefined : { scale: 0.9 }}
            disabled={readonly}
            aria-label={`امتیاز ${index + 1}`}
          >
            ★
          </motion.button>
        )
      })}
      <span className="text-sm text-text-secondary mr-2">({Number(rating || 0).toFixed(1)})</span>
    </div>
  )
}
