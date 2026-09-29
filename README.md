# MosaicWall

Guests take a photo on their phone → it queues on the server → a 16:9 TV animates it into a 16×9 (144-tile) photo mosaic that reveals a background image.

| Route | Device |
|---|---|
| `/#/capture` | phone: native camera, compress, upload |
| `/#/wall` | TV: live mosaic (double-click = fullscreen) |

## Run

```bash
npm install
npm run dev              # also serves on your LAN IP for phones
npm test                 # wall reducer self-check
npm run build            # upload dist/ to any cPanel folder (relative base + hash routes)
```


Settings live in plain JS (no `.env`) in `src/config/app.js`: `apiUrl` (the backend URL, its only home) and `useMock`.
Wall look and timing (grid, photo opacity, background artwork) live in `src/config/wall.js`.

**Mock mode** (`useMock: true`, no backend): open `/#/wall` and `/#/capture` in the same browser. Photos sent from the capture tab animate on the wall. On the wall, `M` adds a demo photo and `B` a burst of 12.

## Backend (PHP, `sse.php`)

Docs: http://192.168.1.88/ministack/Surf_Goa_Mosaic/

```
POST sse.php   multipart field: image  (jpg/jpeg/png/gif/webp)
  → 201 { "success": true, "data": { "id": "...", "url": "...", "sse_status": false } }
  → 4xx/5xx { "error": "shown to the user" }

GET  sse.php   text/event-stream
  event: image
  data: { "id": "...", "url": "..." }
  : keep-alive
```

- The app calls `apiUrl` directly in dev and production; the server sends `Access-Control-Allow-Origin: *`.
- **Each image is delivered once**, to one connection. Run a single wall, and note that refreshing it starts with an empty mosaic.
- The wall picks each photo's cell itself: a random empty cell, or the oldest photo once all 144 are full.
- **Reload-safe wall:** placed photos (same cells) and the waiting queue are saved in the TV browser's `localStorage`, so a normal reload (F5 / Ctrl+R) restores them. **Blank slate:** hard reload on `/#/wall` with Ctrl+Shift+R (Cmd+Shift+R on Mac), Ctrl+F5 or Shift+F5 wipes the saved wall first. Clearing the browser's site data does the same.
- **Status pill:** press `H` on `/#/wall` to hide/show the bottom-right status (connection, count, queue). The choice is remembered in that browser, so hide it after the test run and it stays hidden for the event.
- **Brand:** `BRAND` in `src/config/wall.js`. The wall is scaled down by `frameScale` (stays 16:9, square cells, all 144 cells and the whole artwork visible) inside a `color` frame: equal border on top, bottom and one side, and the spare width becomes a band on `logoSide` holding the logo (`src/assets/brand-logo.png`). Lower `frameScale` = wider logo band (0.88 ≈ 165px on 1080p). `enabled: false` = plain full-screen wall.
