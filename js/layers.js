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
