/**
 * 03 · People only decide. Left: the event triage list, the interruption budget and learned
 * preferences. Right: the assistant brings a decision card; "approve" is clickable; three results
 * light up one after another.
 */
import { q, qa, bubble, caption, reveal, esc, table } from './_lib.js'

export function mount(root, t) {
  const p = t.page, c = t.chat
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${esc(p.crumb)}</div>
      <div class="fbd-card triage">${table(p.th, p.rows, 'pending')}</div>
      <div class="fbd-card budget fbd-hide">
        <div class="fbd-meter"><span>${esc(p.budget)}</span><div class="fbd-bar"><i style="width:40%"></i></div><b style="color:var(--fbd-ink)">${esc(p.budgetV)}</b></div>
        <div class="fbd-row"><div class="grow"><b>${esc(p.learned)}</b><small>${esc(p.learnedV)}</small></div></div>
      </div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${esc(c.title)}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
}

export const steps = [
  { id: 'triage', dwell: 3400, run({ root, t }) {
    caption(root, t, 0)
    const rows = qa(root, '.triage tbody tr'); rows.forEach((r, i) => setTimeout(() => reveal(r), 300 * i))
    rows[2].classList.add('hot')
  } },
  { id: 'card', dwell: 3600, run({ root, t, go }) {
    caption(root, t, 1)
    const c = t.chat
    const m = bubble(root, 'card', `<div class="fbd-card"><b>${esc(c.card)} <span class="fbd-tag warn st">${esc(c.pending)}</span></b><p>${esc(c.cardBody)}</p><p style="color:var(--fbd-ink)">${esc(c.sug)}</p>
      <p><button class="fbd-btn pri approve" type="button">${esc(c.approve)}</button></p>
      <ul class="fbd-done">${c.done.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>`)
    m.querySelector('.approve').addEventListener('click', () => go(2))
  } },
  { id: 'approve', dwell: 2600, run({ root, t }) {
    caption(root, t, 2)
    bubble(root, 'me', esc(t.chat.approve))
    const card = q(root, '.fbd-msg.card .fbd-card'); card.classList.add('ok')
    const st = q(card, '.st'); st.textContent = t.chat.approved; st.classList.remove('warn'); st.classList.add('live')
    q(card, '.approve').disabled = true
  } },
  { id: 'done', dwell: 3600, run({ root, t }) {
    caption(root, t, 3)
    qa(root, '.fbd-done li').forEach((li, i) => setTimeout(() => li.classList.add('in'), 500 * i))
  } },
  { id: 'budget', dwell: 4200, run({ root, t }) {
    caption(root, t, 4)
    const b = q(root, '.budget'); b.classList.remove('fbd-hide'); b.classList.add('hot')
  } },
]
