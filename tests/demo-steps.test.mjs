import test from 'node:test'
import assert from 'node:assert/strict'
import { createStepper } from '../js/demo-steps.js'

// deterministic fake timers
function fakeTimers() {
  const q = []
  return {
    timer: (fn, ms) => { const h = { fn, ms }; q.push(h); return h },
    clear: (h) => { const i = q.indexOf(h); if (i >= 0) q.splice(i, 1) },
    fire: () => { const h = q.shift(); h?.fn() },
    pending: () => q.length,
  }
}

test('go clamps, reports each move, and autoplay advances after dwell', () => {
  const ft = fakeTimers(), seen = []
  const s = createStepper({ count: 3, onGo: (i) => seen.push(i), dwell: () => 100, timer: ft.timer, clear: ft.clear })
  s.play(); s.go(0, 'auto')
  assert.deepEqual(seen, [0]); assert.equal(ft.pending(), 1)
  ft.fire(); assert.deepEqual(seen, [0, 1])
  ft.fire(); assert.deepEqual(seen, [0, 1, 2])
  assert.equal(ft.pending(), 0)                       // nothing armed past the last step
  s.go(9); assert.equal(s.index, 2)                   // clamped
  s.go(-4); assert.equal(s.index, 0)
})

test('a user move stops autoplay; play resumes it; pause stops it', () => {
  const ft = fakeTimers(), autos = []
  const s = createStepper({ count: 4, onGo: () => {}, onAutoChange: (a) => autos.push(a), dwell: () => 50, timer: ft.timer, clear: ft.clear })
  s.play(); s.go(0, 'auto'); assert.equal(s.auto, true)
  s.next(); assert.equal(s.auto, false); assert.equal(ft.pending(), 0); assert.equal(s.index, 1)
  s.play(); assert.equal(s.auto, true); assert.equal(ft.pending(), 1)
  s.pause(); assert.equal(s.auto, false); assert.equal(ft.pending(), 0)
  assert.deepEqual(autos, [true, false, true, false])
})

test('prev/next move by one; dispose clears the pending timer', () => {
  const ft = fakeTimers()
  const s = createStepper({ count: 3, onGo: () => {}, dwell: () => 10, timer: ft.timer, clear: ft.clear })
  s.go(1); s.next(); assert.equal(s.index, 2); s.prev(); assert.equal(s.index, 1)
  s.play(); assert.equal(ft.pending(), 1); s.dispose(); assert.equal(ft.pending(), 0)
})
