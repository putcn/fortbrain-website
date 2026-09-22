/**
 * 01 · Data comes in by itself; the AI keeps watch. Left: "Today" page with KPI tiles, the event
 * stream and the automation schedule. Right: the assistant's pushes (daily report, alert, weekly).
 */
import { el, q, qa, bubble, caption, reveal, esc } from './_lib.js'

const KPI0 = ['¥ 12,178', '210', '¥ 58.0'], KPI1 = ['¥ 12,480', '213', '¥ 58.6']

export function mount(root, t) {
  const p = t.page, c = t.chat
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${esc(p.crumb)}</div>
      <div class="fbd-kpis">${p.kpi.map((k, i) => `<div class="fbd-kpi"><small>${esc(k)}</small><b>${KPI0[i]}</b></div>`).join('')}</div>
      <div class="fbd-card feed"><div class="fbd-h">${esc(p.feed)}</div>
        <div class="fbd-feed">${p.ev.map((e, i) => `<div class="fbd-row" data-i="${i}"><div class="grow"><b>${esc(e[0])}</b><small>${esc(e[1])}</small></div>${i === 4 ? `<span class="fbd-tag warn">L2</span>` : `<span class="fbd-tag">L0</span>`}</div>`).join('')}</div>
      </div>
      <div class="fbd-card sched"><div class="fbd-h">${esc(p.sched)}</div>
        ${p.jobs.map((j, i) => `<div class="fbd-row" data-j="${i}"><div class="grow"><b>${esc(j[0])}</b><small>${esc(j[1])}</small></div><span class="fbd-tag jt">${esc(p.next)}</span></div>`).join('')}
      </div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${esc(c.title)}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
}

const card = (title, body, sub) => `<div class="fbd-card"><b>${esc(title)}</b><p>${esc(body)}</p>${sub ? `<p><span class="fbd-tag live">${esc(sub)}</span></p>` : ''}</div>`

export const steps = [
  { id: 'sales', dwell: 3200, run({ root, t }) {
    caption(root, t, 0)
    qa(root, '.fbd-feed .fbd-row').slice(0, 3).forEach((r, i) => setTimeout(() => reveal(r), i * 350))
    q(root, '.feed').classList.add('hot')
  } },
  { id: 'crawl', dwell: 3000, run({ root, t }) {
    caption(root, t, 1)
    reveal(qa(root, '.fbd-feed .fbd-row')[3])
    qa(root, '.fbd-kpi').forEach((k, i) => { k.classList.add('hot'); k.querySelector('b').textContent = KPI1[i] })
  } },
  { id: 'daily', dwell: 3600, run({ root, t }) {
    caption(root, t, 2)
    q(root, '.feed').classList.remove('hot'); q(root, '.sched').classList.add('hot')
    const jt = qa(root, '.jt')[0]; jt.textContent = t.page.done; jt.classList.add('live')
    bubble(root, 'card', card(t.chat.daily, t.chat.dailyBody, t.chat.dailySub))
  } },
  { id: 'alert', dwell: 3600, run({ root, t }) {
    caption(root, t, 3)
    q(root, '.sched').classList.remove('hot'); q(root, '.feed').classList.add('hot')
    reveal(qa(root, '.fbd-feed .fbd-row')[4])
    bubble(root, 'card', card(t.chat.alert, t.chat.alertBody, t.chat.alertTo)).querySelector('.fbd-card').style.borderLeft = '3px solid var(--fbd-warn)'
  } },
  { id: 'weekly', dwell: 4200, run({ root, t }) {
    caption(root, t, 4)
    q(root, '.feed').classList.remove('hot')
    const jt = qa(root, '.jt')[1]; jt.textContent = t.page.done; jt.classList.add('live')
    bubble(root, 'card', card(t.chat.weekly, t.chat.weeklyBody))
  } },
]
