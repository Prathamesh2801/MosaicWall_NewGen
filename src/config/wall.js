import logo from '../assets/brand-logo.png'
import background from '../assets/mosaic-art-bg.png'

// Brand frame around the wall. enabled: false = plain full-screen mosaic.
// The mosaic always keeps all cols × rows cells and the whole artwork; the logo lives in the frame.
export const BRAND = {
  enabled: false,
  logoUrl: logo, // replace src/assets/brand-logo.png (transparent PNG works best)
  color: '#ffffff', // frame colour; pick one the logo reads well on

  // Logo sits in a header band on top. The wall below keeps its cols:rows shape (square cells, same resolution),
  // centred with equal left/right borders. Fractions of screen height; 1080p: 0.12 ≈ 130px, 0.03 ≈ 32px.
  headerHeight: 0.12,
  bottomBorder: 0.03,
  logoAlign: 'center', // 'left' | 'center' | 'right' (left/right line up with the wall's edges)
}

export const WALL = {
  // Screen shape follows cols / rows (15 × 10 = 3:2 for the 6ft × 4ft wall); cells stay square.
  cols: 15,
  rows: 10,

  // The artwork the mosaic reveals. The wall starts black; each landed photo uncovers its cell.
  // Final art is 3:2 (fills the wall exactly, no crop): ideally the LED wall's native resolution, else e.g. 3000×2000.
  // Replace src/assets/mosaic-art-bg.png with the same filename and rebuild; no code change needed.
  backgroundUrl: background,
  // Opacity of a settled photo over the artwork: lower = artwork reads stronger, higher = photos read stronger.
  tileOpacity: 0.5,

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
