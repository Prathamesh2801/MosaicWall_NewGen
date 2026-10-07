import { useEffect, useState } from 'react'
import { WALL } from '../../../config/wall'

function readOpacity() {
  try {
    const raw = localStorage.getItem(WALL.opacityKey)
    if (raw === null) return WALL.tileOpacity
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : WALL.tileOpacity
  } catch {
    return WALL.tileOpacity
  }
}

// Live opacity of every settled photo, driven by the operator's control panel. Starts from the saved
// value (or WALL.tileOpacity) and is remembered per browser so it survives reloads during an event.
export function useTileOpacity() {
  const [opacity, setOpacity] = useState(readOpacity)

  useEffect(() => {
    try {
      localStorage.setItem(WALL.opacityKey, String(opacity))
    } catch {
      // Storage unavailable: the slider still works for this session.
    }
  }, [opacity])

  return [opacity, setOpacity]
}
