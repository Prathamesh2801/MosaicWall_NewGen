import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'

const EASE = [0.22, 1, 0.36, 1]
const SETTLE = { duration: 1.4, ease: EASE }

// Empty cell = black cover hiding the artwork behind the grid. When a photo lands (the hero has just
// shrunk to exactly this box) it starts fully opaque, then fades to `opacity` while the cover fades
// out, so this piece of the artwork shows through the photo. Restored tiles mount already settled.
// `opacity` is the operator's live level — when they move the slider every placed photo re-animates to it.
function MosaicTile({ tile, isTarget, isLatest, opacity }) {
  return (
    <div className="relative outline outline-white/[0.04]">
      <motion.div className="absolute inset-0 bg-black" initial={false} animate={{ opacity: tile ? 0 : 1 }} transition={SETTLE} />

      {tile && (
        <motion.img
          key={tile.id}
          src={tile.url}
          alt=""
          draggable={false}
          initial={isLatest ? { opacity: 1 } : false}
          animate={{ opacity }}
          transition={{ ...SETTLE, delay: 0.2 }}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {/* Landing flash */}
      {tile && isLatest && (
        <motion.span
          key={`flash-${tile.id}`}
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      )}

      {/* Where the on-stage photo is headed */}
      <AnimatePresence>
        {isTarget && (
          <motion.span
            key="target"
            className="absolute inset-0 bg-white/10 ring-2 ring-white/80 ring-inset"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(MosaicTile)
