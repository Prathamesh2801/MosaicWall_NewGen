import { AnimatePresence, motion } from 'framer-motion'

const STATUS = {
  live: { label: 'Live', dot: 'bg-emerald-400' },
  connecting: { label: 'Connecting…', dot: 'bg-amber-400 animate-pulse' },
  offline: { label: 'Offline, retrying', dot: 'bg-red-500 animate-pulse' },
  mock: { label: 'Demo · M add · B burst', dot: 'bg-sky-400' },
}
const VISIBLE_QUEUE = 5

// Small bottom-right pill: connection, fill count and the waiting queue as thumbnails.
export default function WallStatus({ connection, filled, total, queue }) {
  const { label, dot } = STATUS[connection]

  return (
    <div className="absolute right-[1.2%] bottom-[2%] z-50 flex items-center gap-[0.8vw] rounded-full bg-black/60 px-[1vw] py-[0.45vw] text-[0.75vw] text-white/70 backdrop-blur-md">
      <span className="flex items-center gap-[0.4vw]">
        <span className={`size-[0.5vw] rounded-full ${dot}`} /> {label}
      </span>
      <span className="tabular-nums">
        {filled}/{total}
      </span>
      <span className="flex items-center gap-[0.4vw]">
        <span className="flex -space-x-[0.5vw]">
          <AnimatePresence initial={false} mode="popLayout">
            {queue.slice(0, VISIBLE_QUEUE).map((item) => (
              <motion.img
                key={item.id}
                layout="position"
                src={item.url}
                alt=""
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.35 }}
                className="size-[1.5vw] rounded-full border-2 border-black object-cover"
              />
            ))}
          </AnimatePresence>
        </span>
        {queue.length > VISIBLE_QUEUE && <span className="tabular-nums">+{queue.length - VISIBLE_QUEUE}</span>}
      </span>
    </div>
  )
}
