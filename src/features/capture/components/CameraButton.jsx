import { motion } from 'framer-motion'
import { FiCamera } from 'react-icons/fi'

export default function CameraButton({ onCapture }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow picking the same photo again after a retake
    if (file && (!file.type || file.type.startsWith('image/'))) onCapture(file)
  }

  return (
    <label className="flex cursor-pointer flex-col items-center gap-8">
      <span className="relative grid size-40 place-items-center">
        {/* Soft ripples inviting the tap */}
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-white/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          whileTap={{ scale: 0.9 }}
          className="relative grid size-full place-items-center rounded-full bg-white text-neutral-950 shadow-[0_0_80px_rgba(255,255,255,0.25)]"
        >
          <FiCamera className="size-14" />
        </motion.span>
      </span>
      <span className="text-center">
        <span className="block text-lg font-medium">Tap to take your photo</span>
        <span className="mt-1 block text-sm text-white/50">It becomes one tile of the mosaic</span>
      </span>
      {/* capture= opens the native camera app; "user" asks for the front (selfie) camera.
          iOS Safari honours it; on Android it's a hint the OEM camera app may ignore. */}
      <input type="file" accept="image/*" capture="user" className="sr-only" onChange={handleChange} />
    </label>
  )
}
