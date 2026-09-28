// App settings: edit here and rebuild before uploading dist/ to cPanel.
export const APP = {
  // The PHP endpoint: POST uploads a photo, GET is the SSE stream.
  // Dev goes through the Vite proxy (vite.config.js) because the server sends no CORS headers.
  // Production assumes dist/ is uploaded into the same folder as sse.php; otherwise put the full URL here
  // (and the server must then send Access-Control-Allow-Origin).
  apiUrl: import.meta.env.DEV ? '/api/sse.php' : './sse.php',
  // true = no backend: capture tab broadcasts to wall tab (same browser), wall keys M / B add demo photos.
  useMock: false,
}
