import { BRAND, WALL } from '../../../config/wall'

// The logo as a block of cells in the mosaic. Same cells as cornerSlots() blocks in useWallState,
// so it only ever sits over cells that never hold photos.
const box = {
  left: `${(BRAND.corner.endsWith('right') ? (WALL.cols - BRAND.blockCols) / WALL.cols : 0) * 100}%`,
  top: `${(BRAND.corner.startsWith('bottom') ? (WALL.rows - BRAND.blockRows) / WALL.rows : 0) * 100}%`,
  width: `${(BRAND.blockCols / WALL.cols) * 100}%`,
  height: `${(BRAND.blockRows / WALL.rows) * 100}%`,
  backgroundColor: BRAND.color,
}

export default function BrandTile() {
  return (
    <div className="absolute z-20 grid place-items-center" style={box}>
      <img src={BRAND.logoUrl} alt="" draggable={false} className="h-[68%] max-w-[80%] object-contain" />
    </div>
  )
}
