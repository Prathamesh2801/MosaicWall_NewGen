import { BRAND } from '../../../config/wall'

// Header band on top, then the wall: same 16:9 shape scaled to the height that's left, so cells stay
// square. Screen and wall are both 16:9, so the wall's height fraction is also its width fraction.
// ponytail: side borders come out wider than the bottom one — a 16:9 wall in a 16:9 screen can't have
// a header and equal borders on the other three sides without squashing cells.
const scale = 1 - BRAND.headerHeight - BRAND.bottomBorder
const side = (1 - scale) / 2
const pct = (n) => `${n * 100}%`

const wallBox = { left: pct(side), top: pct(BRAND.headerHeight), width: pct(scale), height: pct(scale) }
const headerBox = {
  left: pct(side),
  width: pct(scale),
  top: 0,
  height: pct(BRAND.headerHeight),
  justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[BRAND.logoAlign] ?? 'center',
}

export default function BrandFrame({ children }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: BRAND.color }}>
      <div className="absolute flex items-center" style={headerBox}>
        <img src={BRAND.logoUrl} alt="" draggable={false} className="h-[70%] max-w-full object-contain" />
      </div>
      <div className="absolute" style={wallBox}>
        {children}
      </div>
    </div>
  )
}
