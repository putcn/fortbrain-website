/**
 * 04 · Assistants ask each other. Left: the three assistants involved, the delegated subtask and
 * the storm guard. Right: one question from you, then the assistant-to-assistant exchange.
 */
import { q, qa, bubble, caption, esc } from './lib.js'

export function mount(root, t) {
  const p = t.page
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${esc(p.crumb)}</div>
      <div class="fbd-agents">
        <div class="fbd-agent a-mine"><span class="fbd-avatar">你</span><b>${esc(p.mine)}</b></div>
        <div class="fbd-agent a-logi"><span class="fbd-avatar">物</span><b>${esc(p.logi)}</b><span class="grow"></span><span class="fbd-tag kb fbd-hide">${esc(p.kb)}</span></div>
        <div class="fbd-agent a-store"><span class="fbd-avatar">店</span><b>${esc(p.store)}</b></div>
      </div>
      <div class="fbd-card task fbd-hide"><div class="fbd-h">${esc(p.tools)}</div><div class="fbd-row"><div class="grow"><b>${esc(p.task)}</b><small class="ts"></small></div><span class="fbd-tag ttag">…</span></div></div>
      <div class="fbd-card guard fbd-hide"><div class="fbd-row" style="border:0;margin:0;padding:0"><div class="grow"><b>${esc(p.guard)}</b><small>${esc(p.guardV)}</small></div><span class="fbd-tag warn">3 / 3</span></div></div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${esc(p.mine)}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
  const av = qa(root, '.fbd-avatar'); if (document.documentElement.lang === 'en') { av[0].textContent = 'Y'; av[1].textContent = 'L'; av[2].textContent = 'S' }
}

const hot = (root, sel) => { qa(root, '.fbd-agent').forEach((a) => a.classList.remove('hot')); if (sel) q(root, sel).classList.add('hot') }

export const steps = [
  { id: 'ask', dwell: 3000, run({ root, t }) { caption(root, t, 0); hot(root, '.a-mine'); bubble(root, 'me', esc(t.chat.q)) } },
  { id: 'peer', dwell: 3000, run({ root, t }) { caption(root, t, 1); hot(root, '.a-logi'); bubble(root, 'peer', esc(t.chat.ask)) } },
  { id: 'kb', dwell: 3400, run({ root, t }) {
    caption(root, t, 2); q(root, '.kb').classList.remove('fbd-hide')
    bubble(root, 'tool', esc(t.chat.kbTool)); bubble(root, 'peer back', esc(t.chat.reply))
  } },
  { id: 'delegate', dwell: 3600, run({ root, t }) {
    caption(root, t, 3); hot(root, '.a-store')
    bubble(root, 'peer', esc(t.chat.delegate)); bubble(root, 'peer back', esc(t.chat.delegated))
    const task = q(root, '.task'); task.classList.remove('fbd-hide')
    q(task, '.ts').textContent = t.page.taskDone; const tag = q(task, '.ttag'); tag.textContent = '✓'; tag.classList.add('live')
  } },
  { id: 'guard', dwell: 3200, run({ root, t }) {
    caption(root, t, 4); hot(root, null)
    const g = q(root, '.guard'); g.classList.remove('fbd-hide'); g.classList.add('hot')
    bubble(root, 'sys', esc(t.chat.stop))
  } },
  { id: 'final', dwell: 4200, run({ root, t }) { caption(root, t, 5); hot(root, '.a-mine'); q(root, '.guard').classList.remove('hot'); bubble(root, 'bot', esc(t.chat.final)) } },
]
