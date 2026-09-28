import { subscribeMockPhotos } from '../../../services/mockChannel'

const demoTile = () => {
  const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return { id, url: `https://picsum.photos/seed/${id}/300` }
}

// Same interface as connectWallStream. Sources: a /capture tab in this browser, plus keys
// M = one demo photo, B = burst of 12 (shows the queue speeding up).
export function connectMockStream({ onTile, onStatus }) {
  onStatus('mock')

  // ponytail: object URLs for replaced mock tiles are never revoked; fine for a demo session.
  const unsubscribe = subscribeMockPhotos(({ id, blob }) => onTile({ id, url: URL.createObjectURL(blob) }))

  const onKey = (event) => {
    const key = event.key.toLowerCase()
    if (key === 'm') onTile(demoTile())
    if (key === 'b') for (let i = 0; i < 12; i++) onTile(demoTile())
  }
  window.addEventListener('keydown', onKey)

  return () => {
    unsubscribe()
    window.removeEventListener('keydown', onKey)
  }
}
