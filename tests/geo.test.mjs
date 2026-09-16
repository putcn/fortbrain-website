import test from 'node:test'
import assert from 'node:assert/strict'
import { makeProjector, spread, pointInRing, placeStores, lcg, pickFeatured, ringArea, segmentPositions } from '../js/geo.js'

test('projector maps the center to the origin, east is +x, north is -z', () => {
  const { P } = makeProjector([117.18, 34.26])
  assert.deepEqual(P(117.18, 34.26), [0, 0])
  const [x, z] = P(117.28, 34.36)
  assert.ok(x > 0 && z < 0)
})

test('spread scales offsets from the center', () => {
  const sp = spread([100, 30], 2)
  assert.deepEqual(sp(101, 31), [102, 32])
})

test('pointInRing', () => {
  const sq = [[0, 0], [10, 0], [10, 10], [0, 10]]
  assert.equal(pointInRing(5, 5, sq), true)
  assert.equal(pointInRing(15, 5, sq), false)
})

test('ringArea and segmentPositions', () => {
  assert.equal(ringArea([[0, 0], [10, 0], [10, 10], [0, 10]]), 100)
  assert.deepEqual(segmentPositions([[[0, 0], [1, 0], [1, 1]]], 0.5), [0, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 1])
})

test('placeStores never overlaps: every pair at least 0.8 cellH apart', () => {
  const rnd = lcg(7)
  const stores = Array.from({ length: 20 }, (_, i) => ({ id: i, px: (rnd() - 0.5) * 20, pz: (rnd() - 0.5) * 20, w: rnd() }))
  placeStores(stores, { onMap: () => true, cellW: 31, cellH: 10.8, rnd: lcg(97) })
  for (let i = 0; i < stores.length; i++) for (let j = i + 1; j < stores.length; j++) {
    const d = Math.hypot(stores[i].x - stores[j].x, stores[i].z - stores[j].z)
    assert.ok(d >= 10.8 * 0.8, `stores ${i},${j} too close: ${d}`)
  }
})

test('placeStores is deterministic for a given seed', () => {
  const mk = () => Array.from({ length: 6 }, (_, i) => ({ px: i * 3, pz: -i * 2, w: 6 - i }))
  const a = placeStores(mk(), { onMap: () => true, cellW: 31, cellH: 10.8, rnd: lcg(5) })
  const b = placeStores(mk(), { onMap: () => true, cellW: 31, cellH: 10.8, rnd: lcg(5) })
  assert.deepEqual(a.map((s) => [s.x, s.z]), b.map((s) => [s.x, s.z]))
})

test('pickFeatured returns n stores that are more spread out than a random pick', () => {
  const rnd = lcg(11)
  const stores = Array.from({ length: 22 }, (_, i) => ({ id: i, x: (rnd() - 0.5) * 200, z: (rnd() - 0.5) * 120 }))
  const picked = pickFeatured(stores, 7)
  assert.equal(picked.length, 7)
  assert.equal(new Set(picked).size, 7)
  const minDist = (arr) => { let m = Infinity; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) m = Math.min(m, Math.hypot(arr[i].x - arr[j].x, arr[i].z - arr[j].z)); return m }
  assert.ok(minDist(picked) > minDist(stores.slice(0, 7)))
  // first pick is the store nearest the centroid
  const cx = stores.reduce((a, s) => a + s.x, 0) / stores.length, cz = stores.reduce((a, s) => a + s.z, 0) / stores.length
  const nearest = [...stores].sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz))[0]
  assert.equal(picked[0], nearest)
})
