import test from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, progressToStage, blend, LAYERS_STAGE } from '../js/story.js'

test('there are 10 stages and the layers stage is double height', () => {
  assert.equal(STAGES.length, 10)
  assert.equal(STAGES[LAYERS_STAGE], 2)
  assert.ok(STAGES.every((w, i) => i === LAYERS_STAGE ? w === 2 : w === 1))
})

test('progressToStage endpoints and weighted boundaries', () => {
  assert.deepEqual(progressToStage(0), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(1), { k: 9, u: 1 })
  const total = STAGES.reduce((a, b) => a + b, 0)
  // exactly at the start of stage 2
  const s2 = progressToStage(2 / total); assert.equal(s2.k, 2); assert.ok(Math.abs(s2.u) < 1e-9)
  // half-way through the double-height stage 2
  const m2 = progressToStage(3 / total); assert.equal(m2.k, 2); assert.ok(Math.abs(m2.u - 0.5) < 1e-9)
  // stage 3 starts after 4 screens
  const s3 = progressToStage(4 / total + 1e-9); assert.equal(s3.k, 3)
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
