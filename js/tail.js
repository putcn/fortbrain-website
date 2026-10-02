/**
 * Homepage tail: the "latest" panel after the finale (latest blog post + latest UX concept, read
 * from the two JSON files the generator and the concepts table produce) and the top-right Blog
 * link that hides as soon as the page scrolls. A failed fetch leaves a dash in that tile and is
 * reported in window.__fb.errors; the rest of the page is unaffected.
 */
import { TEXTS } from './i18n.js'
import { initPreviews } from './preview-loader.js'

export function initTail({ getLang }) {
  const link = document.getElementById('blogLink')
  const onScroll = () => link.classList.toggle('hide', window.scrollY > 40)
  addEventListener('scroll', onScroll, { passive: true }); onScroll()

  const blog = document.querySelector('.tile-blog'), sb = document.querySelector('.tile-sandbox')
  let post = null, concept = null, previews = null
  const L = () => getLang()
  const pick = (o) => (o && (o[L()] || o.zh)) || ''
  function paint() {
    const t = TEXTS[L()].tail
    if (post) {
      blog.querySelector('.chip').textContent = post.tags.map((x) => (L() === 'zh' ? (x === 'tech' ? '技术' : '概念') : (x === 'tech' ? 'Tech' : 'Concept'))).join(' · ')
      const time = blog.querySelector('time'); time.textContent = post.date; time.dateTime = post.date
      blog.querySelector('h3').textContent = pick(post.title)
      blog.querySelector('p').textContent = pick(post.summary) + (L() === 'en' && !post.hasEn ? ` (${t.zhOnly})` : '')
    } else { blog.querySelector('h3').textContent = t.none; blog.querySelector('p').textContent = '' }
    if (concept) {
      sb.querySelector('h3').textContent = pick(concept.title)
      sb.querySelector('p').textContent = pick(concept.summary)
      const pv = sb.querySelector('.pv'); pv.dataset.letter = (concept.title.zh || '').slice(0, 1)
      if (concept.live !== false && !pv.dataset.src) { pv.dataset.src = `concepts/${concept.file}?preview=1`; previews = initPreviews(sb) }
    } else { sb.querySelector('h3').textContent = t.none; sb.querySelector('p').textContent = '' }
  }
  // newest by date; the sort is stable, so same-date concepts keep their table order (final first)
  const load = async (url) => { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(`${url} ${r.status}`); return r.json() }
  load('blogs/posts.json').then((list) => { post = list[0] || null }).catch((e) => window.__fb.errors.push(String(e))).then(paint)
  load('concepts/concepts.json').then((list) => { concept = [...list].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))[0] || null }).catch((e) => window.__fb.errors.push(String(e))).then(paint)
  paint()
  return { refresh: paint, dispose() { previews?.dispose() } }
}
