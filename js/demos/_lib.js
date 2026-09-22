/** Tiny DOM helpers shared by the demo modules (no framework, no state). */
export const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild }
export const q = (root, sel) => root.querySelector(sel)
export const qa = (root, sel) => [...root.querySelectorAll(sel)]
export const show = (n) => n.classList.remove('fbd-hide')
export const hide = (n) => n.classList.add('fbd-hide')
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Append a chat bubble to `.fbd-msgs` and fade it in on the next frame. */
export function bubble(root, cls, html) {
  const m = el(`<div class="fbd-msg ${cls}">${html}</div>`)
  q(root, '.fbd-msgs').appendChild(m)
  reveal(m)
  return m
}
export function caption(root, t, i) { q(root, '.fbd-caption span').textContent = t.cap[i] }
/** Add `in` after a forced style flush so the CSS transition runs even right after insertion
 *  (synchronous on purpose: requestAnimationFrame never fires in a background tab). */
export const reveal = (n) => { void n.offsetWidth; n.classList.add('in') }
export const table = (th, rows, cls = '') => `<table class="fbd-table"><thead><tr>${th.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${cls}" data-i="${i}">${r.map((c, j) => `<td class="${j > 0 && /^[\d¥ ,.%]+/.test(c) ? 'num' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
