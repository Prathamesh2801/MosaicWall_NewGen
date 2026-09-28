import { BRAND } from '../../../config/wall'

// Thin border: the wall is the same 16:9 shape scaled by frameScale and centred in the screen box.
const margin = `${((1 - BRAND.frameScale) / 2) * 100}%`
const wallBox = {
  left: margin,
  top: margin,
  width: `${BRAND.frameScale * 100}%`,
  height: `${BRAND.frameScale * 100}%`,
}

export default function BrandFrame({ children }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: BRAND.color }}>
      <div className="absolute" style={wallBox}>
        {children}
      </div>
    </div>
  )
}
