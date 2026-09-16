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
float band(vec2 uv,float y,float w,float seed,float t){float c=y+(fbm(vec2(uv.x*2.2+t*.06,seed))-.5)*.35;float d=abs(uv.y-c);float f=fbm(vec2(uv.x*7.-t*.12,seed+3.))*.7+.3;return smoothstep(w,0.,d)*f;}
void main(){vec2 uv=vUv;float t=uTime;float s=uSeed;
 vec3 col=vec3(.37,.88,1.)*band(uv,.42,.16,1.3+s,t)+vec3(.62,.55,1.)*band(uv,.55,.14,7.1+s,t)+vec3(.91,.81,.56)*band(uv,.68,.11,3.7+s,t)*.8+vec3(.37,.88,1.)*band(uv,.3,.12,11.9+s,t)*.7;
 col*=smoothstep(0.,.35,uv.y);
 float edge=smoothstep(0.,.18,uv.x)*smoothstep(1.,.82,uv.x)*smoothstep(0.,.15,uv.y)*smoothstep(1.,.85,uv.y);
 gl_FragColor=vec4(col*edge*uOpacity,1.);}`
const auroraVert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`

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

  // ── featured cubes A..G for stages 3..8 (stage 7 uses E and its nearest neighbour F)
  const featured = pickFeatured(stores, 6)
  const [A, B, C, D, E, G] = featured
  const F = stores.filter((s) => !featured.includes(s)).sort((a, b) => Math.hypot(a.x - E.x, a.z - E.z) - Math.hypot(b.x - E.x, b.z - E.z))[0] || featured[1]
  const isFixed = (s) => [B, C, D].includes(s)

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
  function buildLane(a, b) {
    const A0 = new THREE.Vector3(a.x, 0.5, a.z), B0 = new THREE.Vector3(b.x, 0.5, b.z)
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, len = Math.hypot(b.x - a.x, b.z - a.z) || 1
    const px = -(b.z - a.z) / len, pz = (b.x - a.x) / len
    const curve = new THREE.CatmullRomCurve3([A0, new THREE.Vector3(mx + px * 2.2, 0.5, mz + pz * 2.2), B0])
    const col = TIER.ok
    const tube = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 48, 0.2, 8, false)), track(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.55 })))
    tube.position.y = 0.35; scene.add(tube)
    const halo = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 48, 0.5, 8, false)), track(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })))
    halo.position.y = 0.35; scene.add(halo)
    const SEG = 96, RAD = 8, ring = RAD * 6
    const flow = new THREE.Mesh(track(new THREE.TubeGeometry(curve, SEG, 0.3, RAD, false)), track(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })))
    flow.position.y = 0.35; scene.add(flow)
    const total = ring * SEG, win = ring * 6; flow.geometry.setDrawRange(0, win)
    lanes.push({ flow, total, win, ring, u: rnd() })
  }
  buildLane(tankMain, tankL); buildLane(tankMain, tankR)

  // D: alert tiers cycling green → amber → red (never gold: colour means tier here)
  D._tint = new THREE.Color(TIER.ok); D._noGold = true

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
  // (full-screen fbm on three big planes was fill-rate bound); three vertical curtains on the
  // northern horizon just sample that texture, mirrored / tinted so they don't read as copies.
  const auroraRT = track(new THREE.WebGLRenderTarget(mobile ? 384 : 640, mobile ? 128 : 224, { depthBuffer: false }))
  const auroraMat = track(new THREE.ShaderMaterial({
    vertexShader: auroraVert, fragmentShader: auroraFrag.replace('OCT', mobile ? '3' : '4'),
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uSeed: { value: 0 } }, depthTest: false, depthWrite: false,
  }))
  const auroraScene = new THREE.Scene(), auroraCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  auroraScene.add(new THREE.Mesh(track(new THREE.PlaneGeometry(2, 2)), auroraMat))
  const auroras = []
  for (const [z, w, h, y0, gain, flip, tint] of [[-620, 1500, 380, 40, 0.55, 1, 0xffffff], [-780, 1900, 460, 60, 0.4, -1, 0xcfd6ff], [-940, 2300, 520, 80, 0.3, 1, 0xbfefff]]) {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshBasicMaterial({
      map: auroraRT.texture, color: tint, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
    })))
    m.position.set(0, y0 + h / 2, z); m.scale.x = flip; m.visible = false; m.userData.gain = gain; scene.add(m); auroras.push(m)
  }

  // ── camera keyframes per stage
  const at = (s) => new THREE.Vector3(s.x, HOVER, s.z)
  const mid = new THREE.Vector3((E.x + F.x) / 2, HOVER + 2, (E.z + F.z) / 2)
  const dEF = Math.hypot(E.x - F.x, E.z - F.z)
  const KEYS = [
    { target: new THREE.Vector3(0, 0, 0), dist: 300, pol: 0.95, az: 0, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 230, pol: 0.85, az: 0.8, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 480, pol: 0.55, az: 1.6, spin: 0.045, dim: 0.62, closeup: false, off: 0 },
    { target: at(A), dist: 22, pol: 1.05, az: 0.5, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(B).add(new THREE.Vector3(0, 3, 0)), dist: 30, pol: 1.1, az: -0.6, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(C.x, 3, C.z), dist: 42, pol: 1.0, az: 0.9, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(D), dist: 22, pol: 1.05, az: -1.2, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: mid, dist: Math.max(34, dEF * 1.3), pol: 1.08, az: 0.3, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: at(G), dist: 22, pol: 1.0, az: 2.2, spin: 0, dim: 0, closeup: true, off: 1 },
    { target: new THREE.Vector3(0, 110, -160), dist: 560, pol: 1.38, az: 0.12, spin: 0, dim: 0, closeup: false, off: 0 },
  ]
  if (mobile) for (const k of KEYS) k.dist *= 1.35
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
    const W = window.innerWidth, H = window.innerHeight
    if (mobile) camera.setViewOffset(W, H, 0, H * 0.2 * cur.off, W, H); else camera.setViewOffset(W, H, -W * 0.16 * cur.off, 0, W, H)
    renderer.toneMappingExposure = 0.95 * (1 - 0.65 * cur.dim)

    // ── stores breathing + featured states
    const sc = Math.max(0.42, Math.min(1, cur.dist / 330))
    const period = 3.2
    for (const s of stores) {
      if (!s._visible) continue
      s._core.material.uniforms.uTime.value = el
      let lv
      if (s === A) lv = 0.3
      else if (s === B) { const ph = (el / 7) % 1; lv = ph < 0.8 ? smooth(ph / 0.8) : 1 - smooth((ph - 0.8) / 0.2) }
      else if (s === D) {
        const ph = (el / 4.8) % 1, st = ph < 0.4 ? 0 : ph < 0.7 ? 1 : 2
        const col = [TIER.ok, TIER.warn, TIER.bad][st]
        s._tint.lerp(new THREE.Color(col), Math.min(1, dt * 6))
        if (st === 2 && s._lastSt !== 2) ripple(s.x, s.z, TIER.bad, 0.5)
        s._lastSt = st; lv = 0.45
      } else lv = reduced ? 0.4 : 0.5 + 0.5 * Math.sin(el * s._speed + s._phase) * (0.6 + 0.4 * Math.sin(el * 0.11 + s._phase * 2))
      applyLevel(s, clamp01(lv), s._tint)
      if (s === A && !reduced) {
        const ph = (el + s._phase) % period
        const boost = ph < 0.25 ? ph / 0.25 : Math.max(0, 1 - (ph - 0.25) / 1.4)
        s._core.material.uniforms.uBoost.value = boost * 0.9
        s._shell.material.emissiveIntensity = s._emBase + boost * 0.16
        if (ph < 0.05 && !s._rippled) { ripple(s.x, s.z, T.acc, 0.5); s._rippled = true } else if (ph > 0.5) s._rippled = false
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
    for (const ln of lanes) { ln.u = (ln.u + (reduced ? 0 : dt / 3.4)) % 1; ln.flow.geometry.setDrawRange(Math.floor(((ln.total - ln.win) * ln.u) / ln.ring) * ln.ring, ln.win) }
    // E ↔ F light points
    for (const d of EF.dots) {
      if (!reduced) d.u += dt * 0.22 * d.dir
      if (d.u > 1) { d.u = 1; d.dir = -1 } else if (d.u < 0) { d.u = 0; d.dir = 1 }
      EF.curve.getPoint(d.u, d.m.position)
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
      renderer.setRenderTarget(auroraRT); renderer.render(auroraScene, auroraCam); renderer.setRenderTarget(null)
    }
    for (const a of auroras) { a.visible = auroraT > 0.001; a.material.opacity = auroraT * a.userData.gain }

    renderer.render(scene, camera)
  }

  return {
    setProgress,
    tick,
    setStoreWord(word, sub) { storeWord = word; for (const s of stores) s._sub = sub; paintLabels() },
    resize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight, false) },
    dispose() { for (const r of ripples) { scene.remove(r.m); r.m.material.dispose() } for (const o of junk) o.dispose?.(); scene.clear(); renderer.dispose() },
  }
}
