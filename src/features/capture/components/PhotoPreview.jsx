import { AnimatePresence, motion } from 'framer-motion'
import { FiLoader, FiRotateCcw, FiSend } from 'react-icons/fi'

export default function PhotoPreview({ src, status, progress, error, onRetake, onSubmit }) {
  const busy = status === 'compressing' || status === 'uploading'
  let submitLabel = error ? 'Try again' : 'Send to wall'
  if (status === 'compressing') submitLabel = 'Preparing…'
  if (status === 'uploading') submitLabel = `Sending ${Math.round(progress * 100)}%`

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Square preview = how the photo is cropped on the wall */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl shadow-black/60">
        {src && (
          <motion.img
            src={src}
            alt="Your photo"
            className="size-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: busy ? 0.6 : 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}

        <AnimatePresence>
          {busy && (
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full origin-left bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: status === 'uploading' ? progress : 0.05 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onRetake}
          disabled={busy}
          aria-label="Retake photo"
          className="grid size-14 place-items-center rounded-2xl bg-white/10 text-xl disabled:opacity-40"
        >
          <FiRotateCcw />
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={busy}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-neutral-950 disabled:opacity-80"
        >
          {busy ? <FiLoader className="animate-spin" /> : <FiSend />}
          <span className="tabular-nums">{submitLabel}</span>
        </motion.button>
      </div>
    </div>
  )
}
