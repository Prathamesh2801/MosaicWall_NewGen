import logo from '../assets/brand-logo.png'
import background from '../assets/mosaic-art-bg.jpg'

// Brand on the wall. enabled: false = plain full-screen mosaic, all 144 cells take photos.
export const BRAND = {
  enabled: false,
  logoUrl: logo, // replace src/assets/brand-logo.png (transparent PNG works best)
  color: '#ffffff', // logo tile + frame colour; pick one the logo reads well on

  // Logo tile: a block of cells in a corner of the mosaic. Photos never land there.
  corner: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  blockCols: 3,
  blockRows: 2,

  // Thin border around the whole wall. The wall scales uniformly inside it (stays 16:9, square cells),
  // so the sides are 16/9× the top/bottom. 0.97 ≈ 29px sides, 16px top/bottom on a 1080p TV.
  frame: true,
  frameScale: 0.97,
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
