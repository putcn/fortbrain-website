/**
 * Live scaled-down previews. Each `.pv[data-src]` gets an iframe rendered at 1280×800 and scaled to
 * the box width, only while the box is near the viewport, and never more than `max` at once.
 * Leaving the viewport removes the iframe (frees the GPU). Phones, coarse pointers and reduced
 * motion get the static placeholder only.
 */
const W = 1280, H = 800
const phone = () => matchMedia('(pointer: coarse), (max-width: 767px)').matches
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function initPreviews(root = document, { max } = {}) {
  const cap = max ?? (phone() || reduced() ? 0 : 3)
  const boxes = [...root.querySelectorAll('.pv[data-src]')]
  if (!cap || !boxes.length) return { dispose() {} }
  const live = new Set()
  const fit = (box, f) => { f.style.transform = `scale(${(box.clientWidth / W).toFixed(4)})` }
  const near = (b) => { const r = b.getBoundingClientRect(); return r.bottom > -120 && r.top < innerHeight + 120 }
  const mount = (box) => {
    if (live.has(box) || live.size >= cap) return
    const f = document.createElement('iframe')
    const h = box.closest('.card, .tile')?.querySelector('h2, h3, b'), l = document.documentElement.lang === 'en' ? 'en' : 'zh-CN'
    f.title = h?.querySelector(`[lang="${l}"]`)?.textContent || h?.textContent || 'preview'
    f.setAttribute('aria-hidden', 'true')
    f.addEventListener('load', () => f.classList.add('in'))
    fit(box, f); f.src = box.dataset.src; box.appendChild(f); live.add(box)
  }
  const unmount = (box) => { box.querySelector('iframe')?.remove(); live.delete(box) }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? mount(e.target) : unmount(e.target)
    for (const b of boxes) if (near(b)) mount(b)          // a box that waited for the cap gets its turn
  }, { rootMargin: '120px' })
  boxes.forEach((b) => io.observe(b))
  const onResize = () => { for (const b of live) fit(b, b.querySelector('iframe')) }
  addEventListener('resize', onResize)
  return { dispose() { io.disconnect(); removeEventListener('resize', onResize); boxes.forEach(unmount) } }
}

// the generated sub-site pages load this as a page script; the homepage imports initPreviews itself
if (!document.body.classList.contains('home')) initPreviews(document)
