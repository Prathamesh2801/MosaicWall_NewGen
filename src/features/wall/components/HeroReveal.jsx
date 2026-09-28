import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import MosaicImage from './MosaicImage'
import { WALL } from '../../../config/wall'

const HERO = 4 // on-stage size, in cells
const EASE_IN_OUT = [0.65, 0, 0.35, 1]
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// HERO×HERO cells, centred on the wall.
const heroBox = {
  left: `${((WALL.cols - HERO) / 2 / WALL.cols) * 100}%`,
  top: `${((WALL.rows - HERO) / 2 / WALL.rows) * 100}%`,
  width: `${(HERO / WALL.cols) * 100}%`,
  height: `${(HERO / WALL.rows) * 100}%`,
  willChange: 'transform',
}

// Centre stage for the newest photo: assemble from tiles → hold → shrink into its cell.
// Landing is transform-only (translate + scale 1/HERO) from pure grid maths, no DOM measuring, so it's
// GPU-smooth on TV browsers and ends pixel-aligned with the tile that replaces it on onLanded().
export default function HeroReveal({ hero, timing, onLanded }) {
  const [scope, animate] = useAnimate()
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const col = hero.slot % WALL.cols
  const row = Math.floor(hero.slot / WALL.cols)

  const land = async () => {
    await wait(timing.holdMs)
    if (!alive.current) return
    const duration = (WALL.flyMs / 1000) * timing.pace
    animate('.spotlight', { opacity: 0 }, { duration })
    animate('.halo', { opacity: 0 }, { duration: duration / 2 })
    await animate(
      '.hero',
      {
        x: `${((col + 0.5 - WALL.cols / 2) / HERO) * 100}%`,
        y: `${((row + 0.5 - WALL.rows / 2) / HERO) * 100}%`,
        scale: 1 / HERO,
      },
      { duration, ease: EASE_IN_OUT },
    )
    if (alive.current) onLanded()
  }

  return (
    <div ref={scope} className="pointer-events-none absolute inset-0 z-40">
      <motion.div
        className="spotlight absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_55%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 * timing.pace }}
      />
      <div className="hero absolute" style={heroBox}>
        <motion.div
          className="halo absolute -inset-[10%] rounded-full bg-white/15 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * timing.pace }}
        />
        <MosaicImage src={hero.url} pace={timing.pace} onAssembled={land} className="size-full" />
      </div>
    </div>
  )
}
