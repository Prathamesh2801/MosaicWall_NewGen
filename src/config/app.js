// App settings: edit here and rebuild before uploading dist/ to cPanel.
export const APP = {
  // THE backend URL, the only place it lives. POST uploads a photo, GET is the SSE stream.
  // Called directly in dev and prod; the server sends Access-Control-Allow-Origin.
  apiUrl: 'https://mosaic.theeventpics.com/API/sse.php',
  // true = no backend: capture tab broadcasts to wall tab (same browser), wall keys M / B add demo photos.
  useMock: false,
}
