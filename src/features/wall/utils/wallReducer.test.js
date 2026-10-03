import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWallState, pickSlot, restoreWallState, toSavedWall, wallReducer } from './wallReducer.js'

const tile = (id, placedAt = 0) => ({ id, url: `${id}.jpg`, placedAt })

test('pickSlot prefers empty cells, then the oldest tile', () => {
  assert.equal(pickSlot([tile('a'), null, tile('b')]), 1)
  assert.equal(pickSlot([tile('a', 5), tile('b', 2), tile('c', 9)]), 1)
})

test('enqueue ignores ids already queued, on stage, or placed', () => {
  let s = createWallState(4)
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'x', url: 'x.jpg' } })
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'x', url: 'x.jpg' } })
  assert.equal(s.queue.length, 1)

  s = wallReducer(s, { type: 'revealStart' })
  assert.equal(wallReducer(s, { type: 'enqueue', tile: { id: 'x' } }), s)
})

test('reveal plays one photo at a time and fills distinct cells', () => {
  let s = createWallState(2)
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'a', url: 'a.jpg' } })
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'b', url: 'b.jpg' } })

  s = wallReducer(s, { type: 'revealStart' })
  assert.equal(s.hero.id, 'a')
  assert.equal(wallReducer(s, { type: 'revealStart' }), s, 'second start is a no-op while a hero is showing')

  const firstSlot = s.hero.slot
  s = wallReducer(s, { type: 'revealDone', now: 1 })
  assert.equal(s.hero, null)
  assert.equal(s.tiles[firstSlot].id, 'a')
  assert.equal(s.lastPlacedId, 'a')

  s = wallReducer(s, { type: 'revealStart' })
  assert.notEqual(s.hero.slot, firstSlot, 'next photo goes to the remaining empty cell')
})

test('save → restore keeps tiles in the same slots and re-queues the on-stage photo', () => {
  let s = createWallState(3)
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'a', url: 'a.jpg' } })
  s = wallReducer(s, { type: 'enqueue', tile: { id: 'b', url: 'b.jpg' } })
  s = wallReducer(s, { type: 'revealStart' })
  s = wallReducer(s, { type: 'revealDone', now: 7 })
  s = wallReducer(s, { type: 'revealStart' }) // 'b' is on stage when the page reloads

  const restored = restoreWallState(JSON.parse(JSON.stringify(toSavedWall(s))), 3)
  assert.deepEqual(restored.tiles, s.tiles)
  assert.deepEqual(restored.queue, [{ id: 'b', url: 'b.jpg' }])
  assert.equal(restored.hero, null)
})

test('restore ignores missing, malformed, resized or blob: data', () => {
  assert.deepEqual(restoreWallState(null, 2), createWallState(2))
  assert.deepEqual(restoreWallState({ tiles: [null] }, 2), createWallState(2))
  const r = restoreWallState({ tiles: [tile('a'), { id: 'x', url: 'blob:dead' }], queue: [{ url: 1 }] }, 2)
  assert.equal(r.tiles[0].id, 'a')
  assert.equal(r.tiles[1], null)
  assert.deepEqual(r.queue, [])
})

test('autofill copies placed photos into every empty cell except the hero target', () => {
  let s = createWallState(6)
  s.tiles[0] = tile('a', 5)
  s.tiles[3] = tile('b', 7)
  s.hero = { id: 'h', url: 'h.jpg', slot: 1 }
  s = wallReducer(s, { type: 'autofill' })

  assert.equal(s.tiles[1], null, 'hero target stays free')
  const copies = s.tiles.filter((t) => t?.copy)
  assert.equal(copies.length, 3)
  assert.equal(new Set(s.tiles.filter(Boolean).map((t) => t.id)).size, 5, 'ids stay unique')
  assert.ok(copies.every((t) => ['a.jpg', 'b.jpg'].includes(t.url) && t.placedAt === 0))
  assert.equal(pickSlot(s.tiles.map((t) => t ?? tile('z', 9))), s.tiles.findIndex((t) => t?.copy), 'copies get replaced first')

  const empty = createWallState(3)
  assert.equal(wallReducer(empty, { type: 'autofill' }), empty, 'nothing placed = no-op')
})
