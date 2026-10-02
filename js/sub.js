/**
 * Shared behaviour of the sub-sites (blog, UX Sandbox): the language toggle, on the same
 * `localStorage.lang` key as the homepage, and the blog list's tag filter. Both languages are
 * in the HTML; CSS shows the one matching <html lang>.
 */
function initial() {
  try { const s = localStorage.getItem('lang'); if (s === 'zh' || s === 'en') return s } catch { /* private mode */ }
  return String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
function apply(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  try { localStorage.setItem('lang', lang) } catch { /* fine, just not remembered */ }
}
let lang = initial()
apply(lang)
document.getElementById('langBtn')?.addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; apply(lang) })

const filters = document.querySelectorAll('.filters button[data-filter]')
for (const b of filters) b.addEventListener('click', () => {
  filters.forEach((x) => x.classList.toggle('on', x === b))
  const want = b.dataset.filter
  for (const p of document.querySelectorAll('.post[data-tags]')) p.hidden = !!want && !p.dataset.tags.split(' ').includes(want)
})
