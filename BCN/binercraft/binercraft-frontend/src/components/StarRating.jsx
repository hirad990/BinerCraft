import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StarRating({ rating = 0, onChange, readonly = false, maxStars = 5 }) {
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleClick = (index) => {
    if (readonly) return
    const newRating = index + 1
    onChange?.(newRating)
  }

  const handleMouseEnter = (index) => {
    if (readonly) return
    setHoveredRating(index + 1)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoveredRating(0)
  }

  const displayRating = hoveredRating > 0 && !readonly ? hoveredRating : rating

  return (
    <div className="flex gap-1" dir="ltr">
      {[...Array(maxStars)].map((_, index) => {
        const isFilled = index < displayRating
        return (
          <motion.button
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={	ext-2xl transition-colors  }
            whileHover={{ scale: readonly ? 1 : 1.2 }}
            whileTap={{ scale: readonly ? 1 : 0.9 }}
            disabled={readonly}
            type="button"
          >
            ★
          </motion.button>
        )
      })}
      <span className="text-sm text-text-secondary mr-2">
        ({rating.toFixed(1)})
      </span>
    </div>
  )
}
