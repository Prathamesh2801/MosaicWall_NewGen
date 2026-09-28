// Dev-only bridge between a /capture tab and a /wall tab in the same browser (no backend needed).
const CHANNEL = 'mosaicwall-mock'

export function publishMockPhoto(blob) {
  const channel = new BroadcastChannel(CHANNEL)
  // crypto.randomUUID is unavailable on plain-http LAN origins (phones), so keep ids simple.
  const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`
  channel.postMessage({ id, blob })
  channel.close()
  return id
}

export function subscribeMockPhotos(onPhoto) {
  const channel = new BroadcastChannel(CHANNEL)
  channel.onmessage = (event) => onPhoto(event.data)
  return () => channel.close()
}
