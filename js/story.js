/**
 * Scroll → story stage. The page is a stack of full-height sections; this module turns the
 * global scroll fraction into (stage index k, in-stage progress u) and tells the scene and
 * the UI-layers module. Nothing here touches Three.js.
 */

/**
 * Screen-heights per stage (must match the sections' min-height in CSS). Stage 2 (exploded UI
 * layers) and the last stage get two screens: the page can only scroll until the last section's
 * top reaches the viewport top, so the finale needs an extra screen to have any travel at all.
 */
export const LAYERS_STAGE = 2
export const STAGES = [1, 1, 2, 1, 1, 1, 1, 1, 1, 2]
const TOTAL = STAGES.reduce((a, b) => a + b, 0)
const SCROLLABLE = TOTAL - 1
const LAST = STAGES.length - 1

export function progressToStage(p) {
  if (!(p > 0)) return { k: 0, u: 0 }
  if (p >= 1) return { k: LAST, u: 1 }
  const screens = p * SCROLLABLE
  let start = 0
  for (let k = 0; k < STAGES.length; k++) {
    const w = k === LAST ? STAGES[k] - 1 : STAGES[k]
    if (screens < start + w || k === LAST) return { k, u: Math.min(1, (screens - start) / w) }
    start += w
  }
  return { k: LAST, u: 1 }
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
 * Story reader: `poll()` (call it once per animation frame from the render loop) reads the scroll
 * position and fires `onProgress(k, u, p)` when it changed. Reading in the loop rather than on
 * scroll events keeps the scene and the page in step even after the tab was hidden for a while.
 * Also toggles `.on` on each <section> as it enters the viewport (copy fade-in).
 */
export function initStory({ onProgress, sections = document.querySelectorAll('main > section') }) {
  let last = -1
  const poll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0
    if (p === last) return
    last = p
    const { k, u } = progressToStage(p)
    onProgress(k, u, p)
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('on', e.isIntersecting)
  }, { threshold: 0.35 })
  for (const s of sections) io.observe(s)
  poll()
  return { poll, refresh: () => { last = -1; poll() } }
}
