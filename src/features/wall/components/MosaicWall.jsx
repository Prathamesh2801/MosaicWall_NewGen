import { AnimatePresence, motion } from 'framer-motion'
import { WALL } from '../../../config/wall'
import { useStatusVisible } from '../hooks/useStatusVisible'
import { useWallState } from '../hooks/useWallState'
import { useWallStream } from '../hooks/useWallStream'
import HeroReveal from './HeroReveal'
import MosaicGrid from './MosaicGrid'
import WallStatus from './WallStatus'

const artworkStyle = { backgroundImage: `url(${WALL.backgroundUrl})` }

// Layers, bottom → top: artwork · photo grid (black covers on empty cells) · spotlight + hero · status.
export default function MosaicWall() {
  const { state, dispatch, timing, land } = useWallState()
  const connection = useWallStream(dispatch)
  const statusVisible = useStatusVisible()
  const filled = state.tiles.filter(Boolean).length

  return (
    // Fills the 16:9 box WallPage gives it (full screen, or inside the brand frame); all maths is in %.
    <div className="relative size-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-cover bg-center" style={artworkStyle} />
      <MosaicGrid tiles={state.tiles} targetSlot={state.hero?.slot} latestId={state.lastPlacedId} />
      {state.hero && <HeroReveal key={state.hero.id} hero={state.hero} timing={timing} onLanded={land} />}
      <AnimatePresence>
        {statusVisible && (
          <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WallStatus connection={connection} filled={filled} total={state.tiles.length} queue={state.queue} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
