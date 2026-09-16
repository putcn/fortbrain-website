import test from 'node:test'
import assert from 'node:assert/strict'
import { TEXTS, detectLang, applyLang } from '../js/i18n.js'

const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => typeof v === 'object' ? flat(v, p + k + '.') : [p + k])

test('zh and en tables have exactly the same keys', () => {
  assert.deepEqual(flat(TEXTS.zh).sort(), flat(TEXTS.en).sort())
})

test('no customer names leak into the copy', () => {
  const all = JSON.stringify(TEXTS)
  for (const bad of ['徐州', '蟠桃', '博物馆', '户部山', '云北', '泉韵', '商贸湖', '楚都']) assert.ok(!all.includes(bad), bad)
})

test('detectLang picks zh for zh-*, en otherwise, and honors a stored choice', () => {
  assert.equal(detectLang({ navigator: { language: 'zh-CN' }, stored: null }), 'zh')
  assert.equal(detectLang({ navigator: { language: 'en-US' }, stored: null }), 'en')
  assert.equal(detectLang({ navigator: { language: 'zh-CN' }, stored: 'en' }), 'en')
  assert.equal(detectLang({ navigator: { language: 'fr' }, stored: 'nonsense' }), 'en')
})

test('applyLang writes data-i18n targets and html lang', () => {
  const nodes = [{ getAttribute: () => 'q', innerHTML: '' }, { getAttribute: () => 'p1.title', innerHTML: '' }]
  const root = { querySelectorAll: () => nodes, documentElement: { lang: '' } }
  const store = {}
  applyLang('en', { root, storage: { setItem: (k, v) => { store[k] = v } } })
  assert.equal(nodes[0].innerHTML, TEXTS.en.q)
  assert.equal(nodes[1].innerHTML, TEXTS.en.p1.title)
  assert.equal(root.documentElement.lang, 'en')
  assert.equal(store.lang, 'en')
})
