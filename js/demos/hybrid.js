/**
 * Hybrid Context demo: left is the "Hybrid Context → Local bridge" page, right is the assistant.
 * Eight steps, each idempotent: the shell re-mounts and replays 0..i when moving backwards or
 * switching language. Clickable page controls jump to the step they belong to.
 */
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild }
const q = (root, sel) => root.querySelector(sel)
const show = (n) => n.classList.remove('fbd-hide')
const hide = (n) => n.classList.add('fbd-hide')

function bubble(root, cls, text) {
  const m = el(`<div class="fbd-msg ${cls}">${text}</div>`)
  q(root, '.fbd-msgs').appendChild(m)
  void m.offsetWidth; m.classList.add('in')          // forced style flush: transition runs, no rAF needed
  return m
}
function caption(root, t, i) { q(root, '.fbd-caption span').textContent = t.cap[i] }

export function mount(root, t) {
  const p = t.page, c = t.chat
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${p.crumb} <span class="fbd-menubar"><span class="fbd-dot"></span>${p.menubar}</span></div>
      <div class="fbd-card ch">
        <div class="fbd-h"><span class="fbd-dot chdot"></span><span class="chtitle">${p.channel} · ${p.none}</span>
          <span class="grow"></span><span class="killwrap fbd-hide"><small>${p.killLabel}</small> <button class="fbd-switch kill" type="button" aria-label="${p.killLabel}"></button></span></div>
        <div class="setup"><p>${p.install}</p><div class="fbd-cmd">${p.cmd}</div><p><button class="fbd-btn pri pair" type="button">${p.pair}</button></p></div>
        <div class="dev fbd-hide"><div class="fbd-row"><b>${p.device}</b><span class="fbd-tag">${p.ver}</span><span class="grow"></span><small class="say">${p.online}</small></div></div>
      </div>
      <div class="fbd-card inst fbd-hide">
        <div class="fbd-h">${p.installed}</div>
        <div class="fbd-row"><div class="grow"><b>${p.shellName}</b><small class="state">${p.installedNot}</small></div><span class="fbd-tag st">${p.installedNot}</span><button class="fbd-btn enable" type="button">${p.btnEnable}</button></div>
        <div class="cfg fbd-hide">
          <div class="fbd-form">
            <label>${p.cfgRoot}</label><div class="fbd-field root">~/</div><button class="fbd-btn browse" type="button">${p.browse}</button>
            <span class="fbd-hint">${p.hintRoot}</span>
            <label>${p.cfgAllow}</label><div class="fbd-field">${p.allow}</div><button class="fbd-btn save" type="button">${p.save}</button>
          </div>
        </div>
      </div>
      <div class="fbd-card add">
        <div class="fbd-h">${p.addable}</div>
        <div class="fbd-row"><div class="grow"><b>${p.shellName}</b><small>${p.shellSum}</small></div><span class="fbd-tag warn">${p.danger}</span><button class="fbd-btn install" type="button">${p.btnInstall}</button></div>
        <div class="fbd-bar prog fbd-hide"><i></i></div>
      </div>
      <div class="nopath fbd-tag live fbd-hide">${p.noPath}</div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${c.title}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
  // clickable controls jump to their step (the shell replays 0..i, so each is safe from any state)
  q(root, '.pair').addEventListener('click', () => root._go?.(1))
  q(root, '.install').addEventListener('click', () => root._go?.(2))
  q(root, '.enable').addEventListener('click', () => root._go?.(3))
  q(root, '.kill').addEventListener('click', () => root._go?.(q(root, '.kill').classList.contains('off') ? 7 : 6))
}

export const steps = [
  { id: 'install', dwell: 3000, run({ root, t, go }) { root._go = go; caption(root, t, 0); q(root, '.ch').classList.add('hot') } },
  { id: 'pair', dwell: 2800, run({ root, t }) {
    caption(root, t, 1)
    hide(q(root, '.setup')); show(q(root, '.dev')); show(q(root, '.killwrap'))
    q(root, '.chdot').classList.add('on'); q(root, '.chtitle').textContent = t.page.channel
    q(root, '.fbd-menubar').classList.add('in'); q(root, '.fbd-menubar .fbd-dot').classList.add('on')
  } },
  { id: 'connector', dwell: 3600, run({ root, t }) {
    caption(root, t, 2)
    q(root, '.ch').classList.remove('hot'); q(root, '.add').classList.add('hot')
    q(root, '.install').disabled = true; q(root, '.install').textContent = t.page.installing
    const bar = q(root, '.prog'); show(bar); void bar.offsetWidth; bar.querySelector('i').style.width = '100%'
    show(q(root, '.inst')); show(q(root, '.nopath'))
  } },
  { id: 'config', dwell: 3600, run({ root, t }) {
    caption(root, t, 3)
    q(root, '.add').classList.remove('hot'); hide(q(root, '.add')); q(root, '.inst').classList.add('hot')
    show(q(root, '.cfg')); q(root, '.root').textContent = t.page.picked
    q(root, '.st').textContent = t.page.running; q(root, '.st').classList.add('live'); q(root, '.state').textContent = t.page.running
    q(root, '.enable').disabled = true
  } },
  { id: 'ask', dwell: 3600, run({ root, t }) {
    caption(root, t, 4); q(root, '.inst').classList.remove('hot')
    bubble(root, 'me', t.chat.q1); bubble(root, 'tool local', `${t.chat.tool1} · ${t.chat.local}`); bubble(root, 'bot', t.chat.a1)
  } },
  { id: 'deny', dwell: 3600, run({ root, t }) {
    caption(root, t, 5)
    bubble(root, 'me', t.chat.q2); bubble(root, 'bot', t.chat.a2)
  } },
  { id: 'kill', dwell: 3600, run({ root, t }) {
    caption(root, t, 6)
    q(root, '.kill').classList.add('off'); q(root, '.chdot').classList.remove('on'); q(root, '.say').textContent = t.page.paused
    q(root, '.fbd-menubar .fbd-dot').classList.remove('on'); q(root, '.ch').classList.add('hot')
    bubble(root, 'me', t.chat.q3); bubble(root, 'bot', t.chat.a3)
  } },
  { id: 'both', dwell: 6000, run({ root, t }) {
    caption(root, t, 7)
    q(root, '.kill').classList.remove('off'); q(root, '.chdot').classList.add('on'); q(root, '.say').textContent = t.page.online
    q(root, '.fbd-menubar .fbd-dot').classList.add('on'); q(root, '.ch').classList.remove('hot')
    bubble(root, 'me', t.chat.q4)
    bubble(root, 'tool local', `${t.chat.tool4a} · ${t.chat.local}`); bubble(root, 'tool', `${t.chat.tool4b} · ${t.chat.cloud}`)
    const a = bubble(root, 'bot', t.chat.a4)
    const rows = t.chat.rows.map((r) => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')
    a.appendChild(el(`<table class="fbd-table"><thead><tr>${t.chat.th.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`))
  } },
]
