/**
 * Aurora curtain on a 2D canvas: the background when WebGL is unavailable.
 * Three to four noise-driven bands; below each band hang vertical filaments whose length
 * follows a faster noise, which is what gives the "curtain" look. Drawn at half resolution
 * on an offscreen canvas and scaled up. Same palette as the 3D finale (cyan / violet / gold).
 */
const BANDS = [
  { col: [94, 224, 255], y: 0.22, amp: 0.10, seed: 1.3, len: 0.42 },
  { col: [157, 140, 255], y: 0.34, amp: 0.12, seed: 7.1, len: 0.50 },
  { col: [232, 207, 143], y: 0.48, amp: 0.09, seed: 3.7, len: 0.36 },
  { col: [94, 224, 255], y: 0.62, amp: 0.13, seed: 11.9, len: 0.46 },
]

// 1-D value noise with smooth interpolation; enough for band curves and filament lengths.
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
function noise(x, seed) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f)
  return hash(i + seed * 97.3) * (1 - u) + hash(i + 1 + seed * 97.3) * u
}
const fbm = (x, seed) => noise(x, seed) * 0.6 + noise(x * 2.1, seed + 1) * 0.28 + noise(x * 4.3, seed + 2) * 0.12

export function create(canvas, { mobile = false, reduced = false } = {}) {
  const ctx = canvas.getContext('2d')
  const off = document.createElement('canvas'), octx = off.getContext('2d')
  const strips = BANDS.map((b) => {
    const c = document.createElement('canvas'); c.width = 2; c.height = 256
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256)
    const [r, gg, bb] = b.col
    gr.addColorStop(0, `rgba(${r},${gg},${bb},.9)`); gr.addColorStop(0.25, `rgba(${r},${gg},${bb},.45)`); gr.addColorStop(1, `rgba(${r},${gg},${bb},0)`)
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256)
    return c
  })
  let W = 0, H = 0, p = 0
  const gap = mobile ? 6 : 4          // filament spacing in offscreen px (= 12 / 8 on screen)
  function resize() {
    W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight
    off.width = Math.ceil(W / 2); off.height = Math.ceil(H / 2)
  }
  resize()
  function setProgress(k, u, prog) { p = prog }
  let t0 = performance.now()
  function tick(now) {
    const t = reduced ? 0 : (now - t0) / 1000
    const w = off.width, h = off.height
    octx.globalCompositeOperation = 'source-over'
    octx.clearRect(0, 0, w, h)
    octx.globalCompositeOperation = 'lighter'
    const count = 1 + Math.floor(p * 3.2), strength = 0.45 + 0.75 * p
    for (let b = 0; b < Math.min(count, BANDS.length); b++) {
      const band = BANDS[b], strip = strips[b]
      octx.globalAlpha = strength * (b === count - 1 ? Math.min(1, ((p * 3.2) % 1) + 0.35) : 1) * 0.55
      for (let x = 0; x < w; x += gap) {
        const nx = x / w
        const y = (band.y + (fbm(nx * 2.2 + t * 0.02, band.seed) - 0.5) * band.amp * 2) * h
        const len = (0.25 + fbm(nx * 9 + t * 0.08, band.seed + 5) * 1.1) * band.len * h
        const bright = 0.5 + fbm(nx * 5 - t * 0.05, band.seed + 9) * 0.5
        octx.globalAlpha *= bright
        octx.drawImage(strip, x, y, gap, len)
        octx.globalAlpha /= bright
      }
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#050b18'; ctx.fillRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = true
    // tilt the curtain so it pours from the top-left to the bottom-right (same as the 3D finale)
    ctx.translate(W / 2, H / 2); ctx.rotate(0.5); ctx.scale(1.6, 1.6); ctx.translate(-W / 2, -H / 2)
    ctx.drawImage(off, 0, 0, W, H)
  }
  return { setProgress, tick, resize, dispose() {} }
}
