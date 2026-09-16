/**
 * Scroll → story stage. The page is a stack of full-height sections; this module turns the
 * global scroll fraction into (stage index k, in-stage progress u) and tells the scene and
 * the UI-layers module. Nothing here touches Three.js.
 */

/** Screen-heights per stage. Stage 2 (exploded UI layers) gets two screens of travel. */
export const LAYERS_STAGE = 2
export const STAGES = [1, 1, 2, 1, 1, 1, 1, 1, 1, 1]
const TOTAL = STAGES.reduce((a, b) => a + b, 0)

export function progressToStage(p) {
  if (!(p > 0)) return { k: 0, u: 0 }
  if (p >= 1) return { k: STAGES.length - 1, u: 1 }
  let acc = 0
  for (let k = 0; k < STAGES.length; k++) {
    const w = STAGES[k] / TOTAL
    if (p < acc + w) return { k, u: (p - acc) / w }
    acc += w
  }
  return { k: STAGES.length - 1, u: 1 }
}

const smooth = (x) => x * x * (3 - 2 * x)

/** Hold stage k for the first half of the section, then ease toward k+1 in the second half. */
export function blend(k, u) {
  const b = Math.min(k + 1, STAGES.length - 1)
  if (b === k) return { a: k, b, t: 1 }
  const t = u <= 0.5 ? 0 : smooth(Math.min(1, (u - 0.5) * 2))
  return { a: k, b, t }
}

/**
 * Wire scroll + resize to `onProgress(k, u, p)`, throttled to one call per animation frame,
 * and toggle `.on` on each <section> as it enters the viewport (copy fade-in).
 */
export function initStory({ onProgress, sections = document.querySelectorAll('main > section') }) {
  let queued = false, last = -1
  const read = () => {
    queued = false
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0
    if (p === last) return
    last = p
    const { k, u } = progressToStage(p)
    onProgress(k, u, p)
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(read) } }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('on', e.isIntersecting)
  }, { threshold: 0.35 })
  for (const s of sections) io.observe(s)
  read()
  return { refresh: () => { last = -1; read() } }
}
