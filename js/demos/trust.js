/**
 * 06 · Worthy of a company's trust. Left: the audit table (revocation shows up as a refused call),
 * then the Addon connections plugging into an unchanged core. Right: the self-diagnosis chat.
 */
import { q, qa, bubble, caption, reveal, esc, table } from './lib.js'

export function mount(root, t) {
  const p = t.page, c = t.chat
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-card audit"><div class="fbd-h">${esc(p.audit)}<span class="grow"></span><button class="fbd-btn revoke fbd-hide" type="button">${esc(p.revoke)}</button></div>${table(p.th, p.rows, 'pending')}</div>
      <div class="fbd-card addon fbd-hide"><div class="fbd-h">${esc(p.addon)}</div>
        <div class="fbd-plugs">
          <div>${p.plugs.map((n) => `<div class="fbd-plug"><span class="fbd-dot"></span>${esc(n)}<span class="fbd-tag live fbd-hide">${esc(p.plugged)}</span></div>`).join('')}</div>
          <div class="fbd-core">${esc(p.core)}<small>${esc(p.coreTag)}</small></div>
        </div>
      </div>
      <div class="fbd-card fixed fbd-hide"><div class="fbd-h"><span class="fbd-dot on"></span>${esc(p.heal)}</div><p>${esc(p.fixed)}</p></div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${esc(c.title)}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
  q(root, '.revoke').addEventListener('click', () => root._go?.(1))
}

export const steps = [
  { id: 'audit', dwell: 3600, run({ root, t, go }) {
    root._go = go; caption(root, t, 0)
    q(root, '.audit').classList.add('hot'); q(root, '.revoke').classList.remove('fbd-hide')
    qa(root, '.audit tbody tr').slice(0, 3).forEach((r, i) => setTimeout(() => reveal(r), 350 * i))
  } },
  { id: 'revoke', dwell: 3400, run({ root, t }) {
    caption(root, t, 1)
    const b = q(root, '.revoke'); b.disabled = true; b.textContent = t.page.revoked
    const r = qa(root, '.audit tbody tr')[3]; r.classList.add('bad'); reveal(r)
  } },
  { id: 'addon', dwell: 3800, run({ root, t }) {
    caption(root, t, 2)
    q(root, '.audit').classList.remove('hot')
    const a = q(root, '.addon'); a.classList.remove('fbd-hide'); a.classList.add('hot')
    qa(a, '.fbd-plug').forEach((pl, i) => setTimeout(() => { pl.classList.add('in'); pl.querySelector('.fbd-dot').classList.add('on'); pl.querySelector('.fbd-tag').classList.remove('fbd-hide') }, 400 * i))
  } },
  { id: 'ask', dwell: 3600, run({ root, t }) {
    caption(root, t, 3); q(root, '.addon').classList.remove('hot')
    bubble(root, 'me', esc(t.chat.q)); bubble(root, 'tool', esc(t.chat.doc)); bubble(root, 'tool', esc(t.chat.log)); bubble(root, 'bot', esc(t.chat.found))
  } },
  { id: 'fix', dwell: 3600, run({ root, t }) { caption(root, t, 4); bubble(root, 'bot', esc(t.chat.fix)); bubble(root, 'bot', esc(t.chat.close)) } },
  { id: 'it', dwell: 4200, run({ root, t }) { caption(root, t, 5); const f = q(root, '.fixed'); f.classList.remove('fbd-hide'); f.classList.add('hot') } },
]
