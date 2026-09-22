/**
 * Step machine for the demos (no DOM). `go(i)` moves to step i and reports it through `onGo`;
 * with autoplay on, a timer advances one step after `dwell(i)` ms. Any user move turns autoplay
 * off (the user took the wheel); `play()` hands it back. Timers are injectable for tests.
 */
export function createStepper({ count, onGo, onAutoChange = () => {}, dwell = () => 2600, timer = setTimeout, clear = clearTimeout }) {
  let i = -1, auto = false, handle = null
  const disarm = () => { if (handle != null) clear(handle); handle = null }
  const arm = () => { disarm(); if (auto && i < count - 1) handle = timer(() => { handle = null; go(i + 1, 'auto') }, dwell(i)) }
  const setAuto = (v) => { if (v === auto) return; auto = v; onAutoChange(v) }
  function go(n, by = 'user') {
    if (by !== 'auto') setAuto(false)
    i = Math.max(0, Math.min(count - 1, n)); onGo(i); arm()
  }
  return {
    go, next: () => go(i + 1), prev: () => go(i - 1),
    play() { setAuto(true); arm() }, pause() { setAuto(false); disarm() },
    get index() { return i }, get auto() { return auto },
    dispose() { disarm() },
  }
}
