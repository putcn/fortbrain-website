/**
 * Demo overlay: one fixed panel, a step machine, one demo module at a time. Opening locks page
 * scroll and pauses the scene (onOpen/onClose); `#demo=<name>` in the URL opens on load and the
 * browser Back button closes. Changing language re-mounts the same demo at the same step.
 *
 * A demo module exports `{ steps: [{ id, dwell?, run(ctx) }], mount(root, t) }`. `mount` renders
 * the whole mock from scratch; `run` for step i must be idempotent when replayed 0..i (that is
 * how moving backwards and switching language work: re-mount, replay).
 */
import { createStepper } from './demo-steps.js'
import { TEXTS } from './i18n.js'

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function initDemos({ root, getLang, onOpen = () => {}, onClose = () => {}, version = '' }) {
  const stage = root.querySelector('.fbd-stage'), title = root.querySelector('.fbd-title'), stepEl = root.querySelector('.fbd-step')
  const prev = root.querySelector('.fbd-prev'), next = root.querySelector('.fbd-next'), play = root.querySelector('.fbd-play')
  let cur = null          // { name, mod, stepper }
  let savedY = 0

  const ui = () => TEXTS[getLang()].demoUi
  const texts = (name) => TEXTS[getLang()].demos[name]

  function paint() {
    if (!cur) return
    const u = ui(), i = cur.stepper.index, n = cur.mod.steps.length
    title.textContent = texts(cur.name).title
    stepEl.textContent = u.step.replace('{i}', i + 1).replace('{n}', n)
    prev.textContent = u.prev; next.textContent = u.next; play.textContent = cur.stepper.auto ? u.pause : u.play
    root.querySelector('.fbd-x').setAttribute('aria-label', u.close)
    prev.disabled = i <= 0; next.disabled = i >= n - 1
  }
  // render from scratch and replay steps 0..i (each step is idempotent, so no undo logic)
  function render(i) {
    const t = texts(cur.name)
    stage.innerHTML = ''
    cur.mod.mount(stage, t)
    const ctx = { root: stage, t, go: (k) => cur.stepper.go(k), index: i }
    for (let k = 0; k <= i; k++) { ctx.index = k; cur.mod.steps[k].run(ctx) }
    stage.scrollTop = stage.scrollHeight
    paint()
  }

  async function open(name) {
    if (cur?.name === name) return
    if (cur) teardown()
    const mod = await import(`./demos/${name}.js?v=${version}`)
    cur = { name, mod, stepper: null }
    cur.stepper = createStepper({
      count: mod.steps.length,
      onGo: (i) => { render(i) },
      onAutoChange: paint,
      dwell: (i) => mod.steps[i].dwell ?? 2800,
    })
    savedY = window.scrollY
    document.body.classList.add('demo-open')
    root.hidden = false; requestAnimationFrame(() => root.classList.add('show'))
    if (location.hash !== `#demo=${name}`) history.pushState({ demo: name }, '', `#demo=${name}`)
    onOpen()
    cur.stepper.go(0, 'auto')
    if (!reduced) cur.stepper.play()
  }
  function teardown() {
    cur?.stepper.dispose(); cur = null
    stage.innerHTML = ''
    root.classList.remove('show'); root.hidden = true
    document.body.classList.remove('demo-open')
    window.scrollTo(0, savedY)
    onClose()
  }
  function close() {
    if (!cur) return
    teardown()
    if (location.hash.startsWith('#demo=')) history.replaceState(null, '', location.pathname + location.search)
  }

  root.querySelector('.fbd-x').addEventListener('click', close)
  root.addEventListener('click', (e) => { if (e.target === root) close() })
  prev.addEventListener('click', () => cur?.stepper.prev())
  next.addEventListener('click', () => cur?.stepper.next())
  play.addEventListener('click', () => { if (!cur) return; cur.stepper.auto ? cur.stepper.pause() : cur.stepper.play() })
  window.addEventListener('keydown', (e) => {
    if (!cur) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight') cur.stepper.next()
    else if (e.key === 'ArrowLeft') cur.stepper.prev()
  })
  window.addEventListener('popstate', () => { if (cur && !location.hash.startsWith('#demo=')) teardown() })
  for (const b of document.querySelectorAll('.demo-btn[data-demo]')) b.addEventListener('click', () => { if (!b.disabled) open(b.dataset.demo) })

  const fromHash = () => { const m = location.hash.match(/^#demo=([a-z]+)$/); if (m && document.querySelector(`.demo-btn[data-demo="${m[1]}"]:not([disabled])`)) open(m[1]) }
  fromHash()

  return { open, close, refresh: () => { if (cur) render(cur.stepper.index) } }
}
