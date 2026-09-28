// Pure wall state. No config/asset imports so it runs under `node --test`.
//
// tiles:   fixed-length array (cols × rows), each null | { id, url, placedAt }
// queue:   photos received but not yet shown, in arrival order
// hero:    the photo currently on centre stage, with its target slot

export const createWallState = (total) => ({
  tiles: Array(total).fill(null),
  queue: [],
  hero: null,
  lastPlacedId: null,
})

// What survives a reload: placed tiles in their exact slots, plus everything still waiting.
// The on-stage hero goes back to the front of the queue (the server never re-sends it).
export const toSavedWall = (state) => ({
  tiles: state.tiles,
  queue: state.hero ? [state.hero, ...state.queue] : state.queue,
})

// Rebuilds state from saved data. Anything malformed, from a different grid size, or a mock-mode
// blob: URL (dead after reload) is dropped instead of breaking the wall.
export function restoreWallState(saved, total) {
  const state = createWallState(total)
  if (!Array.isArray(saved?.tiles) || saved.tiles.length !== total) return state

  const usable = (item) => typeof item?.id === 'string' && typeof item.url === 'string' && !item.url.startsWith('blob:')
  state.tiles = saved.tiles.map((tile) => (usable(tile) ? { ...tile, placedAt: Number(tile.placedAt) || 0 } : null))
  state.queue = (Array.isArray(saved.queue) ? saved.queue : []).filter(usable).map(({ id, url }) => ({ id, url }))
  return state
}

// Random empty cell (organic fill), else replace the oldest tile once all are full.
export function pickSlot(tiles, random = Math.random) {
  const empty = []
  tiles.forEach((tile, slot) => !tile && empty.push(slot))
  if (empty.length) return empty[Math.floor(random() * empty.length)]

  let oldest = -1
  tiles.forEach((tile, slot) => {
    if (tile && (oldest < 0 || tile.placedAt < tiles[oldest].placedAt)) oldest = slot
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
      return { ...state, queue, hero: { ...next, slot: pickSlot(state.tiles) } }
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
