/**
 * Stage 2: the Fortbrain workbench exploded into three HTML layers on an isometric stage.
 * Scroll progress inside the stage drives fly-in (0–.35), hover (.35–.65) and fly-out (.65–1).
 * Only transform + opacity are written, so it stays cheap on phones.
 */
import { LAYERS_STAGE } from './story.js'

// nav enters from far "north" (−y on the stage plane), list from the east, main from the south.
const CFG = [
  { dx: 0, dy: -900, z: 0 },
  { dx: 900, dy: 0, z: 60 },
  { dx: 0, dy: 900, z: 120 },
]
const IN_END = 0.35, OUT_START = 0.65, STAGGER = 0.07
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const easeOut = (x) => 1 - Math.pow(1 - x, 3)
const easeIn = (x) => x * x * x

export function createLayers(root, { reduced = false } = {}) {
  const layers = [...root.querySelectorAll('.layer')]
  let shown = false, k = -1, u = 0
  // phones: the stage is a fixed 1040px design, so scale it by viewport width (CSS can't divide
  // a length into a plain number for scale(), hence the variable set from here)
  const phone = window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)')
  const stage = root.querySelector('.stage')
  const fit = () => {
    root.style.setProperty('--stage-scale', Math.min(0.6, window.innerWidth / 1050).toFixed(3))
    if (!phone.matches) return
    // Measure where the three layers actually land (the isometric stage's visual centre is nowhere
    // near its box centre) and shift the stage so their union is centred, in the top ~30% of the
    // screen above the copy. Done in screen space: the outer translate of the stage transform.
    root.style.setProperty('--stage-dx', '0px'); root.style.setProperty('--stage-dy', '0px')
    const saved = layers.map((el) => el.style.transform)
    layers.forEach((el, i) => { el.style.transform = `translate3d(0px, 0px, ${CFG[i].z}px)` })
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const el of layers) { const b = el.getBoundingClientRect(); x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom) }
    layers.forEach((el, i) => { el.style.transform = saved[i] })
    if (!isFinite(x0)) return
    const dx = window.innerWidth / 2 - (x0 + x1) / 2, dy = window.innerHeight * 0.37 - (y0 + y1) / 2
    root.style.setProperty('--stage-dx', dx.toFixed(1) + 'px'); root.style.setProperty('--stage-dy', dy.toFixed(1) + 'px')
  }
  fit(); window.addEventListener('resize', fit)
  void stage
  const show = (v) => { if (v !== shown) { shown = v; root.classList.toggle('show', v) } }

  function setProgress(stage, prog) { k = stage; u = prog }

  function tick(now) {
    if (k !== LAYERS_STAGE) { show(false); return }
    show(true)
    layers.forEach((el, i) => {
      const c = CFG[i], s = i * STAGGER
      let x = 0, y = 0, z = c.z, op = 1
      if (u < IN_END + s) {
        const e = reduced ? 1 : easeOut(clamp01((u - s) / IN_END))
        x = c.dx * (1 - e); y = c.dy * (1 - e); z = c.z + 420 * (1 - e); op = e
      } else if (u < OUT_START + s) {
        z = c.z + (reduced ? 0 : Math.sin(now / 1400 + i * 2.1) * 6)
      } else {
        const e = reduced ? 1 : easeIn(clamp01((u - OUT_START - s) / (1 - OUT_START)))
        x = -c.dx * 0.45 * e; y = -c.dy * 0.45 * e; z = c.z + 520 * e; op = 1 - e
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`
      el.style.opacity = op.toFixed(3)
    })
  }

  return { setProgress, tick }
}
