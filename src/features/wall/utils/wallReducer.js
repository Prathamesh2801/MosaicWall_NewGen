// Pure wall state. No config/asset imports so it runs under `node --test`.
//
// tiles:   fixed-length array (cols × rows), each null | { id, url, placedAt }
// queue:   photos received but not yet shown, in arrival order
// hero:    the photo currently on centre stage, with its target slot
// blocked: slots photos never use (e.g. under the brand logo tile)

export const createWallState = (total, blocked = []) => ({
  tiles: Array(total).fill(null),
  queue: [],
  hero: null,
  lastPlacedId: null,
  blocked,
})

// Slots covered by a w×h block in a corner ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right').
export function cornerSlots(cols, rows, w, h, corner) {
  const colStart = corner.endsWith('right') ? cols - w : 0
  const rowStart = corner.startsWith('bottom') ? rows - h : 0
  const slots = []
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) slots.push((rowStart + r) * cols + colStart + c)
  return slots
}

// What survives a reload: placed tiles in their exact slots, plus everything still waiting.
// The on-stage hero goes back to the front of the queue (the server never re-sends it).
export const toSavedWall = (state) => ({
  tiles: state.tiles,
  queue: state.hero ? [state.hero, ...state.queue] : state.queue,
})

// Rebuilds state from saved data. Anything malformed, from a different grid size, a mock-mode
// blob: URL (dead after reload) or sitting in a now-blocked slot is dropped instead of breaking the wall.
export function restoreWallState(saved, total, blocked = []) {
  const state = createWallState(total, blocked)
  if (!Array.isArray(saved?.tiles) || saved.tiles.length !== total) return state

  const skip = new Set(blocked)
  const usable = (item) => typeof item?.id === 'string' && typeof item.url === 'string' && !item.url.startsWith('blob:')
  state.tiles = saved.tiles.map((tile, slot) =>
    usable(tile) && !skip.has(slot) ? { ...tile, placedAt: Number(tile.placedAt) || 0 } : null,
  )
  state.queue = (Array.isArray(saved.queue) ? saved.queue : []).filter(usable).map(({ id, url }) => ({ id, url }))
  return state
}

// Random empty cell (organic fill), else replace the oldest tile once all are full. Never a blocked slot.
export function pickSlot(tiles, blocked = [], random = Math.random) {
  const skip = new Set(blocked)
  const empty = []
  tiles.forEach((tile, slot) => !tile && !skip.has(slot) && empty.push(slot))
  if (empty.length) return empty[Math.floor(random() * empty.length)]

  let oldest = -1
  tiles.forEach((tile, slot) => {
    if (tile && !skip.has(slot) && (oldest < 0 || tile.placedAt < tiles[oldest].placedAt)) oldest = slot
  })
  return oldest
}

const isKnown = (state, id) =>
  state.hero?.id === id || state.queue.some((q) => q.id === id) || state.tiles.some((t) => t?.id === id)

export function wallReducer(state, action) {
  switch (action.type) {
    case 'enqueue':
      // Guard against duplicate deliveries; ignore anything already seen.
      return isKnown(state, action.tile.id) ? state : { ...state, queue: [...state.queue, action.tile] }

    case 'revealStart': {
      if (state.hero || !state.queue.length) return state
      const [next, ...queue] = state.queue
      return { ...state, queue, hero: { ...next, slot: pickSlot(state.tiles, state.blocked) } }
    }

    case 'revealDone': {
      if (!state.hero) return state
      const { id, url, slot } = state.hero
      const tiles = [...state.tiles]
      tiles[slot] = { id, url, placedAt: action.now }
      return { ...state, tiles, hero: null, lastPlacedId: id }
    }

    default:
      return state
  }
}
