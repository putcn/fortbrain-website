/**
 * The 3D background: Xuzhou basemap (districts / trunk roads / water), demo store cubes whose
 * height "breathes", seven featured cubes with their own state machines, an aurora plane for
 * the finale, and a camera driven only by scroll progress (stage k, in-stage u).
 *
 * Materials, projection and placement are ported from the Fortbrain bigscreens so the site
 * looks like the product. All store data here is synthetic.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { makeProjector, pointInRing, placeStores, lcg, pickFeatured, segmentPositions, ringArea } from './geo.js'
import { blend, STAGES } from './story.js'

const T = { bg: 0x050b18, ground: 0x06101f, dist: 0x071226, hot: 0x0a1a33, dedge: 0x173654, road: 0x35b4d4, water: 0x061a2c, wedge: 0x1f8fb3, acc: 0xa6dcff, tint: 0x3fa9cc, glass: 0x0a2038 }
const GOLD = 0xd9b45a, TIER = { ok: 0x63d9a0, warn: 0xe0a33e, bad: 0xe2706b }
const PAY = [0x7fd9b3, 0x8db8f0, 0xe8cf8f]
const SQ = 3.1, HOVER = SQ * 0.95, LABEL_W = 20, LABEL_H = 5.6
const CELL_W = SQ + 1 + LABEL_W + 7, CELL_H = LABEL_H + 5.2
const H_RANGE = 2.0, GLOW_MAX = 0.16
const FONT = '"SF Mono",Menlo,Consolas,"Noto Sans SC","PingFang SC","Microsoft YaHei",monospace'

const vert = `varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const frag = `uniform float uTime,uPhase,uBoost,uLevel;uniform vec3 uColor,uTint;varying vec2 vUv;varying vec3 vN;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
void main(){vec2 uv=vUv;float t=uTime*.05;float n=fbm(uv*2.2+vec2(t,-t*.7)+uPhase);float n2=fbm(uv*4.5+vec2(-t*.6,t*.9)+uPhase*1.7);
 float fluid=smoothstep(.34,.82,n*.7+n2*.3);float pulse=.72+.28*sin(uTime*.7+uPhase*3.);
 vec2 g=abs(fract(uv*10.)-.5);float grid=1.-smoothstep(0.,.08,min(g.x,g.y));float b=min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y));float edge=1.-smoothstep(0.,.05,b);float facing=.6+.4*abs(vN.z);
 vec3 col=uTint*.22+uTint*fluid*(.9+.7*uLevel)*pulse*facing+uColor*edge*.85+uColor*grid*.06+uColor*uBoost*.5;gl_FragColor=vec4(col,1.);}`

// Aurora: three drifting bands of fbm noise, additive, fading at the plane's edges.
const auroraFrag = `uniform float uTime,uOpacity,uSeed;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<OCT;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}
float band(vec2 uv,float y,float w,float seed,float t){float c=y+(fbm(vec2(uv.x*2.2-t*.22,seed))-.5)*.35;float d=abs(uv.y-c);float up=1.-smoothstep(0.,w,d);up*=up;float f=fbm(vec2(uv.x*7.-t*.12,seed+3.))*.7+.3;float fil=.55+.45*noise(vec2(uv.x*140.+t*2.,seed*9.));float fil2=.6+.4*noise(vec2(uv.x*38.-t*.8,seed*5.));return up*f*fil*fil2;}
void main(){vec2 uv=vUv;float t=uTime;float s=uSeed;
 vec3 col=vec3(.30,.85,1.)*band(uv,.40,.13,1.3+s,t)+vec3(.60,.45,1.)*band(uv,.55,.12,7.1+s,t)*1.15+vec3(.95,.80,.45)*band(uv,.69,.10,3.7+s,t)*.95+vec3(.30,.85,1.)*band(uv,.25,.10,11.9+s,t)*.75;
 col*=.75;
 float edge=smoothstep(0.,.12,uv.x)*smoothstep(1.,.88,uv.x)*smoothstep(0.,.12,uv.y)*smoothstep(1.,.88,uv.y);
 gl_FragColor=vec4(col*edge*uOpacity,1.);}`
const auroraVert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
// Light pulse sliding along a TubeGeometry (uv.x runs along the curve): bright head, tail fading
// behind it, faded in/out at the lane's ends so it never pops. Two pulses per lane, half a lap apart.
const pulseFrag = `uniform float uHead,uLen,uAlpha;uniform vec3 uColor;varying vec2 vUv;
float pulse(float d){float tail=smoothstep(-uLen,0.,d)*(1.-smoothstep(0.,.015,d));return tail*tail*tail;}
void main(){float x=vUv.x;float g=pulse(x-uHead)+pulse(x-uHead+1.)+.55*pulse(x-fract(uHead+.5))+.55*pulse(x-fract(uHead+.5)+1.);
 float ends=smoothstep(0.,.05,x)*smoothstep(1.,.95,x);float rim=.65+.35*sin(vUv.y*6.2831);
 gl_FragColor=vec4(uColor*g*ends*rim*uAlpha,1.);}`

const ease = (k) => 1 - Math.pow(1 - k, 3)
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }
const lerpAngle = (a, b, t) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * t }

export function create(canvas, { geo = null, mobile = false, reduced = false } = {}) {
  const rnd = lcg(97)
  const junk = []
  const track = (o) => { junk.push(o); return o }
  const N_STORES = mobile ? 14 : 22

  // ── renderer / lights / environment
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95
  const scene = new THREE.Scene(); scene.background = new THREE.Color(T.bg)
  scene.fog = new THREE.Fog(T.bg, 380, 1000)
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 4000)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0x9fb3c8, 0x05080f, 0.5))
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(0, 150, -120); scene.add(key)
  const rim = new THREE.DirectionalLight(0x9fb3c8, 0.35); rim.position.set(-110, 50, 90); scene.add(rim)
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(2400, 2400)),
    track(new THREE.MeshStandardMaterial({ color: T.ground, roughness: 0.85, metalness: 0.1, envMapIntensity: 0.05 })))
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.15; scene.add(ground)

  // ── basemap
  const { P } = makeProjector(geo ? geo.center : [117.184811, 34.261792])
  const districts = (geo?.districts || []).map((d) => ({ name: d.name, center: P(d.center[0], d.center[1]), rings: d.rings.map((r) => r.map(([lo, la]) => P(lo, la))) }))
  const lineSeg = (polylines, y, color, opacity) => {
    const g = track(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(segmentPositions(polylines, y), 3))
    const l = new THREE.LineSegments(g, track(new THREE.LineBasicMaterial({ color, transparent: true, opacity }))); scene.add(l); return l
  }
  const distMeshes = []
  for (const d of districts) for (const ring of d.rings) {
    const g = track(new THREE.ExtrudeGeometry(new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z))), { depth: 0.25, bevelEnabled: false }))
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, track(new THREE.MeshStandardMaterial({ color: T.dist, roughness: 0.4, metalness: 0.4, envMapIntensity: 0.4 })))
    m.position.y = -0.25; scene.add(m); distMeshes.push({ ring, mesh: m, edge: null })
    const e = new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(ring.map(([x, z]) => new THREE.Vector3(x, 0.03, z)))),
      track(new THREE.LineBasicMaterial({ color: T.dedge, transparent: true, opacity: 0.32 })))
    scene.add(e); distMeshes[distMeshes.length - 1].edge = e
  }
  if (geo?.roads?.length) {
    const roads = geo.roads.map((r) => ({ cls: r.cls, pts: r.pts.map(([lo, la]) => P(lo, la)) }))
    const major = roads.filter((r) => r.cls === 'motorway').map((r) => r.pts), minor = roads.filter((r) => r.cls !== 'motorway').map((r) => r.pts)
    if (major.length) lineSeg(major, 0.08, T.road, 0.22)
    if (minor.length && !mobile) lineSeg(minor, 0.08, T.road, 0.11)
  }
  if (geo?.water?.length) {
    const areas = [], edges = [], lines = []
    for (const w of geo.water) {
      if (w.kind === 'area') {
        const ring = w.ring.map(([lo, la]) => P(lo, la)); if (ringArea(ring) < 0.05) continue
        const g = new THREE.ShapeGeometry(new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)))); g.rotateX(-Math.PI / 2); areas.push(g); edges.push([...ring, ring[0]])
      } else lines.push(w.pts.map(([lo, la]) => P(lo, la)))
    }
    if (areas.length) {
      const g = track(mergeGeometries(areas, false)); areas.forEach((a) => a.dispose())
      const mesh = new THREE.Mesh(g, track(new THREE.MeshStandardMaterial({ color: T.water, roughness: 0.3, metalness: 0.4, envMapIntensity: 0.35 })))
      mesh.position.y = 0.04; scene.add(mesh); lineSeg(edges, 0.07, T.wedge, 0.3)
    }
    if (lines.length) lineSeg(lines, 0.07, T.wedge, 0.26)
  }

  // ── demo stores: synthetic positions around the centre, placed on the staggered grid
  const allRings = districts.flatMap((d) => d.rings)
  const onMap = allRings.length ? (x, z) => Math.hypot(x, z) < 80 && allRings.some((r) => pointInRing(x, z, r)) : (x, z) => Math.hypot(x, z) < 80
  const stores = Array.from({ length: N_STORES }, (_, i) => {
    const a = rnd() * Math.PI * 2, r = 8 + Math.sqrt(rnd()) * 48
    return { id: i + 1, px: Math.cos(a) * r * 1.3, pz: Math.sin(a) * r, w: rnd() }
  })
  placeStores(stores, { onMap, cellW: CELL_W, cellH: CELL_H, rows: 8, cols: 7, rnd })
  for (const d of distMeshes) if (stores.some((s) => pointInRing(s.x, s.z, d.ring))) { d.mesh.material.color.setHex(T.hot); d.edge.material.opacity = 0.6 }

  // ── ground text (labels)
  function groundText(w, h) {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round((1024 * h) / w)
    const c = cv.getContext('2d')
    const tex = track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
    const mesh = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })))
    mesh.rotation.x = -Math.PI / 2
    mesh.userData.draw = (lines) => {
      c.clearRect(0, 0, cv.width, cv.height); c.textBaseline = 'top'; c.textAlign = 'left'; let y = 12
      for (const [txt, size, col, wt] of lines) {
        c.font = `${wt || 400} ${size}px ${FONT}`; c.fillStyle = col
        try { c.letterSpacing = '3px' } catch { /* old browsers */ }
        c.fillText(txt, 14, y); y += size * 1.4
      }
      c.fillStyle = 'rgba(160,178,200,.25)'; c.fillRect(14, y - 6, 220, 1)
      tex.needsUpdate = true
    }
    return mesh
  }

  // ── cubes
  const shadowTex = track((() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d')
    const g = c.createRadialGradient(128, 128, 8, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = g; c.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv)
  })())
  const cubeGeo = track(new THREE.BoxGeometry(SQ, SQ, SQ)), coreGeo = track(new THREE.BoxGeometry(SQ * 0.7, SQ * 0.7, SQ * 0.7))
  const edgeGeo = track(new THREE.EdgesGeometry(cubeGeo)), ringGeo = track(new THREE.RingGeometry(1, 1.08, 64))
  const glassMat = () => track(mobile
    ? new THREE.MeshPhysicalMaterial({ color: T.glass, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.6, emissive: 0x9fb3c8, emissiveIntensity: 0.03 })
    : new THREE.MeshPhysicalMaterial({ color: T.glass, transmission: 0.9, roughness: 0.05, thickness: SQ * 0.8, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.06, transparent: true, envMapIntensity: 1.4, emissive: 0x9fb3c8, emissiveIntensity: 0.03 }))
  const coreMat = (phase) => track(new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uTime: { value: 0 }, uPhase: { value: phase }, uBoost: { value: 0 }, uLevel: { value: 0 }, uColor: { value: new THREE.Color(T.acc) }, uTint: { value: new THREE.Color(T.tint) } } }))

  for (const [i, s] of stores.entries()) {
    const g = new THREE.Group(); g.position.set(s.x, 0, s.z)
    const shell = new THREE.Mesh(cubeGeo, glassMat())
    const core = new THREE.Mesh(coreGeo, coreMat(rnd() * 6.28))
    const edges = new THREE.LineSegments(edgeGeo, track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.6 })))
    const cube = new THREE.Group(); cube.add(core, shell, edges); cube.position.y = HOVER; g.add(cube)
    const stem = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, HOVER, 0)])), track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.22 })))
    g.add(stem)
    const sh = new THREE.Mesh(track(new THREE.PlaneGeometry(SQ * 2.6, SQ * 2.6)), track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })))
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.06; g.add(sh)
    const lab = groundText(LABEL_W, LABEL_H); lab.position.set(SQ / 2 + LABEL_W / 2 + 1, 0.09, 0); g.add(lab)
    scene.add(g)
    Object.assign(s, { _g: g, _cube: cube, _shell: shell, _core: core, _edges: edges, _stem: stem, _shadow: sh, _label: lab, _phase: rnd() * 6.28, _spin: (rnd() - 0.5) * 0.35, _born: i * 0.07, _speed: 0.18 + rnd() * 0.22, _level: 0, _hf: 1, _emBase: 0.03, _tint: new THREE.Color(T.tint), _visible: true })
  }
  let storeWord = 'Store'
  function paintLabels() {
    for (const s of stores) s._label.userData.draw([[`${storeWord} · ${String(s.id).padStart(2, '0')}`, 33, '#a6dcff', 500], [s._sub || '', 30, '#66748a']])
  }
  paintLabels()
  const gold = new THREE.Color(GOLD)
  function applyLevel(s, t, tint = s._tint) {
    s._hf = 1 + H_RANGE * t
    s._core.material.uniforms.uLevel.value = t
    const g = s._noGold ? 0 : t
    s._core.material.uniforms.uTint.value.copy(tint).lerp(gold, g)
    s._edges.material.color.setHex(T.acc).lerp(gold, g * 0.8)
    s._shell.material.emissive.setHex(T.acc).lerp(gold, Math.min(1, g * 1.5))
    s._emBase = 0.03 + GLOW_MAX * t
  }

  // ── ripples (used by several featured states)
  const ripples = []
  const rippleMat = track(new THREE.MeshBasicMaterial({ color: T.acc, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }))
  function ripple(x, z, color, op = 0.45) {
    const r = new THREE.Mesh(ringGeo, rippleMat.clone()); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.1, z)
    r.material.opacity = op; r.material.color.setHex(color); r.scale.setScalar(SQ * 0.6); scene.add(r); ripples.push({ m: r, t: 0, op })
  }

  // ── featured cubes A..J for stages 3..10 (stage 7 uses E and its nearest neighbour F)
  const featured = pickFeatured(stores, 8)
  const [A, B, C, D, E, G, H, J] = featured
  const F = stores.filter((s) => !featured.includes(s)).sort((a, b) => Math.hypot(a.x - E.x, a.z - E.z) - Math.hypot(b.x - E.x, b.z - E.z))[0] || featured[1]
  const isFixed = (s) => [B, C, D, H, J].includes(s)

  // A: "people only decide" — a pending card rises from the cube (amber), turns green the moment
  // it is approved, then three light streaks fan out to three small satellite cubes (the transfer,
  // the calendar, the system) which light up one after another: the assistant did the rest.
  const A_AZ = 0.5
  const decide = (() => {
    const right = [Math.cos(A_AZ), -Math.sin(A_AZ)], down = [Math.sin(A_AZ), Math.cos(A_AZ)]
    const at2 = (r, d) => [right[0] * r + down[0] * d, right[1] * r + down[1] * d]
    const offsets = [at2(1, 0.45), at2(-0.95, 0.5), at2(0.75, -0.85)]          // right-front, left-front, right-back
    const card = new THREE.Mesh(track(new THREE.BoxGeometry(SQ * 0.95, 0.09, SQ * 0.62)), track(new THREE.MeshBasicMaterial({ color: 0xe0a33e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
    const cardEdge = new THREE.LineSegments(track(new THREE.EdgesGeometry(card.geometry)), track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })))
    card.add(cardEdge); scene.add(card)
    const satGeo = track(new THREE.BoxGeometry(SQ * 0.5, SQ * 0.5, SQ * 0.5)), satEdge = track(new THREE.EdgesGeometry(satGeo))
    const sats = offsets.map((o) => {
      const g = new THREE.Group()
      const m = new THREE.Mesh(satGeo, track(new THREE.MeshStandardMaterial({ color: 0x16283f, emissive: 0x63d9a0, emissiveIntensity: 0, roughness: 0.4, metalness: 0.5 })))
      const e = new THREE.LineSegments(satEdge, track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.5 })))
      g.add(m, e); scene.add(g)
      return { g, m, e, o }
    })
    const dotGeo = track(new THREE.SphereGeometry(0.2, 10, 8))
    const dots = sats.map(() => { const d = new THREE.Mesh(dotGeo, track(new THREE.MeshBasicMaterial({ color: 0x9ff5c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))); scene.add(d); return d })
    return { card, cardEdge, sats, dots, lastPh: 0 }
  })()

  // B: gold, grows with "sales"
  B._tint = new THREE.Color(T.tint)

  // C: glass tank with liquid + two small tanks + glowing lanes with flowing pulses
  const tanks = []
  function buildTank(x, z, W, H, baseCol) {
    const g = new THREE.Group(); g.position.set(x, 0, z)
    const idc = 0xe8cf8f
    const shell = new THREE.Mesh(track(new THREE.BoxGeometry(W, H, W)), track(mobile
      ? new THREE.MeshPhysicalMaterial({ color: 0xbfe0ff, roughness: 0.06, transparent: true, opacity: 0.22, envMapIntensity: 1.9, side: THREE.DoubleSide, clearcoat: 1 })
      : new THREE.MeshPhysicalMaterial({ color: 0xbfe0ff, metalness: 0, roughness: 0.06, transmission: 0.96, thickness: 0.5, ior: 1.4, transparent: true, opacity: 0.3, envMapIntensity: 1.9, side: THREE.DoubleSide, clearcoat: 1, clearcoatRoughness: 0.08 })))
    shell.position.y = H / 2; g.add(shell)
    const edges = new THREE.LineSegments(track(new THREE.EdgesGeometry(shell.geometry)), track(new THREE.LineBasicMaterial({ color: idc, transparent: true, opacity: 0.8 }))); edges.position.y = H / 2; g.add(edges)
    const base = new THREE.Mesh(track(new THREE.BoxGeometry(W * 1.2, 0.6, W * 1.2)), track(new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.5, metalness: 0.7 }))); base.position.y = 0.3; g.add(base)
    const capM = track(new THREE.MeshStandardMaterial({ color: idc, emissive: idc, emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.5 }))
    for (const [bw, bd, bx, bz] of [[W * 1.04, 0.24, 0, W / 2], [W * 1.04, 0.24, 0, -W / 2], [0.24, W * 1.04, W / 2, 0], [0.24, W * 1.04, -W / 2, 0]]) {
      const bar = new THREE.Mesh(track(new THREE.BoxGeometry(bw, 0.26, bd)), capM); bar.position.set(bx, H, bz); g.add(bar)
    }
    const col = new THREE.Color(TIER.ok)
    const liq = new THREE.Mesh(track(new THREE.BoxGeometry(W * 0.86, 1, W * 0.86)), track(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.62, roughness: 0.25, metalness: 0.05 }))); g.add(liq)
    const face = new THREE.Mesh(track(new THREE.PlaneGeometry(W * 0.86, W * 0.86)), track(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.85, metalness: 0.1, roughness: 0.06, side: THREE.DoubleSide }))); face.rotation.x = -Math.PI / 2; g.add(face)
    for (let i = 1; i <= 4; i++) {
      const y = 0.6 + ((H - 0.6) * i) / 5, hw = (W / 2) * 1.005
      g.add(new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-hw, y, -hw), new THREE.Vector3(hw, y, -hw), new THREE.Vector3(hw, y, hw), new THREE.Vector3(-hw, y, hw)])), track(new THREE.LineBasicMaterial({ color: idc, transparent: true, opacity: 0.22 }))))
    }
    scene.add(g)
    const t = { g, liq, face, H, W, y0: 0.6, level: 0.5, phase: rnd() * 6.28, x, z }
    tanks.push(t); return t
  }
  function setLevel(t, lv) {
    t.level = lv; const h = Math.max(0.05, lv) * (t.H - t.y0)
    t.liq.scale.y = h; t.liq.position.y = t.y0 + h / 2; t.face.position.y = t.y0 + h + 0.02
    const c = lv >= 0.6 ? TIER.ok : lv >= 0.25 ? TIER.warn : TIER.bad
    t.liq.material.color.setHex(c); t.liq.material.emissive.setHex(c); t.face.material.color.setHex(c); t.face.material.emissive.setHex(c)
  }
  // C's own cube is replaced by a warehouse tank; two store tanks sit beside it
  C._g.visible = false; C._visible = false
  const tankMain = buildTank(C.x, C.z, SQ * 1.3, 9.5, 0x3a3020)
  const tankL = buildTank(C.x - 11, C.z + 5, SQ, 6.5, 0x16283f), tankR = buildTank(C.x + 12, C.z - 4, SQ, 7, 0x16283f)
  const lanes = []
  /** A logistics lane: glowing tube on the ground from a to b with a pulse sliding along it. */
  function buildLane(a, b, { col = TIER.ok, r = 0.2, opacity = 0.55, bow = 2.2, speed = 3.4 } = {}) {
    const A0 = new THREE.Vector3(a.x, 0.5, a.z), B0 = new THREE.Vector3(b.x, 0.5, b.z)
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, len = Math.hypot(b.x - a.x, b.z - a.z) || 1
    const px = -(b.z - a.z) / len, pz = (b.x - a.x) / len
    const curve = new THREE.CatmullRomCurve3([A0, new THREE.Vector3(mx + px * bow, 0.5, mz + pz * bow), B0])
    const tube = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 48, r, 8, false)), track(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.2, transparent: true, opacity })))
    tube.position.y = 0.35; scene.add(tube)
    const halo = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 48, r * 2.5, 8, false)), track(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07 * (opacity / 0.55), blending: THREE.AdditiveBlending, depthWrite: false })))
    halo.position.y = 0.35; scene.add(halo)
    const flow = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 120, r * 2.2, 8, false)), track(new THREE.ShaderMaterial({
      vertexShader: auroraVert, fragmentShader: pulseFrag,
      uniforms: { uHead: { value: rnd() }, uLen: { value: 0.16 }, uAlpha: { value: 1.6 }, uColor: { value: new THREE.Color(col) } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })))
    flow.position.y = 0.35; scene.add(flow)
    lanes.push({ flow, speed })
  }
  buildLane(tankMain, tankL); buildLane(tankMain, tankR)

  // ── the distribution network: the warehouse tank supplies the nearest stores, a second hub
  // (the store farthest from it) supplies its own neighbours. Thinner and dimmer than the featured
  // lanes so they read as background, but always moving.
  const byDist = (o, list) => [...list].sort((a, b) => Math.hypot(a.x - o.x, a.z - o.z) - Math.hypot(b.x - o.x, b.z - o.z))
  const plain = stores.filter((s) => s !== C && s !== E && s !== F)
  for (const t of byDist(C, plain).slice(0, mobile ? 4 : 6)) buildLane(tankMain, t, { col: 0x63d9a0, r: 0.12, opacity: 0.3, bow: 4, speed: 4.5 + rnd() * 2 })
  const hub2 = byDist(C, plain).at(-1)
  for (const t of byDist(hub2, plain.filter((s) => s !== hub2)).slice(0, mobile ? 3 : 4)) buildLane(hub2, t, { col: 0xe8cf8f, r: 0.12, opacity: 0.3, bow: 4, speed: 4.5 + rnd() * 2 })

  // D: traceability — every action leaves a record. A ledger of thin plates stacks up beside the
  // cube, each new record flying over as a light dot; a ring of time ticks turns around the cube.
  const D_AZ = -1.2
  const ledger = (() => {
    D._tint = new THREE.Color(0x8fd4ff); D._noGold = true
    const dx = Math.cos(D_AZ), dz = -Math.sin(D_AZ)
    const N = 14, plates = []
    const grp = new THREE.Group(); scene.add(grp)
    const pg = track(new THREE.BoxGeometry(SQ * 0.9, 0.11, SQ * 0.9))
    for (let i = 0; i < N; i++) {
      const m = new THREE.Mesh(pg, track(new THREE.MeshStandardMaterial({ color: 0xe8cf8f, emissive: 0xe8cf8f, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.3, transparent: true, opacity: 0 })))
      m.position.y = 0.06 + i * 0.17; grp.add(m); plates.push(m)
    }
    const dot = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 10, 8)), track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
    scene.add(dot)
    const tp = []
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, r0 = SQ * 1.25, r1 = r0 + (i % 4 ? 0.22 : 0.45); tp.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * r1, 0, Math.sin(a) * r1) }
    const tg = track(new THREE.BufferGeometry()); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3))
    const ring = new THREE.LineSegments(tg, track(new THREE.LineBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.4 })))
    ring.position.set(D.x, 0.12, D.z); scene.add(ring)
    return { grp, plates, dot, ring, dir: [dx, dz], N }
  })()

  // E ↔ F: light points travelling along an arc between two cubes
  const EF = { curve: null, dots: [], line: null }
  {
    const a = new THREE.Vector3(E.x, HOVER, E.z), b = new THREE.Vector3(F.x, HOVER, F.z)
    const m = a.clone().add(b).multiplyScalar(0.5); m.y = HOVER + Math.hypot(b.x - a.x, b.z - a.z) * 0.25
    EF.curve = new THREE.CatmullRomCurve3([a, m, b])
    EF.line = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(EF.curve.getPoints(60))), track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.18 })))
    scene.add(EF.line)
    const dotGeo = track(new THREE.SphereGeometry(0.42, 12, 10))
    for (let i = 0; i < 4; i++) {
      const d = new THREE.Mesh(dotGeo, track(new THREE.MeshBasicMaterial({ color: i % 2 ? 0x9d8cff : 0x5ee0ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })))
      scene.add(d); EF.dots.push({ m: d, u: i / 4, dir: i % 2 ? -1 : 1 })
    }
  }

  // ── communication links: every store talks to a couple of others. Thin arcs in the air
  // between cubes; a pool of "message" dots picks a link, flies across, fades, picks another.
  const comm = { links: [], dots: [] }
  {
    const talkers = stores.filter((s) => s !== C)
    const seen = new Set()
    const arc = (a, b) => {
      const p0 = new THREE.Vector3(a.x, HOVER, a.z), p1 = new THREE.Vector3(b.x, HOVER, b.z)
      const m = p0.clone().add(p1).multiplyScalar(0.5); m.y = HOVER + Math.hypot(b.x - a.x, b.z - a.z) * 0.18
      return new THREE.CatmullRomCurve3([p0, m, p1])
    }
    for (const a of talkers) {
      for (const b of byDist(a, talkers.filter((s) => s !== a)).slice(1, 3)) {           // skip the very nearest: those are lanes' territory
        const key = a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id
        if (seen.has(key) || (a === E && b === F) || (a === F && b === E)) continue
        seen.add(key)
        const curve = arc(a, b)
        const line = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40))), track(new THREE.LineBasicMaterial({ color: 0x9d8cff, transparent: true, opacity: 0.16 })))
        scene.add(line); comm.links.push({ curve, line })
      }
    }
    const dotGeo = track(new THREE.SphereGeometry(0.34, 10, 8))
    for (let i = 0; i < (mobile ? 6 : 12); i++) {
      const m = new THREE.Mesh(dotGeo, track(new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x5ee0ff : 0x9d8cff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
      scene.add(m); comm.dots.push({ m, link: null, u: rnd(), dir: 1, wait: rnd() * 2 })
    }
  }

  // H: data intelligence — the cube itself does the talking. Ahead of the solid "now" cube a
  // trail of translucent ghost cubes materialises one after another, each taller than the last
  // (the forecast reaching forward); inside the real cube a scan plane sweeps bottom to top
  // (analysis); data particles rise from the ground into it; a violet scan ring sweeps out.
  const H_AZ = -2.0
  const NG = 5
  const ghosts = (() => {
    H._tint = new THREE.Color(0x9d8cff); H._noGold = true
    const dx = Math.cos(H_AZ), dz = -Math.sin(H_AZ)                    // screen-right for the H keyframe
    const list = []
    const fillGeo = track(new THREE.BoxGeometry(SQ, SQ, SQ)), edgeG = track(new THREE.EdgesGeometry(fillGeo))
    for (let i = 1; i <= NG; i++) {
      const g = new THREE.Group()
      const hf = 1 + 0.24 * i
      const fill = new THREE.Mesh(fillGeo, track(new THREE.MeshBasicMaterial({ color: 0x9d8cff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
      const edges = new THREE.LineSegments(edgeG, track(new THREE.LineBasicMaterial({ color: 0xe8cf8f, transparent: true, opacity: 0 })))
      g.add(fill, edges)
      g.position.set(H.x + dx * i * SQ * 1.35, HOVER - SQ / 2 + (SQ * hf) / 2, H.z + dz * i * SQ * 1.35)
      g.scale.set(1, hf, 1)
      scene.add(g); list.push({ g, fill, edges, i, hf })
    }
    // scan plane inside the real cube (child of the cube group so it turns with it)
    const scan = new THREE.Mesh(track(new THREE.BoxGeometry(SQ * 0.78, 0.07, SQ * 0.78)), track(new THREE.MeshBasicMaterial({ color: 0xd9ccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })))
    H._cube.add(scan)
    return { list, scan, dir: [dx, dz] }
  })()

  // J: self-diagnosis / self-healing — the cube runs green, glitches red (a fault), an amber scan
  // ring sweeps it bottom-to-top twice (reading docs and logs), then it snaps back green with a
  // ripple (healed) and runs on. Its own loop, like the other featured states.
  const J_AZ = 1.4
  const heal = (() => {
    J._tint = new THREE.Color(TIER.ok); J._noGold = true
    const ring = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({ color: TIER.warn, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })))
    ring.rotation.x = -Math.PI / 2; scene.add(ring)
    const ok = new THREE.Color(TIER.ok), bad = new THREE.Color(TIER.bad), warn = new THREE.Color(TIER.warn), col = new THREE.Color(TIER.ok)
    return { ring, ok, bad, warn, col, lastPh: 0 }
  })()
  const stream = (() => {                                   // data particles rising into the cube
    const N = mobile ? 50 : 90
    const pos = new Float32Array(N * 3), ph = new Float32Array(N), rad = new Float32Array(N), ang = new Float32Array(N)
    const r1 = lcg(53)
    for (let i = 0; i < N; i++) { ph[i] = r1(); rad[i] = 1.6 + r1() * 2.6; ang[i] = r1() * Math.PI * 2 }
    const g = track(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const dotCv = document.createElement('canvas'); dotCv.width = dotCv.height = 64
    const dc = dotCv.getContext('2d'), dg = dc.createRadialGradient(32, 32, 2, 32, 32, 30)
    dg.addColorStop(0, 'rgba(255,255,255,1)'); dg.addColorStop(0.35, 'rgba(170,240,255,.8)'); dg.addColorStop(1, 'rgba(120,220,255,0)')
    dc.fillStyle = dg; dc.fillRect(0, 0, 64, 64)
    const dotTex = track(new THREE.CanvasTexture(dotCv)); dotTex.colorSpace = THREE.SRGBColorSpace
    const pts = new THREE.Points(g, track(new THREE.PointsMaterial({ map: dotTex, color: 0x8ff0ff, size: 0.55, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })))
    scene.add(pts)
    return { pts, pos, ph, rad, ang, N, top: HOVER + SQ * 0.4 }
  })()

  // G: assembles from wireframe, face by face
  const faceMats = []
  {
    G._shell.visible = false
    const faceGeo = track(new THREE.PlaneGeometry(SQ, SQ))
    const faces = [[0, 0, SQ / 2, 0, 0, 0], [0, 0, -SQ / 2, 0, Math.PI, 0], [SQ / 2, 0, 0, 0, Math.PI / 2, 0], [-SQ / 2, 0, 0, 0, -Math.PI / 2, 0], [0, SQ / 2, 0, -Math.PI / 2, 0, 0], [0, -SQ / 2, 0, Math.PI / 2, 0, 0]]
    for (const [x, y, z, rx, ry, rz] of faces) {
      const m = track(new THREE.MeshPhysicalMaterial({ color: T.glass, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0, clearcoat: 1, envMapIntensity: 1.6, emissive: T.acc, emissiveIntensity: 0.12, side: THREE.DoubleSide }))
      const f = new THREE.Mesh(faceGeo, m); f.position.set(x, y, z); f.rotation.set(rx, ry, rz); G._cube.add(f); faceMats.push(m)
    }
  }

  // ── aurora: the noise shader is rendered once per frame into a small offscreen texture
  // (full-screen fbm on a huge plane was fill-rate bound). One flat plane hangs over the city,
  // turned 45° so its bands pour from the top-left of the screen to the bottom-right like a river;
  // the camera sits above it and looks down through it at the map (additive, so the city shows).
  const auroraRT = track(new THREE.WebGLRenderTarget(mobile ? 512 : 1024, mobile ? 256 : 512, { depthBuffer: false }))
  const auroraMat = track(new THREE.ShaderMaterial({
    vertexShader: auroraVert, fragmentShader: auroraFrag.replace('OCT', mobile ? '3' : '4'),
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uSeed: { value: 0 } }, depthTest: false, depthWrite: false,
  }))
  const auroraScene = new THREE.Scene(), auroraCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  auroraScene.add(new THREE.Mesh(track(new THREE.PlaneGeometry(2, 2)), auroraMat))
  const aurora = new THREE.Mesh(track(new THREE.PlaneGeometry(1100, 520)), track(new THREE.MeshBasicMaterial({
    map: auroraRT.texture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
  })))
  // Euler XYZ: the Z turn happens in the plane's own space first, then X lays it flat, so the
  // band direction (local +x) ends up along world (+x, +z): screen top-left → bottom-right at az≈0.
  aurora.rotation.set(-Math.PI / 2, 0, -Math.PI / 4); aurora.position.set(0, 110, 0); aurora.visible = false; scene.add(aurora)

  // ── camera keyframes per stage
  const at = (s) => new THREE.Vector3(s.x, HOVER, s.z)
  const mid = new THREE.Vector3((E.x + F.x) / 2, HOVER + 2, (E.z + F.z) / 2)
  const dEF = Math.hypot(E.x - F.x, E.z - F.z)
  const KEYS = [
    { target: new THREE.Vector3(0, 0, 0), dist: 300, pol: 0.95, az: 0, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 230, pol: 0.85, az: 0.8, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 480, pol: 0.55, az: 1.6, spin: 0.045, dim: 0.5, closeup: false, off: 0 },
    { target: at(B).add(new THREE.Vector3(0, 3, 0)), dist: 30, pol: 1.1, az: -0.6, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(C.x, 3, C.z), dist: 42, pol: 1.0, az: 0.9, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(H.x + Math.cos(H_AZ) * 3.2, HOVER * 0.6, H.z - Math.sin(H_AZ) * 3.2), dist: 26, pol: 1.02, az: H_AZ, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(D.x + Math.cos(D_AZ) * 2.6, HOVER * 0.7, D.z - Math.sin(D_AZ) * 2.6), dist: 26, pol: 1.05, az: D_AZ, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(A).add(new THREE.Vector3(0, 0.8, 0)), dist: 24, pol: 1.05, az: A_AZ, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: mid, dist: Math.max(34, dEF * 1.3), pol: 1.08, az: 0.3, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(G), dist: 22, pol: 1.0, az: 2.2, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(J).add(new THREE.Vector3(0, 0.8, 0)), dist: 25, pol: 1.05, az: J_AZ, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(0, 0, 0), dist: 340, pol: 0.95, az: 0.25, spin: 0.02, dim: 0, closeup: true, off: 0.45 },
  ]
  if (mobile) for (const k of KEYS) k.dist *= 1.35
  // portrait phones: the map is wider east–west than north–south, so the two full-map views
  // (opening and finale) get a quarter turn and the long axis runs down the screen. The aurora
  // plane turns with the finale camera so the curtain still pours top-left → bottom-right.
  if (mobile) { KEYS[0].az += Math.PI / 2; KEYS[STAGES.length - 1].az += Math.PI / 2; aurora.rotation.z += Math.PI / 2 }
  const cur = { target: KEYS[0].target.clone(), dist: KEYS[0].dist, pol: KEYS[0].pol, az: KEYS[0].az, dim: 0, off: 0 }
  let stageK = 0, stageU = 0, firstFrame = true
  function setProgress(k, u) { stageK = k; stageU = u }

  const clock = new THREE.Clock()
  let spinAcc = 0
  const tmpT = new THREE.Vector3()

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05), el = clock.elapsedTime
    if (!reduced) spinAcc += dt

    // ── camera target from keyframes
    const { a, b, t } = blend(stageK, stageU)
    const ka = KEYS[a], kb = KEYS[b]
    const spinA = ka.spin ? spinAcc * ka.spin : 0, spinB = kb.spin ? spinAcc * kb.spin : 0
    tmpT.lerpVectors(ka.target, kb.target, t)
    const wantDist = ka.dist + (kb.dist - ka.dist) * t + (ka.closeup && kb.closeup && a !== b ? Math.sin(t * Math.PI) * 40 : 0)
    const wantPol = ka.pol + (kb.pol - ka.pol) * t
    const wantAz = lerpAngle(ka.az + spinA, kb.az + spinB, t)
    const wantDim = ka.dim + (kb.dim - ka.dim) * t
    const wantOff = ka.off + (kb.off - ka.off) * t
    const kk = firstFrame || reduced ? 1 : 1 - Math.exp(-dt * 4.2)
    cur.target.lerp(tmpT, kk); cur.dist += (wantDist - cur.dist) * kk; cur.pol += (wantPol - cur.pol) * kk
    cur.az = lerpAngle(cur.az, wantAz, kk); cur.dim += (wantDim - cur.dim) * kk; cur.off += (wantOff - cur.off) * kk
    firstFrame = false
    const sp = Math.sin(cur.pol), cp = Math.cos(cur.pol)
    camera.position.set(cur.target.x + cur.dist * sp * Math.sin(cur.az), cur.target.y + cur.dist * cp, cur.target.z + cur.dist * sp * Math.cos(cur.az))
    camera.up.set(0, 1, 0); camera.lookAt(cur.target)
    const VW = window.innerWidth, VH = window.innerHeight
    if (mobile) camera.setViewOffset(VW, VH, 0, VH * 0.2 * cur.off, VW, VH); else camera.setViewOffset(VW, VH, -VW * 0.16 * cur.off, 0, VW, VH)
    renderer.toneMappingExposure = 0.95 * (1 - 0.65 * cur.dim)

    // ── J cycle: healthy (0–.25) → fault (.25–.45) → scan (.45–.72) → healed flash (.72–.8) → healthy
    {
      const ph = reduced ? 0.1 : (el / 8) % 1
      const fault = smooth((ph - 0.25) / 0.06) * (1 - smooth((ph - 0.72) / 0.04))
      const scanT = (ph - 0.45) / 0.27
      const flash = ph >= 0.72 ? Math.max(0, 1 - (ph - 0.72) / 0.1) : 0
      const flicker = fault > 0 && !reduced ? 0.55 + 0.45 * Math.abs(Math.sin(el * 23) * Math.sin(el * 7.3)) : 1
      heal.col.copy(heal.ok).lerp(heal.bad, fault).lerp(heal.warn, scanT > 0 && scanT < 1 ? 0.5 * Math.sin(scanT * Math.PI) : 0)
      heal.level = 0.55 - 0.4 * fault
      heal.em = (0.12 + 0.05 * Math.sin(el * 2)) * flicker * (1 - fault * 0.4) + flash * 0.5
      heal.edge = (0.6 + 0.4 * flash) * (fault > 0 ? flicker : 1)
      if (!reduced && ph >= 0.25 && heal.lastPh < 0.25) ripple(J.x, J.z, TIER.bad, 0.5)
      if (!reduced && ph >= 0.72 && heal.lastPh < 0.72) ripple(J.x, J.z, TIER.ok, 0.6)
      heal.lastPh = ph
      heal._scanT = scanT
    }
    // ── stores breathing + featured states
    const sc = Math.max(0.42, Math.min(1, cur.dist / 330))
    const period = 3.2
    for (const s of stores) {
      if (!s._visible) continue
      s._core.material.uniforms.uTime.value = el
      let lv
      if (s === A) lv = 0.3
      else if (s === H) lv = 0.5
      else if (s === B) { const ph = (el / 7) % 1; lv = ph < 0.8 ? smooth(ph / 0.8) : 1 - smooth((ph - 0.8) / 0.2) }
      else if (s === D) lv = 0.4
      else if (s === J) lv = heal.level
      else lv = reduced ? 0.4 : 0.5 + 0.5 * Math.sin(el * s._speed + s._phase) * (0.6 + 0.4 * Math.sin(el * 0.11 + s._phase * 2))
      applyLevel(s, clamp01(lv), s._tint)
      if (s === D) { s._edges.material.color.copy(s._tint); s._shell.material.emissive.copy(s._tint); s._emBase = 0.1 + 0.06 * Math.sin(el * 2.4) }
      if (s === H) { s._edges.material.color.copy(s._tint); s._shell.material.emissive.copy(s._tint); s._emBase = 0.14 }
      if (s === J) { s._edges.material.color.copy(heal.col); s._shell.material.emissive.copy(heal.col); s._core.material.uniforms.uTint.value.copy(heal.col); s._emBase = heal.em; s._edges.material.opacity = heal.edge }
      if (s === A && !reduced) {
        const ph = (el / 7) % 1                                  // same clock as the decision cycle below
        const boost = ph < 0.15 ? ph / 0.15 : Math.max(0, 1 - (ph - 0.15) / 0.5)
        s._core.material.uniforms.uBoost.value = boost * 0.9
        s._shell.material.emissiveIntensity = s._emBase + boost * 0.16
      } else if (s === B && !reduced) {
        s._shell.material.emissiveIntensity = s._emBase
        if (rnd() < dt * 0.9) ripple(s.x, s.z, PAY[Math.floor(rnd() * 3)], 0.4)
      } else s._shell.material.emissiveIntensity = s._emBase
      const born = reduced ? 1 : ease(Math.min(1, Math.max(0, (el - 0.3 - s._born) / 0.9)))
      const bob = reduced ? 0 : Math.sin(el * 0.7 + s._phase) * 0.3
      const cs = sc * born; s._cube.scale.set(cs, cs * s._hf, cs)
      const bottom = (HOVER - SQ / 2 + bob) * sc; s._cube.position.y = bottom + (SQ * s._hf * cs) / 2
      const spin = isFixed(s) ? 0.05 : 0.12
      s._cube.rotation.y = s._phase + (reduced ? 0 : el * spin * (1 + s._spin)); s._cube.rotation.x = reduced ? 0 : Math.sin(el * 0.5 + s._phase) * 0.05; s._cube.rotation.z = reduced ? 0 : Math.cos(el * 0.4 + s._phase) * 0.05
      const st = s._stem.geometry.attributes.position; st.setY(1, (HOVER - SQ / 2 + bob) * sc); st.needsUpdate = true; s._stem.material.opacity = 0.22 * born
      s._shadow.scale.setScalar(sc * born); s._shadow.material.opacity = (0.9 - bob * 0.4) * born
      const ls = Math.max(0.5, sc); s._label.scale.setScalar(ls); s._label.position.x = (SQ / 2 + LABEL_W / 2 + 1) * ls; s._label.material.opacity = born
    }
    // J: the amber scan ring sweeps the cube bottom-to-top twice while it diagnoses itself
    {
      const t = heal._scanT
      const on = t > 0 && t < 1
      const sweep = on ? (t * 2) % 1 : 0
      const bottom = (HOVER - SQ / 2) * sc, top = (HOVER + SQ * 0.5 * J._hf) * sc
      heal.ring.position.set(J.x, bottom + (top - bottom) * sweep, J.z)
      heal.ring.scale.setScalar(SQ * 0.95 * sc)
      heal.ring.material.opacity = on ? 0.85 * Math.sin(sweep * Math.PI) : 0
    }
    // A: decision cycle — card rises (pending) → approved (green flash) → three streaks fan out → satellites light → fade
    {
      const ph = reduced ? 0.7 : (el / 7) % 1
      const APPROVE = 0.34, fade = smooth((ph - 0.9) / 0.1)
      const rise = smooth(ph / 0.15)
      const topY = (HOVER + SQ * 0.5 * A._hf) * sc
      decide.card.position.set(A.x, topY + (0.6 + 1.4 * rise) * sc + (reduced ? 0 : Math.sin(el * 1.6) * 0.12 * sc), A.z)
      decide.card.rotation.y = A._cube.rotation.y; decide.card.scale.setScalar(sc)
      const approved = smooth((ph - APPROVE) / 0.05)
      decide.card.material.color.setHex(0xe0a33e).lerp(new THREE.Color(0x63d9a0), approved)
      decide.card.material.opacity = (0.55 + 0.35 * approved) * rise * (1 - fade)
      decide.cardEdge.material.opacity = 0.9 * rise * (1 - fade)
      if (!reduced && ph >= APPROVE && decide.lastPh < APPROVE) ripple(A.x, A.z, TIER.ok, 0.55)
      decide.lastPh = ph
      decide.sats.forEach((st, i) => {
        const R = SQ * 2.6 * sc
        st.g.position.set(A.x + st.o[0] * R, (SQ * 0.25) * sc, A.z + st.o[1] * R); st.g.scale.setScalar(sc)
        const t = (ph - (0.42 + i * 0.13)) / 0.16
        const lit = smooth((ph - (0.58 + i * 0.13)) / 0.04) * (1 - fade)
        st.m.material.emissiveIntensity = 1.1 * lit
        st.e.material.opacity = 0.5 + 0.5 * lit
        const d = decide.dots[i]
        if (t > 0 && t < 1) {
          d.position.set(A.x, topY, A.z).lerp(new THREE.Vector3(st.g.position.x, st.g.position.y + SQ * 0.25 * sc, st.g.position.z), smooth(t))
          d.position.y += Math.sin(t * Math.PI) * 0.9 * sc
          d.material.opacity = Math.sin(t * Math.PI); d.scale.setScalar(Math.max(0.5, sc))
        } else d.material.opacity = 0
      })
    }
    // D: records fly from the cube onto the ledger; the stack fills, holds, then clears; tick ring turns
    {
      const cyc = 10, ph = reduced ? 0.7 : (el / cyc) % 1
      const slots = ledger.N + 2, prog = ph * slots
      const filled = Math.min(ledger.N, Math.floor(prog)), frac = prog - Math.floor(prog)
      const clear = smooth((ph - 0.9) / 0.1)
      const [ldx, ldz] = ledger.dir
      ledger.grp.position.set(D.x + ldx * SQ * 2.2 * sc, 0.1, D.z + ldz * SQ * 2.2 * sc); ledger.grp.scale.setScalar(sc)
      ledger.plates.forEach((m, i) => {
        m.material.opacity = (i < filled ? 0.85 : 0) * (1 - clear)
        m.material.emissiveIntensity = i === filled - 1 ? 0.5 + 0.9 * (1 - frac) : 0.5
      })
      const flying = filled < ledger.N && ph < 0.9
      ledger.dot.material.opacity = flying ? Math.sin(frac * Math.PI) * 0.95 : 0
      if (flying) {
        const top = new THREE.Vector3(ledger.grp.position.x, 0.1 + (0.06 + filled * 0.17) * sc, ledger.grp.position.z)
        ledger.dot.position.set(D.x, (HOVER + SQ * 0.4) * sc, D.z).lerp(top, smooth(frac)); ledger.dot.position.y += Math.sin(frac * Math.PI) * 1.4 * sc
      }
      ledger.dot.scale.setScalar(Math.max(0.5, sc))
      ledger.ring.scale.setScalar(sc); ledger.ring.rotation.y = reduced ? 0 : el * 0.12
      ledger.ring.material.opacity = 0.25 + 0.2 * Math.sin(el * 2.4)
    }
    // H: ghost cubes materialise outward (forecast), hold, dissolve; scan plane sweeps; particles rise
    {
      const ph = reduced ? 0.6 : (el / 6.5) % 1
      const out = smooth((ph - 0.72) / 0.22)
      const [gdx, gdz] = ghosts.dir
      for (const gh of ghosts.list) {                       // same distance-based scale `sc` as the real cubes
        const a = smooth((ph - gh.i * 0.09) / 0.2) * (1 - out)
        gh.fill.material.opacity = 0.09 * a
        gh.edges.material.opacity = (0.8 - gh.i * 0.08) * a
        gh.g.scale.set(sc, sc * gh.hf, sc)
        const step = gh.i * SQ * 1.35 * sc
        gh.g.position.set(H.x + gdx * step, (HOVER - SQ / 2) * sc + (SQ * gh.hf * sc) / 2 + (reduced ? 0 : Math.sin(el * 0.8 + gh.i) * 0.2 * sc), H.z + gdz * step)
      }
      ghosts.scan.position.y = -SQ / 2 + 0.12 + (SQ - 0.24) * (reduced ? 0.5 : (el * 0.55) % 1)
      const a = stream.pos
      for (let i = 0; i < stream.N; i++) {
        const k = reduced ? stream.ph[i] : (stream.ph[i] + el * 0.16) % 1
        const r = stream.rad[i] * (1 - k * 0.85), th = stream.ang[i] + k * 4.5
        a[i * 3] = H.x + Math.cos(th) * r * sc; a[i * 3 + 1] = 0.2 + k * stream.top * sc; a[i * 3 + 2] = H.z + Math.sin(th) * r * sc
      }
      stream.pts.geometry.attributes.position.needsUpdate = true
      if (!reduced && (el % 4) < dt) ripple(H.x, H.z, 0x9d8cff, 0.45)
    }
    // G assembling: faces appear one by one, hold, then dissolve
    {
      const ph = reduced ? 0.6 : (el / 6) % 1
      faceMats.forEach((m, i) => {
        const on = smooth((ph - i * 0.07) / 0.12), off = smooth((ph - 0.72) / 0.18)
        m.opacity = 0.55 * on * (1 - off); m.emissiveIntensity = 0.12 + 0.5 * on * (1 - off) * (1 - smooth((ph - i * 0.07 - 0.12) / 0.3))
      })
      G._edges.material.opacity = 0.35 + 0.45 * (1 - smooth((ph - 0.72) / 0.18)) * smooth(ph / 0.1)
    }
    // tanks: liquid levels drift; lanes flow
    for (const tk of tanks) setLevel(tk, reduced ? 0.55 : 0.5 + 0.42 * Math.sin(el * 0.23 + tk.phase))
    for (const ln of lanes) { const h = ln.flow.material.uniforms.uHead; h.value = (h.value + (reduced ? 0 : dt / ln.speed)) % 1 }
    // message dots on the communication links
    for (const d of comm.dots) {
      if (!d.link) {
        d.wait -= dt
        if (d.wait > 0 || !comm.links.length) continue
        d.link = comm.links[Math.floor(rnd() * comm.links.length)]; d.dir = rnd() < 0.5 ? 1 : -1; d.u = d.dir > 0 ? 0 : 1
        d.link.line.material.opacity = 0.42
      }
      d.u += (reduced ? 0.02 : dt * 0.45) * d.dir
      const k = d.dir > 0 ? d.u : 1 - d.u
      d.link.curve.getPoint(Math.max(0, Math.min(1, d.u)), d.m.position); d.m.scale.setScalar(Math.max(0.5, sc))
      d.m.material.opacity = 0.9 * Math.sin(Math.max(0, Math.min(1, k)) * Math.PI)
      d.link.line.material.opacity = Math.max(0.16, d.link.line.material.opacity - dt * 0.12)
      if (k >= 1) { d.link = null; d.wait = 0.4 + rnd() * 2.2; d.m.material.opacity = 0 }
    }
    // E ↔ F light points
    for (const d of EF.dots) {
      if (!reduced) d.u += dt * 0.22 * d.dir
      if (d.u > 1) { d.u = 1; d.dir = -1 } else if (d.u < 0) { d.u = 0; d.dir = 1 }
      EF.curve.getPoint(d.u, d.m.position); d.m.scale.setScalar(Math.max(0.5, sc))
      d.m.material.opacity = 0.35 + 0.6 * Math.sin(d.u * Math.PI)
    }
    // ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.t += dt / 1.6; const k = Math.min(1, r.t)
      r.m.scale.setScalar(SQ * (0.6 + ease(k) * 3.2) * sc); r.m.material.opacity = r.op * (1 - k)
      if (k >= 1) { scene.remove(r.m); r.m.material.dispose(); ripples.splice(i, 1) }
    }
    // aurora only in the finale
    const auroraT = stageK === STAGES.length - 1 ? smooth(stageU / 0.6) : stageK === STAGES.length - 2 ? smooth((stageU - 0.7) / 0.3) * 0.3 : 0
    if (auroraT > 0.001) {
      auroraMat.uniforms.uTime.value = reduced ? 0 : el * 0.35
      renderer.setRenderTarget(auroraRT); renderer.setClearColor(0x000000, 0); renderer.render(auroraScene, auroraCam); renderer.setRenderTarget(null)
    }
    aurora.visible = auroraT > 0.001; aurora.material.opacity = auroraT * 0.75

    renderer.render(scene, camera)
  }

  return {
    setProgress,
    tick,
    /** debugging aid: which demo store plays which role */
    roles: () => ({ A: A.id, B: B.id, C: C.id, D: D.id, E: E.id, F: F.id, G: G.id, H: H.id }),
    debugA: () => ({ A: [A.x.toFixed(1), A.z.toFixed(1), A._hf.toFixed(2)], card: [decide.card.position.x.toFixed(1), decide.card.position.y.toFixed(2), decide.card.position.z.toFixed(1), decide.card.material.opacity.toFixed(2), decide.card.scale.x.toFixed(2)], sats: decide.sats.map((st) => [st.g.position.x.toFixed(1), st.g.position.y.toFixed(2), st.g.position.z.toFixed(1), st.g.scale.x.toFixed(2), st.e.material.opacity.toFixed(2)]), lastPh: decide.lastPh.toFixed(2) }),
    debugH: () => ({ edge: H._edges.material.color.getHexString(), em: H._shell.material.emissiveIntensity, level: H._level, ghosts: ghosts.list.map((g) => [g.edges.material.opacity.toFixed(2), g.g.position.x.toFixed(1), g.g.position.y.toFixed(1), g.g.position.z.toFixed(1), g.g.scale.y.toFixed(2)]), scanY: ghosts.scan.position.y.toFixed(2), scanVisible: ghosts.scan.visible, p0: [stream.pos[0], stream.pos[1], stream.pos[2]].map((v) => v.toFixed(1)), H: [H.x.toFixed(1), H.z.toFixed(1)], cubeScale: H._cube.scale.y.toFixed(2) }),
    setStoreWord(word, sub) { storeWord = word; for (const s of stores) s._sub = sub; paintLabels() },
    resize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight, false) },
    dispose() { for (const r of ripples) { scene.remove(r.m); r.m.material.dispose() } for (const o of junk) o.dispose?.(); scene.clear(); renderer.dispose() },
  }
}
