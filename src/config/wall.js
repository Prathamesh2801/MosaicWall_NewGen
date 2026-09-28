import logo from '../assets/brand-logo.png'
import background from '../assets/mosaic-art-bg.jpg'

// Brand frame around the wall. enabled: false = plain full-screen mosaic.
// The mosaic always keeps all cols × rows cells and the whole artwork; the logo lives in the frame.
export const BRAND = {
  enabled: true,
  logoUrl: logo, // replace src/assets/brand-logo.png (transparent PNG works best)
  color: '#ffffff', // frame colour; pick one the logo reads well on

  // The wall is scaled uniformly (stays 16:9, square cells). The border is equal on three sides and the
  // spare width becomes a logo band on `logoSide`. 1080p: 0.88 ≈ 65px border, 165px logo band.
  frameScale: 0.88,
  logoSide: 'right', // 'left' | 'right'
}

export const WALL = {
  cols: 16,
  rows: 9,

  // The artwork the mosaic reveals. The wall starts black; each landed photo uncovers its cell.
  // Final art is 16:9 (fills the wall exactly, no crop): 1920×1080 for a 1080p TV, 3840×2160 for 4K.
  // Replace src/assets/mosaic-art-bg.jpg with the same filename and rebuild; no code change needed.
  backgroundUrl: background,
  // Opacity of a settled photo over the artwork: lower = artwork reads stronger, higher = photos read stronger.
  tileOpacity: 0.3,

  // Reveal per photo: gap → assemble from tiles → hold on stage → fly into its cell (flyMs × pace).
  // Switches to `fast` when the backlog reaches fastQueueThreshold; pace scales every animation.
  normal: { gapMs: 800, holdMs: 1800, pace: 1 },
  fast: { gapMs: 250, holdMs: 500, pace: 0.55 },
  fastQueueThreshold: 5,
  flyMs: 1100,

  // Placed photos survive a normal reload. Hard reload (Ctrl/Cmd+Shift+R, Ctrl+F5) on /wall = blank wall.
  storageKey: 'mosaicwall:wall',
  // Status pill shown/hidden (key H), remembered per browser.
  statusKey: 'mosaicwall:status',
}
