import { WALL } from '../../../config/wall'
import MosaicTile from './MosaicTile'

const gridStyle = {
  gridTemplateColumns: `repeat(${WALL.cols}, 1fr)`,
  gridTemplateRows: `repeat(${WALL.rows}, 1fr)`,
}

export default function MosaicGrid({ tiles, targetSlot, latestId, opacity }) {
  return (
    <div className="absolute inset-0 grid" style={gridStyle}>
      {tiles.map((tile, slot) => (
        <MosaicTile key={slot} tile={tile} isTarget={slot === targetSlot} isLatest={tile?.id === latestId} opacity={opacity} />
      ))}
    </div>
  )
}
