import { useEffect } from 'react'

// Keeps the TV from dimming/sleeping. Needs HTTPS (or localhost); silently no-ops otherwise.
export function useWakeLock() {
  useEffect(() => {
    let lock
    const request = () =>
      navigator.wakeLock
        ?.request('screen')
        .then((l) => (lock = l))
        .catch(() => {})
    // The lock is released whenever the tab is hidden, so re-acquire on return.
    const onVisible = () => document.visibilityState === 'visible' && request()

    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [])
}
