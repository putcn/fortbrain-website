import { TEXTS, detectLang, applyLang } from './i18n.js'
import { initStory } from './story.js'
import { createLayers } from './layers.js'

// Bump on each deploy: the scene module is imported with this as a query so browsers (and the
// 10-minute GitHub Pages cache) never keep serving an old scene.js against a new page.
const VERSION = '2026-09-16a'
const params = new URLSearchParams(location.search)
const errors = []
window.addEventListener('error', (e) => errors.push(String(e.message || e)))
window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason?.stack || e.reason)))
window.__fb = { errors }
const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)').matches
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── language
let lang = params.get('lang') === 'zh' || params.get('lang') === 'en' ? params.get('lang') : detectLang()
let view = null
function setLang(l) {
  lang = applyLang(l)
  view?.setStoreWord?.(TEXTS[lang].ui.storeWord, TEXTS[lang].ui.storeSub)
}
setLang(lang)
document.getElementById('langBtn').addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'))

// ── contact (assembled at runtime so the address is not in the HTML)
const mail = document.getElementById('mail')
const addr = ['putcncx', 'gmail.com'].join('@')
mail.textContent = addr; mail.href = 'mailto:' + addr

// ── background: 3D scene, or the 2D aurora if WebGL / the basemap is unavailable
const gl = document.getElementById('gl'), a2d = document.getElementById('aurora2d')
const layers = createLayers(document.getElementById('layers'), { reduced })

function hasWebGL() {
  if (params.has('nogl')) return false
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

async function boot() {
  if (hasWebGL()) {
    try {
      const [{ create }, geo] = await Promise.all([
        import(`./scene.js?v=${VERSION}`),
        fetch('data/xuzhou.json').then((r) => { if (!r.ok) throw new Error('basemap ' + r.status); return r.json() }),
      ])
      view = create(gl, { geo, mobile, reduced })
    } catch (err) {
      console.warn('[fortbrain] 3D unavailable, using 2D aurora:', err)
      view = null
    }
  }
  if (!view) {
    gl.hidden = true; a2d.hidden = false
    const { create } = await import(`./fallback.js?v=${VERSION}`)
    view = create(a2d, { mobile, reduced })
  }
  view.setStoreWord?.(TEXTS[lang].ui.storeWord, TEXTS[lang].ui.storeSub)
  const story = initStory({ onProgress: (k, u, p) => { view.setProgress(k, u, p); layers.setProgress(k, u) } })
  Object.assign(window.__fb, { view, story, layers, mobile, reduced })
  window.addEventListener('resize', () => { view.resize(); story.refresh() })
  const loop = (now) => {
    if (!document.hidden) { story.poll(); view.tick(now); layers.tick(now) }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
boot()
