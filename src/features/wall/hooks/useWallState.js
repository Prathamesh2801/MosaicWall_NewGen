import { useCallback, useEffect, useReducer, useRef } from 'react'
import { WALL } from '../../../config/wall'
import { restoreWallState, toSavedWall, wallReducer } from '../utils/wallReducer'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Resolves once the photo is decoded (or failed / timed out), so a reveal never starts on a blank image.
function preloadImage(url, timeoutMs = 8000) {
  const img = new Image()
  img.src = url
  return Promise.race([img.decode().catch(() => {}), wait(timeoutMs)])
}

const TOTAL = WALL.cols * WALL.rows

// localStorage can throw (private mode, quota, blocked storage); the wall must still run without it.
function loadWall() {
  try {
    return restoreWallState(JSON.parse(localStorage.getItem(WALL.storageKey)), TOTAL)
  } catch {
    return restoreWallState(null, TOTAL)
  }
}

// Hard-reload shortcuts: Ctrl/Cmd+Shift+R, Ctrl+F5, Shift+F5.
const isHardReload = (e) =>
  ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') ||
  (e.key === 'F5' && (e.ctrlKey || e.shiftKey))

// Owns the wall state and the reveal queue: gap + preload → hero on stage → HeroReveal calls land().
// Every change is saved, so an accidental (normal) reload restores the same tiles in the same cells.
// A hard reload is the intentional reset: saved data is wiped and the page reloads blank.
export function useWallState() {
  const [state, dispatch] = useReducer(wallReducer, null, loadWall)
  const timing = state.queue.length >= WALL.fastQueueThreshold ? WALL.fast : WALL.normal
  const next = state.queue[0]
  const heroId = state.hero?.id
  const resetting = useRef(false)

  useEffect(() => {
    if (resetting.current) return // a reveal finishing mid-reload must not re-save the old wall
    try {
      localStorage.setItem(WALL.storageKey, JSON.stringify(toSavedWall(state)))
    } catch {
      // Storage unavailable: keep running, the wall just won't survive a reload.
    }
  }, [state])

  useEffect(() => {
    const onKeyDown = (event) => {
      // A: fill the remaining empty cells with copies of the photos already on the wall.
      if (event.key.toLowerCase() === 'a' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        dispatch({ type: 'autofill' })
        return
      }
      if (!isHardReload(event)) return
      resetting.current = true
      try {
        localStorage.removeItem(WALL.storageKey)
      } catch {
        // Nothing saved to clear.
      }
      // The browser performs the reload itself; nothing to prevent.
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (heroId || !next) return
    let cancelled = false
    Promise.all([preloadImage(next.url), wait(timing.gapMs)]).then(() => {
      if (!cancelled) dispatch({ type: 'revealStart' })
    })
    return () => {
      cancelled = true
    }
  }, [heroId, next, timing.gapMs])

  const land = useCallback(() => dispatch({ type: 'revealDone', now: Date.now() }), [])

  return { state, dispatch, timing, land }
}
