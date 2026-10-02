import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, existsSync, rmSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SCRIPT = new URL('../scripts/build-site.py', import.meta.url).pathname
const FIX = new URL('./fixtures/site', import.meta.url).pathname
const BAD = new URL('./fixtures/site-bad', import.meta.url).pathname
const run = (args) => spawnSync('python3', [SCRIPT, ...args], { encoding: 'utf8' })

test('builds blog pages, posts.json and the concepts index from the fixture', () => {
  const out = mkdtempSync(join(tmpdir(), 'fb-site-'))
  try {
    const r = run(['--root', FIX, '--out', out])
    assert.equal(r.status, 0, r.stderr)
    for (const f of ['blogs/index.html', 'blogs/first/index.html', 'blogs/second/index.html', 'blogs/posts.json', 'concepts/index.html']) assert.ok(existsSync(join(out, f)), f)
    const posts = JSON.parse(readFileSync(join(out, 'blogs/posts.json'), 'utf8'))
    assert.deepEqual(posts.map((p) => p.slug), ['first', 'second'])                 // newest first
    assert.deepEqual(posts[0], { slug: 'first', date: '2026-10-01', tags: ['tech'], title: { zh: '第一篇', en: 'First post' }, summary: { zh: '第一篇摘要', en: 'First summary' }, url: '/blogs/first/', hasEn: true })
    assert.equal(posts[1].hasEn, false)
    const first = readFileSync(join(out, 'blogs/first/index.html'), 'utf8')
    assert.ok(first.includes('lang="zh-CN"') && first.includes('lang="en"'), 'both languages embedded')
    assert.ok(first.includes('<strong>加粗</strong>') && first.includes('<strong>bold</strong>'))
    assert.ok(first.includes('href="/concepts/alpha.html"'), 'concept link')
    assert.ok(first.includes('href="/blogs/second/"'), 'next/prev link')
    const second = readFileSync(join(out, 'blogs/second/index.html'), 'utf8')
    assert.ok(second.includes('This post is in Chinese only'))
    const idx = readFileSync(join(out, 'concepts/index.html'), 'utf8')
    assert.ok(idx.includes('data-src="alpha.html?preview=1"'), 'live preview src')
    assert.ok(!idx.includes('data-src="beta.html'), 'non-live concept has no preview src')
    assert.ok(idx.indexOf('甲概念') < idx.indexOf('乙概念'), 'final group before lab group')
    // idempotent
    const r2 = run(['--root', FIX, '--out', out]); assert.equal(r2.status, 0)
    assert.equal(readFileSync(join(out, 'blogs/first/index.html'), 'utf8'), first)
  } finally { rmSync(out, { recursive: true, force: true }) }
})

test('--check rejects bad front matter and names the file', () => {
  const r = run(['--root', BAD, '--check'])
  assert.equal(r.status, 1)
  assert.match(r.stderr, /bad\/zh\.md/)
  assert.match(r.stderr, /date/); assert.match(r.stderr, /tags/); assert.match(r.stderr, /concept/)
})

test('--check passes on the good fixture and rejects a concept whose file is missing', () => {
  assert.equal(run(['--root', FIX, '--check']).status, 0)
  const copy = mkdtempSync(join(tmpdir(), 'fb-site-'))
  try {
    cpSync(FIX, copy, { recursive: true })
    rmSync(join(copy, 'concepts/beta.html'))
    const r = run(['--root', copy, '--check'])
    assert.equal(r.status, 1)
    assert.match(r.stderr, /beta\.html/)
  } finally { rmSync(copy, { recursive: true, force: true }) }
})
