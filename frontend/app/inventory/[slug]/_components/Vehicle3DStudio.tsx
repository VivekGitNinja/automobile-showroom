'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Loader2, RotateCcw, Play, Pause, MousePointerClick, Wrench, X } from 'lucide-react'
import Link from 'next/link'
import { Part, PartCategory } from '../../../../lib/types'
import { API_BASE_URL } from '../../../../lib/api'

// ---------------------------------------------------------------------------
// Interactive 3D Vehicle Studio
//
// A stylized three.js vehicle the visitor can orbit, zoom, repaint and
// "start". Clickable part hotspots (wheels, brakes, aero, interior) open the
// matching live spare-parts catalogue from the /parts API — connecting the
// 3D experience to genuine, staff-managed inventory.
// ---------------------------------------------------------------------------

const PAINTS = [
  { name: 'Midnight Onyx', hex: '#0d0d10' },
  { name: 'Apex Gold', hex: '#C9A227' },
  { name: 'Rosso Corsa', hex: '#a4161a' },
  { name: 'Glacier White', hex: '#e8e8ea' },
  { name: 'British Racing Green', hex: '#1d3b2a' },
  { name: 'Nardo Grey', hex: '#6a6d70' },
]

const ZONES = [
  { id: 'wheels-tyres', label: 'Wheels & Tyres', icon: '○', position: new THREE.Vector3(1.95, 0.35, 0.95) },
  { id: 'brakes', label: 'Brakes', icon: '◉', position: new THREE.Vector3(-1.95, 0.35, 0.95) },
  { id: 'exterior-carbon', label: 'Aero & Carbon', icon: '◆', position: new THREE.Vector3(-2.35, 0.55, -0.6) },
  { id: 'interior-comfort', label: 'Interior', icon: '▤', position: new THREE.Vector3(0.15, 1.05, 0) },
]

export default function Vehicle3DStudio({ vehicleName }: { vehicleName?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    body: THREE.Mesh
    wheels: THREE.Group[]
    raf: number
    zones: { el: HTMLDivElement; vector: THREE.Vector3 }[]
  } | null>(null)

  const [ready, setReady] = useState(false)
  const [running, setRunning] = useState(false)
  const [paint, setPaint] = useState(PAINTS[0])
  const [activeZone, setActiveZone] = useState<{ id: string; label: string } | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [partsLoading, setPartsLoading] = useState(false)
  const [categories, setCategories] = useState<PartCategory[]>([])
  const runningRef = useRef(false)

  // Load categories for zone → category mapping display
  useEffect(() => {
    fetch(`${API_BASE_URL}/parts/categories`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCategories(d?.data || []))
      .catch(() => {})
  }, [])

  // Fetch parts for the selected zone
  const openZone = useCallback((zone: { id: string; label: string }) => {
    setActiveZone(zone)
    setPartsLoading(true)
    fetch(`${API_BASE_URL}/parts?category=${zone.id}&limit=6`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setParts(d?.data || []))
      .catch(() => setParts([]))
      .finally(() => setPartsLoading(false))
  }, [])

  // ── three.js scene ─────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x050505, 14, 30)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(6.4, 2.6, 6.8)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 4.5
    controls.maxDistance = 14
    controls.maxPolarAngle = Math.PI / 2.05
    controls.target.set(0, 0.6, 0)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(6, 9, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xc9a227, 1.1)
    rim.position.set(-7, 4, -6)
    scene.add(rim)
    const fill = new THREE.PointLight(0x4455aa, 0.5, 30)
    fill.position.set(0, 3, -8)
    scene.add(fill)

    // Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(11, 64),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.35, metalness: 0.6 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(5.4, 5.5, 96),
      new THREE.MeshBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.01
    scene.add(ring)

    // ── Stylized vehicle ─────────────────────────────────────────────
    const car = new THREE.Group()

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(PAINTS[0].hex),
      metalness: 0.85,
      roughness: 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    })
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b0d10,
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    })
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.6, roughness: 0.5 })

    // Main body — low, wide silhouette
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.62, 1.95), bodyMat)
    body.position.y = 0.72
    body.castShadow = true
    car.add(body)

    // Nose taper
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.98, 1.1, 4, 1), bodyMat)
    nose.rotation.z = Math.PI / 2
    nose.rotation.x = Math.PI / 4
    nose.scale.set(1, 1, 1.63)
    nose.position.set(-2.55, 0.68, 0)
    nose.castShadow = true
    car.add(nose)

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 1.65), glassMat)
    cabin.position.set(0.1, 1.28, 0)
    cabin.castShadow = true
    car.add(cabin)

    // Cabin roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.09, 1.5), bodyMat)
    roof.position.set(0.1, 1.58, 0)
    car.add(roof)

    // Rear haunch
    const haunch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.85), bodyMat)
    haunch.position.set(1.95, 0.95, 0)
    haunch.rotation.z = 0.09
    haunch.castShadow = true
    car.add(haunch)

    // Rear wing (aero)
    const wingPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), darkMat)
    wingPost.position.set(2.3, 1.35, 0.6)
    car.add(wingPost)
    const wingPost2 = wingPost.clone()
    wingPost2.position.z = -0.6
    car.add(wingPost2)
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 2.0), darkMat)
    wing.position.set(2.35, 1.52, 0)
    wing.castShadow = true
    car.add(wing)

    // Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xd8e6ff })
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.4), headlightMat)
    hlL.position.set(-3.05, 0.78, 0.62)
    car.add(hlL)
    const hlR = hlL.clone()
    hlR.position.z = -0.62
    car.add(hlR)

    // Taillight bar
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 1.7), new THREE.MeshBasicMaterial({ color: 0xff2222 }))
    tail.position.set(2.85, 0.95, 0)
    car.add(tail)

    // Wheels
    const wheels: THREE.Group[] = []
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9f, metalness: 0.95, roughness: 0.2 })
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.4, roughness: 0.4 })

    const wheelPositions: [number, number][] = [
      [-1.55, 0.98], [-1.55, -0.98], [1.55, 0.98], [1.55, -0.98],
    ]
    for (const [wx, wz] of wheelPositions) {
      const wheel = new THREE.Group()
      const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 16, 40), tyreMat)
      tyre.rotation.y = Math.PI / 2
      tyre.castShadow = true
      wheel.add(tyre)
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.18, 24), rimMat)
      rim.rotation.z = Math.PI / 2
      wheel.add(rim)
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.05), rimMat)
        spoke.rotation.x = (s * Math.PI * 2) / 5
        wheel.add(spoke)
      }
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.16), caliperMat)
      caliper.position.set(0.05, 0.28, 0)
      wheel.add(caliper)
      wheel.position.set(wx, 0.52, wz)
      car.add(wheel)
      wheels.push(wheel)
    }

    scene.add(car)

    // ── Zone hotspots (HTML overlays projected each frame) ──────────
    const zoneEls: { el: HTMLDivElement; vector: THREE.Vector3 }[] = []
    for (const zone of ZONES) {
      const el = document.createElement('div')
      el.className = 'v3d-zone'
      el.innerHTML = `<span>${zone.icon}</span><em>${zone.label}</em>`
      el.style.cssText = 'position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(8,8,8,0.85);border:1px solid rgba(201,162,39,0.5);color:#e8e8ea;font:600 10px ui-monospace,monospace;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;user-select:none;backdrop-filter:blur(6px);transition:background 0.2s,border-color 0.2s;white-space:nowrap;z-index:5'
      el.addEventListener('mouseenter', () => { el.style.background = 'rgba(201,162,39,0.9)'; el.style.color = '#0a0a0a' })
      el.addEventListener('mouseleave', () => { el.style.background = 'rgba(8,8,8,0.85)'; el.style.color = '#e8e8ea' })
      el.addEventListener('click', (e) => { e.stopPropagation(); openZoneRef.current(zone) })
      mount.appendChild(el)
      zoneEls.push({ el, vector: zone.position.clone() })
    }

    // ── Render loop ──────────────────────────────────────────────────
    let raf = 0
    const clock = new THREE.Clock()
    const projected = new THREE.Vector3()

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = clock.getDelta()

      if (runningRef.current) {
        for (const w of wheels) w.rotation.x -= dt * 9
        car.position.y = Math.sin(clock.elapsedTime * 22) * 0.006
        hlL.visible = Math.floor(clock.elapsedTime * 2) % 2 === 0
      } else {
        car.position.y = 0
      }

      controls.update()
      renderer.render(scene, camera)

      // Project zone anchors to screen space, then greedily resolve overlaps
      // so labels never collide at any camera angle.
      const rect = renderer.domElement.getBoundingClientRect()
      const placed: { x: number; y: number; w: number; h: number }[] = []
      for (const z of zoneEls) {
        projected.copy(z.vector)
        projected.project(camera)
        const x = (projected.x * 0.5 + 0.5) * rect.width
        const y = (-projected.y * 0.5 + 0.5) * rect.height
        const visible = projected.z < 1
        z.el.style.display = visible ? 'flex' : 'none'
        if (!visible) continue
        const w = z.el.offsetWidth || 120
        const h = z.el.offsetHeight || 30
        let px = x
        let py = y
        let guard = 0
        while (guard < 20 && placed.some((r) => Math.abs(r.x - px) < (r.w + w) / 2 + 8 && Math.abs(r.y - py) < (r.h + h) / 2 + 6)) {
          py += h + 10
          guard++
        }
        z.el.style.left = `${px}px`
        z.el.style.top = `${py}px`
        placed.push({ x: px, y: py, w, h })
      }
    }
    tick()

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    sceneRef.current = { renderer, scene, camera, controls, body, wheels, raf, zones: zoneEls }
    setReady(true)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      for (const z of zoneEls) z.el.remove()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          for (const m of mats) m.dispose()
        }
      })
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the render loop informed of the running state without rebuilding the scene
  useEffect(() => {
    runningRef.current = running
  }, [running])

  const openZoneRef = useRef(openZone)
  useEffect(() => {
    openZoneRef.current = openZone
  }, [openZone])

  const applyPaint = (p: typeof PAINTS[number]) => {
    setPaint(p)
    const s = sceneRef.current
    if (s) (s.body.material as THREE.MeshPhysicalMaterial).color.set(p.hex)
  }

  return (
    <div className="rounded-[32px] bg-[#0A0A0A] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
            Interactive 3D Studio
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Explore in <span className="italic font-light text-white/70">Three Dimensions</span>
          </h3>
          <p className="text-[11px] font-mono text-[#7A7A7A] uppercase tracking-widest mt-2 flex items-center gap-2">
            <MousePointerClick className="w-3.5 h-3.5 text-[#C9A227]" />
            Drag to orbit · scroll to zoom · click a labelled zone to shop real parts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`h-12 px-6 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors ${
              running ? 'bg-[#3DD598] text-black' : 'bg-[#C9A227] text-black hover:bg-white'
            }`}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Running' : 'Start Engine'}
          </button>
          <button
            onClick={() => { setRunning(false); applyPaint(PAINTS[0]) }}
            title="Reset studio"
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#7A7A7A] hover:text-white hover:border-white/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div ref={mountRef} className="w-full h-[420px] sm:h-[520px] cursor-grab active:cursor-grabbing" />

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#7A7A7A] mt-4">
              Preparing Studio…
            </span>
          </div>
        )}

        {/* Paint configurator */}
        <div className="absolute left-6 bottom-6 z-10 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 p-4">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#7A7A7A] block mb-3">
            Paint — {paint.name}
          </span>
          <div className="flex items-center gap-2.5">
            {PAINTS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPaint(p)}
                title={p.name}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  paint.name === p.name ? 'border-[#C9A227] scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Parts drawer */}
      {activeZone && (
        <div className="border-t border-white/5 bg-black/40 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-serif font-bold text-white flex items-center gap-3">
              <Wrench className="w-5 h-5 text-[#C9A227]" />
              {activeZone.label} — Available Parts
            </h4>
            <div className="flex items-center gap-3">
              <Link href="/parts" className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] hover:text-white transition-colors">
                Full Catalogue →
              </Link>
              <button
                onClick={() => setActiveZone(null)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Close parts panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {partsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
            </div>
          ) : parts.length === 0 ? (
            <p className="text-xs font-mono text-[#7A7A7A] uppercase tracking-widest py-6 text-center">
              No published parts in this category yet — check the full catalogue or ask the concierge.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {parts.map((part) => (
                <Link
                  key={part.id}
                  href={`/parts/${part.slug}`}
                  className="group p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#C9A227]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[9px] font-mono text-[#7A7A7A] uppercase tracking-widest">{part.sku}</span>
                    <span className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      part.condition === 'NEW'
                        ? 'text-[#3DD598] border-[#3DD598]/30 bg-[#3DD598]/5'
                        : 'text-[#C9A227] border-[#C9A227]/30 bg-[#C9A227]/5'
                    }`}>
                      {part.condition}
                    </span>
                  </div>
                  <h5 className="text-sm font-serif font-bold text-white group-hover:text-[#C9A227] transition-colors leading-snug">
                    {part.name}
                  </h5>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[#C9A227] font-mono font-bold text-sm">
                      {part.currency} {Number(part.price).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#7A7A7A]">
                      {part.stockQty > 0 ? `${part.stockQty} in stock` : 'Made to order'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
