/* Preview mode for the UX Sandbox index and the homepage tile: `?preview=1` hides each page's
 * chrome (bars, panels, hints, back links…) and stops the page from taking pointer events.
 * Nothing else about the page changes. */
(function () {
  if (!/(^|[?&])preview=1(&|$)/.test(location.search)) return
  document.documentElement.classList.add('fb-preview')
  var s = document.createElement('style')
  s.textContent = '.fb-preview .bar,.fb-preview .panel,.fb-preview .hud,.fb-preview .controls,.fb-preview .legend,' +
    '.fb-preview #hint,.fb-preview #back,.fb-preview #status,.fb-preview #tour,.fb-preview #frame,.fb-preview #brand,' +
    '.fb-preview #credit,.fb-preview #toast,.fb-preview #inst,.fb-preview #stats,.fb-preview #detail,.fb-preview #guide,' +
    '.fb-preview #list,.fb-preview #left,.fb-preview #right,.fb-preview #feed,.fb-preview #chips,.fb-preview #focus,' +
    '.fb-preview #presets,.fb-preview #lights,.fb-preview #readout,.fb-preview #wxDetail,.fb-preview #wxToggle{display:none!important}' +
    '.fb-preview body{pointer-events:none}'
  document.head.appendChild(s)
})()
