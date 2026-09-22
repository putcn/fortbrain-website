import test from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, HOLD, progressToStage, blend, LAYERS_STAGE } from '../js/story.js'

test('there are 10 stages: hero 1 screen, thesis 2, layers 3, six chapters 1.5 each, finale 2', () => {
  assert.equal(STAGES.length, 10)
  assert.deepEqual(STAGES, [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2])
  assert.equal(STAGES[LAYERS_STAGE], 3)
  assert.equal(STAGES.reduce((a, b) => a + b, 0), 17)
})

test('progressToStage follows the DOM: p spans (total − 1) screens of scroll', () => {
  assert.deepEqual(progressToStage(0), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(1), { k: 9, u: 1 })
  const scrollable = STAGES.reduce((a, b) => a + b, 0) - 1   // 16 screens
  const at = (screens) => progressToStage(screens / scrollable)
  // section tops: 0, 1, 3, 6, 7.5, 9, 10.5, 12, 13.5, 15 screens
  const h0 = at(0.5); assert.equal(h0.k, 0); assert.ok(Math.abs(h0.u - 0.5) < 1e-9)
  const s1 = at(1); assert.equal(s1.k, 1); assert.ok(Math.abs(s1.u) < 1e-9)
  const s2 = at(3); assert.equal(s2.k, 2); assert.ok(Math.abs(s2.u) < 1e-9)
  const m2 = at(4.5); assert.equal(m2.k, 2); assert.ok(Math.abs(m2.u - 0.5) < 1e-9)
  const s3 = at(6 + 1e-9); assert.equal(s3.k, 3)
  const h3 = at(6.75); assert.equal(h3.k, 3); assert.ok(Math.abs(h3.u - 0.5) < 1e-9)   // half of a 1.5-screen chapter
  const s7 = at(12); assert.equal(s7.k, 7); assert.ok(Math.abs(s7.u) < 1e-9)           // hybrid chapter
  const s8 = at(13.5); assert.equal(s8.k, 8); assert.ok(Math.abs(s8.u) < 1e-9)
  // finale: its top reaches the viewport at 15 screens, and the one remaining screen is u 0→1
  const s9 = at(15); assert.equal(s9.k, 9); assert.ok(Math.abs(s9.u) < 1e-9)
  const m9 = at(15.5); assert.equal(m9.k, 9); assert.ok(Math.abs(m9.u - 0.5) < 1e-9)
  assert.deepEqual(progressToStage(-1), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(2), { k: 9, u: 1 })
})

test('blend holds the stage until half way, then eases to the next stage', () => {
  assert.deepEqual(blend(1, 0.2), { a: 1, b: 2, t: 0 })
  // the hero holds only a fifth of its (single) screen: a small scroll already moves the camera
  assert.equal(HOLD[0], 0.2)
  assert.deepEqual(blend(0, 0.2), { a: 0, b: 1, t: 0 })
  const hero = blend(0, 0.6); assert.equal(hero.a, 0); assert.equal(hero.b, 1); assert.ok(hero.t > 0.49 && hero.t < 0.51)
  assert.deepEqual(blend(0, 1), { a: 0, b: 1, t: 1 })
  assert.deepEqual(blend(1, 0.5), { a: 1, b: 2, t: 0 })
  const mid = blend(1, 0.75); assert.equal(mid.a, 1); assert.equal(mid.b, 2); assert.ok(mid.t > 0.49 && mid.t < 0.51)
  assert.deepEqual(blend(1, 1), { a: 1, b: 2, t: 1 })
  assert.deepEqual(blend(9, 0.9), { a: 9, b: 9, t: 1 })
  let prev = -1
  for (let u = 0; u <= 1; u += 0.05) { const { t } = blend(3, u); assert.ok(t >= prev); prev = t }
})
