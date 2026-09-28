import { useEffect, useState } from 'react'
import { WALL } from '../../../config/wall'

function readVisible() {
  try {
    return localStorage.getItem(WALL.statusKey) !== 'hidden'
  } catch {
    return true
  }
}

// H toggles the status pill (connection / fill count / queue). Remembered in this browser, so a
// hidden pill stays hidden through reloads during the event; hard reload doesn't reset it.
export function useStatusVisible() {
  const [visible, setVisible] = useState(readVisible)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() !== 'h' || event.ctrlKey || event.metaKey || event.altKey) return
      setVisible((v) => !v)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(WALL.statusKey, visible ? 'shown' : 'hidden')
    } catch {
      // Storage unavailable: the toggle still works for this session.
    }
  }, [visible])

  return visible
}
