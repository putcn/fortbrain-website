import test from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, progressToStage, blend, LAYERS_STAGE } from '../js/story.js'

test('there are 10 stages; every stage is pinned for a screen, the layers stage for two', () => {
  assert.equal(STAGES.length, 10)
  assert.equal(STAGES[LAYERS_STAGE], 3)
  assert.ok(STAGES.every((w, i) => i === LAYERS_STAGE ? w === 3 : w === 2))
})

test('progressToStage follows the DOM: p spans (total − 1) screens of scroll', () => {
  assert.deepEqual(progressToStage(0), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(1), { k: 9, u: 1 })
  const scrollable = STAGES.reduce((a, b) => a + b, 0) - 1   // 20 screens
  const at = (screens) => progressToStage(screens / scrollable)
  // section tops: 0,2,4,7,9,11,13,15,17,19 screens
  const s2 = at(4); assert.equal(s2.k, 2); assert.ok(Math.abs(s2.u) < 1e-9)
  const m2 = at(5.5); assert.equal(m2.k, 2); assert.ok(Math.abs(m2.u - 0.5) < 1e-9)
  const s3 = at(7 + 1e-9); assert.equal(s3.k, 3)
  const h3 = at(8); assert.equal(h3.k, 3); assert.ok(Math.abs(h3.u - 0.5) < 1e-9)   // still pinned, camera holds
  const s8 = at(18); assert.equal(s8.k, 8); assert.ok(Math.abs(s8.u - 0.5) < 1e-9)
  // finale: its top reaches the viewport at 19 screens, and the one remaining screen is u 0→1
  const s9 = at(19); assert.equal(s9.k, 9); assert.ok(Math.abs(s9.u) < 1e-9)
  const m9 = at(19.5); assert.equal(m9.k, 9); assert.ok(Math.abs(m9.u - 0.5) < 1e-9)
  assert.deepEqual(progressToStage(-1), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(2), { k: 9, u: 1 })
})

test('blend holds the stage until half way, then eases to the next stage', () => {
  assert.deepEqual(blend(1, 0.2), { a: 1, b: 2, t: 0 })
  assert.deepEqual(blend(1, 0.5), { a: 1, b: 2, t: 0 })
  const mid = blend(1, 0.75); assert.equal(mid.a, 1); assert.equal(mid.b, 2); assert.ok(mid.t > 0.49 && mid.t < 0.51)
  assert.deepEqual(blend(1, 1), { a: 1, b: 2, t: 1 })
  assert.deepEqual(blend(9, 0.9), { a: 9, b: 9, t: 1 })
  let prev = -1
  for (let u = 0; u <= 1; u += 0.05) { const { t } = blend(3, u); assert.ok(t >= prev); prev = t }
})
