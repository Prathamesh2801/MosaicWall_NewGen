import { motion } from 'framer-motion'
import { useState } from 'react'

const EASE = [0.22, 1, 0.36, 1]

// A photo that assembles from grid×grid pieces in a diagonal wave (the wall's hero entrance).
// Pieces are clip-path slices of the same image (square, object-cover crop)
// and animate only opacity/scale. Once assembled they're swapped for one <img> to avoid hairline seams.
export default function MosaicImage({ src, grid = 4, pace = 1, onAssembled, className = '' }) {
  const [assembled, setAssembled] = useState(false)
  const step = 100 / grid
  const last = grid * grid - 1

  const finish = () => {
    setAssembled(true)
    onAssembled?.()
  }

  return (
    <div className={`relative ${className}`}>
      {assembled ? (
        <img src={src} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
      ) : (
        Array.from({ length: grid * grid }, (_, i) => {
          const row = Math.floor(i / grid)
          const col = i % grid
          return (
            <motion.img
              key={i}
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover"
              style={{
                clipPath: `inset(${row * step}% ${(grid - 1 - col) * step}% ${(grid - 1 - row) * step}% ${col * step}%)`,
                transformOrigin: `${(col + 0.5) * step}% ${(row + 0.5) * step}%`,
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 * pace, ease: EASE, delay: (row + col) * 0.07 * pace }}
              onAnimationComplete={i === last ? finish : undefined}
            />
          )
        })
      )}
    </div>
  )
}
