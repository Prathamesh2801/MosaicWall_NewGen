# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Event photo mosaic. Guests shoot a photo on their phone (`/#/capture`), it's uploaded to a PHP backend (`sse.php`), and a 6ft × 4ft (3:2) LED wall (`/#/wall`) receives it over SSE and animates it into a 15×10 grid that gradually reveals a background artwork. React 19 + Vite 8 + Tailwind 4 + framer-motion, plain JS (no TypeScript).

## Commands

```bash
npm run dev      # Vite dev server, exposed on LAN (phones hit /#/capture)
npm run build    # dist/ is dropped into the same folder as sse.php (relative base + hash routing)
npm run lint     # oxlint (.oxlintrc.json)
npm test         # node --test over src/**/*.test.js
node --test src/features/wall/utils/wallReducer.test.js   # single test file
node --test --test-name-pattern="pickSlot" src/features/wall/utils/wallReducer.test.js   # single test
```

Tests run under plain Node, not Vite — test targets must not import config files, assets, or anything using `import.meta.env`. That's why `wallReducer.js` is kept pure and takes grid size / blocked slots as arguments.

## Configuration

No `.env`. Everything is in plain JS and requires a rebuild:
- `src/config/app.js` — `apiUrl` (full URL to `sse.php`, the single source of truth, called directly in dev and prod; the server sends CORS headers) and `useMock`.
- `src/config/wall.js` — grid size, artwork, tile opacity, reveal timings (`normal` / `fast` + `fastQueueThreshold`), localStorage keys, and `BRAND` (frame colour, `headerHeight`, `bottomBorder`, `logoAlign`).

## Architecture

Feature folders under `src/features/{capture,wall}` with `components/ hooks/ services/ utils/` and an `index.js` barrel; `src/pages/*` compose them; `src/routes/index.jsx` is a `createHashRouter` (`/` → `/capture`).

**Backend** (`server/sse.php` + `.htaccess`, deployed by hand next to `data.json` and `uploads/`; not part of the build): `POST sse.php` multipart field `image` → `201 { success, data: { id, url } }` or `4xx/5xx { error }` (the `error` string is shown to the user; file type comes from the content, not the filename). `GET sse.php` is an SSE stream of `event: image` / `data: { id, url }`. Each image is delivered **exactly once** — run a single wall; the server never resends. Only the newest SSE connection delivers (`sse_owner.txt`): dropped clients' PHP loops can outlive the socket and used to swallow images, now they exit once a newer connection claims ownership.

**Capture flow:** `CaptureFlow` (camera → preview → done) → `useUpload` (idle → compressing → uploading → queued | error) → `compressImage` (falls back to the original file if the browser can't decode it, e.g. HEIC) → `uploadPhoto` (axios).

**Wall flow:**
- `useWallStream` picks `connectWallStream` (EventSource with manual retry once CLOSED) or `connectMockStream`; both share the `{ onTile, onStatus }` interface and dispatch `enqueue`.
- `utils/wallReducer.js` is the pure state machine: `tiles` (fixed-length array, `null | { id, url, placedAt }`), `queue`, `hero` (photo on stage + target slot). The wall chooses the slot itself (`pickSlot`: random empty cell, else oldest tile). Enqueue dedupes by id.
- `useWallState` drives the reveal loop: when no hero and the queue is non-empty, preload the image + wait `gapMs` → `revealStart`; `HeroReveal` animates assemble → hold → fly into cell, then calls `land()` → `revealDone`. Timing switches to `WALL.fast` once the backlog hits `fastQueueThreshold`.
- Persistence: every state change is saved to `localStorage` (`toSavedWall` puts an in-flight hero back at the front of the queue); `restoreWallState` drops malformed entries, `blob:` URLs and grid-size mismatches. A hard-reload keystroke (Ctrl/Cmd+Shift+R, Ctrl/Shift+F5) wipes storage first — that's the intended "blank wall" reset. All localStorage access is wrapped in try/catch.
- Layout is percentage-based from grid maths (no DOM measuring); `HeroReveal` lands via transform-only animation for smoothness on TV browsers. `BrandFrame` puts the logo in a top header band (`logoAlign` left/center/right) and scales the wall uniformly (keeps the cols:rows shape, square cells) into the rest, centred; side borders end up wider than the bottom one (unavoidable when the wall and its box share a shape). `WallPage` sizes the box from `WALL.cols / WALL.rows`, so the grid config alone sets the screen ratio.

**Mock mode** (`useMock: true`): capture and wall talk over a `BroadcastChannel` (`src/services/mockChannel.js`) — open both routes in the same browser. On the wall, `M` adds a demo photo, `B` a burst of 12. `H` toggles the status pill (remembered per browser, works in both modes). `A` (both modes) autofills every empty cell with copies of the placed photos (`autofillTiles`: `copy: true`, `placedAt: 0`, so later real photos replace copies first); copies persist like any tile.

## Conventions

- Avoid `crypto.randomUUID` — phones load the dev server over plain-http LAN where it's unavailable.
- `ponytail:` comments mark deliberate simplifications with a known ceiling.
