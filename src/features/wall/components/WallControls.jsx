import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { WALL } from '../../../config/wall'

const PANEL_KEY = 'o' // O toggles this panel; Esc closes it. Chosen to avoid the wall's other keys.

// Custom slider thumb (appearance-none strips the native track/thumb so the gradient fill shows through).
// The `main` rule un-hides the kiosk cursor (WallPage sets cursor-none) while this panel is mounted, so the
// operator can actually find and drag the slider; it reverts the moment the panel closes/unmounts.
const sliderCss = `
main{cursor:auto!important}
.wall-opacity-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:1.6rem;height:1.6rem;border-radius:9999px;background:#fff;border:3px solid #0ea5e9;box-shadow:0 0 0 4px rgba(14,165,233,.3);cursor:pointer;margin-top:-0.5rem}
.wall-opacity-slider::-moz-range-thumb{width:1.6rem;height:1.6rem;border-radius:9999px;background:#fff;border:3px solid #0ea5e9;box-shadow:0 0 0 4px rgba(14,165,233,.3);cursor:pointer}
.wall-opacity-slider:focus{outline:none}
`

// Operator panel for the photo-opacity "power meter" — hidden by default so nothing shows on the LED
// wall, toggled with O when the production person needs to eyeball the mix of photos vs. artwork.
export default function WallControls({ opacity, setOpacity }) {
  const [open, setOpen] = useState(false)
  const restoreRef = useRef(opacity || WALL.tileOpacity) // remembers the level so Show can restore it

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const k = event.key.toLowerCase()
      if (k === PANEL_KEY && event.target.tagName !== 'INPUT') setOpen((v) => !v)
      else if (k === 'escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const pct = Math.round(opacity * 100)
  const hidden = opacity === 0

  const toggleHidden = () => {
    if (hidden) {
      setOpacity(restoreRef.current || WALL.tileOpacity)
    } else {
      restoreRef.current = opacity
      setOpacity(0)
    }
  }

  const onSlide = (event) => {
    const next = Number(event.target.value) / 100
    if (next > 0) restoreRef.current = next
    setOpacity(next)
  }

  const trackStyle = {
    background: `linear-gradient(to right, #0ea5e9 0%, #38bdf8 ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="wall-controls"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="absolute top-[2%] left-[1.2%] z-50 w-80 max-w-[90vw] select-none rounded-2xl bg-black/80 p-5 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
        >
          <style>{sliderCss}</style>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide text-white/90">Photo opacity</span>
            <span className="text-2xl font-bold tabular-nums text-sky-400">{pct}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={pct}
            onChange={onSlide}
            style={trackStyle}
            className="wall-opacity-slider h-3 w-full cursor-pointer appearance-none rounded-full"
            aria-label="Photo opacity"
          />

          <div className="mt-2 flex justify-between text-[0.7rem] text-white/40">
            <span>Artwork</span>
            <span>Photos</span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={toggleHidden}
              className="flex-1 cursor-pointer rounded-lg bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              {hidden ? 'Show photos' : 'Hide photos'}
            </button>
            <button
              type="button"
              onClick={() => setOpacity(0.5)}
              className="cursor-pointer rounded-lg bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setOpacity(1)}
              className="cursor-pointer rounded-lg bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              100%
            </button>
          </div>

          <p className="mt-4 text-center text-[0.7rem] text-white/35">Press O or Esc to hide this panel</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
