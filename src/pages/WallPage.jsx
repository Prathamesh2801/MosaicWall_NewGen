import { BRAND, WALL } from '../config/wall'
import { BrandFrame, MosaicWall, useWakeLock } from '../features/wall'

const toggleFullscreen = () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()

const wallBox = { aspectRatio: `${WALL.cols} / ${WALL.rows}`, width: `min(100vw, ${(WALL.cols / WALL.rows) * 100}dvh)` }

export default function WallPage() {
  useWakeLock()

  return (
    // Kiosk: no cursor, double-click anywhere toggles fullscreen.
    <main onDoubleClick={toggleFullscreen} className="grid h-dvh w-screen cursor-none place-items-center overflow-hidden bg-black">
      {/* Largest cols:rows box that fits the screen, whatever the display resolution */}
      <div className="relative" style={wallBox}>
        {BRAND.enabled ? (
          <BrandFrame>
            <MosaicWall />
          </BrandFrame>
        ) : (
          <MosaicWall />
        )}
      </div>
    </main>
  )
}
