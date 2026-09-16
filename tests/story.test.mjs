import test from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, progressToStage, blend, LAYERS_STAGE } from '../js/story.js'

test('there are 10 stages; the layers stage and the finale are double height', () => {
  assert.equal(STAGES.length, 10)
  assert.equal(STAGES[LAYERS_STAGE], 2)
  assert.equal(STAGES[9], 2)
  assert.ok(STAGES.every((w, i) => i === LAYERS_STAGE || i === 9 ? w === 2 : w === 1))
})

test('progressToStage follows the DOM: p spans (total − 1) screens of scroll', () => {
  assert.deepEqual(progressToStage(0), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(1), { k: 9, u: 1 })
  const scrollable = STAGES.reduce((a, b) => a + b, 0) - 1   // 11 screens
  const at = (screens) => progressToStage(screens / scrollable)
  // exactly at the start of stage 2 (section tops: 0,1,2,4,5,6,7,8,9,10 screens)
  const s2 = at(2); assert.equal(s2.k, 2); assert.ok(Math.abs(s2.u) < 1e-9)
  const m2 = at(3); assert.equal(m2.k, 2); assert.ok(Math.abs(m2.u - 0.5) < 1e-9)
  const s3 = at(4 + 1e-9); assert.equal(s3.k, 3)
  const s8 = at(9.5); assert.equal(s8.k, 8); assert.ok(Math.abs(s8.u - 0.5) < 1e-9)
  // finale: its top reaches the viewport at 10 screens, and the one remaining screen is u 0→1
  const s9 = at(10); assert.equal(s9.k, 9); assert.ok(Math.abs(s9.u) < 1e-9)
  const m9 = at(10.5); assert.equal(m9.k, 9); assert.ok(Math.abs(m9.u - 0.5) < 1e-9)
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
