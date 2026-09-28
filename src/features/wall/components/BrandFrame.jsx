import { BRAND } from '../../../config/wall'

// The wall is the same 16:9 shape scaled by frameScale inside the 16:9 screen box, so the spare width
// (in px) is 16/9× the spare height. Top, bottom and the outer side get the same border; the rest of
// the width is the logo band.
const spare = 1 - BRAND.frameScale
const border = (spare / 2) * (9 / 16) // outer side, as a fraction of width (same px as top/bottom)
const band = spare - border
const onLeft = BRAND.logoSide === 'left'
const pct = (n) => `${n * 100}%`

const wallBox = {
  left: pct(onLeft ? band : border),
  top: pct(spare / 2),
  width: pct(BRAND.frameScale),
  height: pct(BRAND.frameScale),
}
const logoBox = { [onLeft ? 'left' : 'right']: 0, top: 0, width: pct(band), height: '100%' }

export default function BrandFrame({ children }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: BRAND.color }}>
      <div className="absolute grid place-items-center" style={logoBox}>
        <img src={BRAND.logoUrl} alt="" draggable={false} className="max-h-[80%] w-[70%] object-contain" />
      </div>
      <div className="absolute" style={wallBox}>
        {children}
      </div>
    </div>
  )
}
