/**
 * Scroll → story stage. The page is a stack of full-height sections; this module turns the
 * global scroll fraction into (stage index k, in-stage progress u) and tells the scene and
 * the UI-layers module. Nothing here touches Three.js.
 */

/**
 * Screen-heights per stage (must match the sections' min-height in CSS). Every section is two
 * screens tall with a one-screen sticky copy block, so each stage stays pinned for a full screen
 * of scrolling (reading time) before it scrolls out; the exploded-UI stage gets three screens.
 * The hero is a single screen: it is not pinned at all, so the very first scroll already moves
 * the title, and the camera starts leaving early (see HOLD) — visitors who saw nothing change
 * after a small scroll used to stop scrolling.
 * The page can only scroll until the last section's top reaches the viewport top, so the finale's
 * second screen is the one screen of travel it actually has.
 */
export const LAYERS_STAGE = 2
export const STAGES = [1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2]
/** Fraction of a stage the camera holds before easing to the next stage (hero: almost none). */
export const HOLD = STAGES.map((_, k) => (k === 0 ? 0.2 : 0.5))
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

/** Hold stage k for the first HOLD[k] of the section, then ease toward k+1 over the rest. */
export function blend(k, u) {
  const b = Math.min(k + 1, STAGES.length - 1)
  if (b === k) return { a: k, b, t: 1 }
  const h = HOLD[k]
  const t = u <= h ? 0 : smooth(Math.min(1, (u - h) / (1 - h)))
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
  const copies = [...sections].map((s) => [s, s.querySelector('.copy') || s])
  // Copy fade-in is computed here rather than with IntersectionObserver: the copy blocks are
  // position: sticky, and Chrome does not re-evaluate intersections when only the sticky offset
  // changes, so a pinned block could sit fully in view with no callback ever firing.
  const reveal = () => {
    const ih = window.innerHeight
    for (const [sec, c] of copies) {
      const r = c.getBoundingClientRect()
      const visible = Math.min(r.bottom, ih) - Math.max(r.top, 0)
      sec.classList.toggle('on', r.height > 0 && visible / r.height >= 0.4)
    }
  }
  const poll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0
    if (p === last) return
    last = p
    reveal()
    const { k, u } = progressToStage(p)
    onProgress(k, u, p)
  }
  poll()
  return { poll, refresh: () => { last = -1; poll() } }
}
