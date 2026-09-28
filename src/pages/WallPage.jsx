import { BRAND } from '../config/wall'
import { BrandFrame, MosaicWall, useWakeLock } from '../features/wall'

const toggleFullscreen = () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()

export default function WallPage() {
  useWakeLock()

  return (
    // Kiosk: no cursor, double-click anywhere toggles fullscreen.
    <main onDoubleClick={toggleFullscreen} className="grid h-dvh w-screen cursor-none place-items-center overflow-hidden bg-black">
      {/* Largest 16:9 box that fits the screen, whatever the TV resolution */}
      <div className="relative aspect-video w-[min(100vw,177.78dvh)]">
        {BRAND.enabled && BRAND.frame ? (
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
