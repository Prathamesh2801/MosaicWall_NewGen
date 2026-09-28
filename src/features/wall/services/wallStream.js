import { APP } from '../../../config/app'

const RETRY_MS = 5000

// GET sse.php → `event: image`, `data: { id, url }`, one event per upload, delivered exactly once
// across all connected walls (the server flips sse_status on send).
export function connectWallStream({ onTile, onStatus }) {
  let source
  let retryTimer

  const open = () => {
    onStatus('connecting')
    source = new EventSource(APP.apiUrl)
    source.onopen = () => onStatus('live')
    source.onerror = () => {
      // EventSource retries network drops by itself; it only gives up (CLOSED) on bad responses.
      if (source.readyState !== EventSource.CLOSED) return onStatus('connecting')
      onStatus('offline')
      retryTimer = setTimeout(open, RETRY_MS)
    }
    source.addEventListener('image', (event) => {
      const { id, url } = JSON.parse(event.data)
      onTile({ id, url })
    })
  }

  open()
  return () => {
    clearTimeout(retryTimer)
    source.close()
  }
}
