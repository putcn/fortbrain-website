/**
 * 02 · How much to reorder: the engine works it out. Left: one SKU's 14-day sales bars, the
 * forecast growing forward, stock vs run-out. Right: the recommendation and the per-store table.
 */
import { q, qa, caption, reveal, esc, table } from './_lib.js'

const HIST = [6, 7, 5, 8, 6, 11, 12, 7, 6, 8, 7, 5, 12, 13]      // units/day, weekends higher
const FC = [7, 8, 7, 6, 12, 13, 8]
const MAX = 14

export function mount(root, t) {
  const p = t.page
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${esc(p.crumb)}</div>
      <div class="fbd-card chart"><div class="fbd-h">${esc(p.sku)} <small>${esc(p.hist)}</small></div>
        <div class="fbd-bars">${HIST.map((v, i) => `<i class="h ${i % 7 >= 5 ? 'wk' : ''}" data-v="${v}"></i>`).join('')}${FC.map((v) => `<i class="fc" data-v="${v}"></i>`).join('')}</div>
        <div class="fbd-legend"><span><i></i>${esc(p.hist)}</span><span class="fcl fbd-hide"><i class="fc"></i>${esc(p.fc)}</span></div>
      </div>
      <div class="fbd-card stock fbd-hide">
        <div class="fbd-row" style="border:0;margin:0;padding:0"><div class="grow"><b>${esc(p.stock)}</b><small class="sv">${esc(p.stockV)}</small></div><span class="fbd-tag bad">${esc(p.runout)}</span></div>
        <div class="fbd-row cover fbd-hide"><div class="grow"><b>${esc(p.cover)}</b><small>${esc(p.coverV)}</small></div><span class="fbd-tag live">+120</span></div>
      </div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-card rec fbd-hide"><b style="color:var(--fbd-ink)">${esc(p.rec)}</b><p>${esc(p.recBody)}</p><p><small>${esc(p.recWhy)}</small></p>
        <p><button class="fbd-btn pri" type="button">${esc(p.accept)}</button> <button class="fbd-btn" type="button">${esc(p.adjust)}</button></p></div>
      <div class="fbd-card stores fbd-hide"><div class="fbd-h">${esc(p.stores)}</div>${table(p.th, p.rows)}</div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
}

export const steps = [
  { id: 'hist', dwell: 3400, run({ root, t }) {
    caption(root, t, 0)
    qa(root, '.fbd-bars i.h').forEach((b, i) => setTimeout(() => { b.style.height = (b.dataset.v / MAX * 100) + '%' }, 60 * i))
  } },
  { id: 'fc', dwell: 3200, run({ root, t }) {
    caption(root, t, 1)
    qa(root, '.fbd-bars i.fc').forEach((b, i) => setTimeout(() => { b.style.height = (b.dataset.v / MAX * 100) + '%' }, 120 * i))
    q(root, '.fcl').classList.remove('fbd-hide')
  } },
  { id: 'stock', dwell: 3000, run({ root, t }) {
    caption(root, t, 2)
    const s = q(root, '.stock'); s.classList.remove('fbd-hide'); s.classList.add('hot')
  } },
  { id: 'rec', dwell: 3800, run({ root, t }) {
    caption(root, t, 3)
    q(root, '.stock').classList.remove('hot'); q(root, '.cover').classList.remove('fbd-hide')
    const r = q(root, '.rec'); r.classList.remove('fbd-hide'); r.classList.add('hot')
  } },
  { id: 'stores', dwell: 4200, run({ root, t }) {
    caption(root, t, 4)
    q(root, '.rec').classList.remove('hot')
    const s = q(root, '.stores'); s.classList.remove('fbd-hide')
    qa(s, 'tbody tr').forEach((tr, i) => { tr.classList.add('pending'); setTimeout(() => reveal(tr), 250 * i) })
    qa(s, 'tbody tr')[0].classList.add('hot')
  } },
]
