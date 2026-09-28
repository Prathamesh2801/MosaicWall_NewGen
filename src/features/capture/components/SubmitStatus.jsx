import { motion } from 'framer-motion'
import { FiCamera, FiCheck } from 'react-icons/fi'

export default function SubmitStatus({ photoUrl, onAgain }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="relative">
        <motion.img
          src={photoUrl}
          alt="Your photo"
          className="size-40 rounded-3xl object-cover shadow-2xl shadow-black/60"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="absolute -right-3 -bottom-3 grid size-12 place-items-center rounded-full bg-emerald-400 text-neutral-950 ring-4 ring-neutral-950"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.25 }}
        >
          <FiCheck className="size-6" />
        </motion.span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold">Photo sent!</h2>
        <p className="mt-2 text-white/60">Watch the big screen, it will appear shortly.</p>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onAgain}
        className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-medium"
      >
        <FiCamera /> Take another
      </motion.button>
    </div>
  )
}
