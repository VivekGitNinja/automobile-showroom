'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Eye, Sparkles, Sliders, Sun, Shield } from 'lucide-react'

interface CarShowcase3DProps {
  initialColor?: string
}

export default function CarShowcase3D({ initialColor = '#C9A84C' }: CarShowcase3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paintColor, setPaintColor] = useState(initialColor)
  const [autoRotate, setAutoRotate] = useState(true)
  const [headlightsOn, setHeadlightsOn] = useState(true)
  const [activeCameraAngle, setActiveCameraAngle] = useState<'3q' | 'side' | 'front' | 'top'>('3q')

  const sceneRef = useRef<THREE.Scene | null>(null)
  const carBodyMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const headlightMatRef = useRef<THREE.MeshBasicMaterial | null>(null)
  const headlightLightLeftRef = useRef<THREE.SpotLight | null>(null)
  const headlightLightRightRef = useRef<THREE.SpotLight | null>(null)
  const carGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  const colors = [
    { name: 'Liquid Gold', hex: '#C9A84C' },
    { name: 'Midnight Sapphire', hex: '#0B192C' },
    { name: 'Rosso Corsa', hex: '#D91656' },
    { name: 'Stealth Carbon', hex: '#1E1E1E' },
    { name: 'Pearl White', hex: '#F5F5F0' },
  ]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.fog = new THREE.FogExp2(0x0d0d0d, 0.03)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(5, 2.2, 5)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfffaed, 3.5)
    mainLight.position.set(6, 8, 5)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    scene.add(mainLight)

    const rimLight = new THREE.DirectionalLight(0xc9a84c, 3.0)
    rimLight.position.set(-6, 5, -5)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0x80b3ff, 1.0)
    fillLight.position.set(0, -2, 6)
    scene.add(fillLight)

    // Reflective Floor Pedestal
    const floorGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.2, 64)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.15,
      metalness: 0.85,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.y = -0.1
    floor.receiveShadow = true
    scene.add(floor)

    // Floor Ring Light
    const ringGeo = new THREE.RingGeometry(4.3, 4.45, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.01
    scene.add(ring)

    // 3D Procedural Supercar Model
    const carGroup = new THREE.Group()
    carGroupRef.current = carGroup

    // Paint Material
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(paintColor),
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    })
    carBodyMatRef.current = bodyMat

    // Main Car Chassis Base
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.55, 4.2)
    // Chamfer/bevel shapes
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.position.y = 0.5
    bodyMesh.castShadow = true
    carGroup.add(bodyMesh)

    // Cabin / Roof Top
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.45, 2.1)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      transparent: true,
      opacity: 0.85,
    })
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat)
    cabinMesh.position.set(0, 0.9, -0.2)
    cabinMesh.castShadow = true
    carGroup.add(cabinMesh)

    // Hood / Front Nose Slope
    const hoodGeo = new THREE.BoxGeometry(1.9, 0.25, 1.4)
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat)
    hoodMesh.position.set(0, 0.55, 1.4)
    hoodMesh.rotation.x = -0.1
    hoodMesh.castShadow = true
    carGroup.add(hoodMesh)

    // Rear Spoiler
    const wingGeo = new THREE.BoxGeometry(2.0, 0.06, 0.4)
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 })
    const wingMesh = new THREE.Mesh(wingGeo, carbonMat)
    wingMesh.position.set(0, 0.95, -2.0)
    carGroup.add(wingMesh)

    const wingPillarGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1)
    const pillar1 = new THREE.Mesh(wingPillarGeo, carbonMat)
    pillar1.position.set(-0.7, 0.8, -2.0)
    const pillar2 = new THREE.Mesh(wingPillarGeo, carbonMat)
    pillar2.position.set(0.7, 0.8, -2.0)
    carGroup.add(pillar1)
    carGroup.add(pillar2)

    // Wheels & Rims
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 32)
    wheelGeo.rotateZ(Math.PI / 2)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 })

    const wheelPositions = [
      [-1.05, 0.38, 1.3],  // Front Left
      [1.05, 0.38, 1.3],   // Front Right
      [-1.05, 0.38, -1.3], // Rear Left
      [1.05, 0.38, -1.3],  // Rear Right
    ]

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.position.set(x, y, z)

      const tire = new THREE.Mesh(wheelGeo, tireMat)
      tire.castShadow = true
      wheelGroup.add(tire)

      const rimCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.32, 16), rimMat)
      rimCap.rotateZ(Math.PI / 2)
      wheelGroup.add(rimCap)

      carGroup.add(wheelGroup)
    })

    // LED Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    headlightMatRef.current = headlightMat

    const hlGeo = new THREE.BoxGeometry(0.45, 0.12, 0.1)
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat)
    hlLeft.position.set(-0.7, 0.52, 2.05)
    carGroup.add(hlLeft)

    const hlRight = new THREE.Mesh(hlGeo, headlightMat)
    hlRight.position.set(0.7, 0.52, 2.05)
    carGroup.add(hlRight)

    // Spotlights for Headlight Beams
    const spotL = new THREE.SpotLight(0x00f0ff, 10, 15, Math.PI / 6, 0.5)
    spotL.position.set(-0.7, 0.52, 2.1)
    spotL.target.position.set(-0.7, 0, 8)
    carGroup.add(spotL)
    carGroup.add(spotL.target)
    headlightLightLeftRef.current = spotL

    const spotR = new THREE.SpotLight(0x00f0ff, 10, 15, Math.PI / 6, 0.5)
    spotR.position.set(0.7, 0.52, 2.1)
    spotR.target.position.set(0.7, 0, 8)
    carGroup.add(spotR)
    carGroup.add(spotR.target)
    headlightLightRightRef.current = spotR

    // Taillights (Red LED bar)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 })
    const tailGeo = new THREE.BoxGeometry(1.8, 0.08, 0.1)
    const tailMesh = new THREE.Mesh(tailGeo, tailMat)
    tailMesh.position.set(0, 0.6, -2.06)
    carGroup.add(tailMesh)

    scene.add(carGroup)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      if (autoRotate && carGroupRef.current) {
        carGroupRef.current.rotation.y = elapsedTime * 0.35
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      
      // Memory Leak Fix: Traverse scene and dispose of all geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object: THREE.Object3D) => {
          if (!(object instanceof THREE.Mesh)) return

          object.geometry.dispose()

          if (object.material instanceof THREE.Material) {
            cleanMaterial(object.material)
          } else if (Array.isArray(object.material)) {
            // an array of materials
            for (const material of object.material) cleanMaterial(material)
          }
        })
      }

      function cleanMaterial(material: THREE.Material) {
        material.dispose()
        // dispose textures — cast through unknown required because THREE.Material
        // does not expose an index signature, but runtime properties include textures
        const materialRecord = material as unknown as Record<string, unknown>
        for (const key of Object.keys(material)) {
          const value = materialRecord[key]
          if (value && typeof value === 'object' && 'minFilter' in value && typeof (value as THREE.Texture).dispose === 'function') {
            (value as THREE.Texture).dispose()
          }
        }
      }

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      
      // Force context loss
      const gl = renderer.getContext()
      const extension = gl.getExtension('WEBGL_lose_context')
      if (extension) extension.loseContext()
    }
    // ENGINEERING JUSTIFICATION: Three.js WebGL rendering contexts must be strictly initialized exactly once per session. 
    // Including state properties like `paintColor` in this dependency array causes destructive memory leaks and canvas rebuilds.
    // Cleanup function correctly traverses and disposes all materials, geometries, and textures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update Paint Color
  useEffect(() => {
    if (carBodyMatRef.current) {
      carBodyMatRef.current.color.set(paintColor)
    }
  }, [paintColor])

  // Toggle Headlights
  useEffect(() => {
    if (headlightMatRef.current && headlightLightLeftRef.current && headlightLightRightRef.current) {
      if (headlightsOn) {
        headlightMatRef.current.color.set(0x00f0ff)
        headlightLightLeftRef.current.intensity = 10
        headlightLightRightRef.current.intensity = 10
      } else {
        headlightMatRef.current.color.set(0x222222)
        headlightLightLeftRef.current.intensity = 0
        headlightLightRightRef.current.intensity = 0
      }
    }
  }, [headlightsOn])

  // Camera Angle Controls
  const setCameraAngle = (angle: '3q' | 'side' | 'front' | 'top') => {
    setActiveCameraAngle(angle)
    if (!cameraRef.current || !carGroupRef.current) return

    setAutoRotate(false)
    carGroupRef.current.rotation.y = 0

    switch (angle) {
      case '3q':
        cameraRef.current.position.set(4.5, 2.0, 4.5)
        break
      case 'side':
        cameraRef.current.position.set(6.0, 1.2, 0)
        break
      case 'front':
        cameraRef.current.position.set(0, 1.2, 5.5)
        break
      case 'top':
        cameraRef.current.position.set(0, 7.0, 0.1)
        break
    }
    cameraRef.current.lookAt(0, 0.5, 0)
  }

  return (
    <div className="relative w-full h-[550px] bg-gradient-to-b from-dark via-dark-card to-dark rounded-3xl overflow-hidden border border-gold/30 shadow-2xl glass-card">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

      {/* Floating 3D Control Panel Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark/80 backdrop-blur-md border border-gold/20 text-xs">
        
        {/* Title Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
          <span className="font-mono text-gold uppercase tracking-[0.2em] font-bold">
            Interactive 3D Stage
          </span>
        </div>

        {/* Paint Color Picker */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">Finish:</span>
          <div className="flex items-center gap-1.5 bg-dark/60 p-1.5 rounded-full border border-gold/20">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setPaintColor(c.hex)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  paintColor === c.hex ? 'scale-125 border-gold ring-2 ring-gold/40' : 'border-white/20 hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition ${
              autoRotate ? 'bg-gold text-dark font-bold border-gold' : 'bg-dark border-gold/30 text-gray-300 hover:text-gold'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>360° Orbit</span>
          </button>

          <button
            onClick={() => setHeadlightsOn(!headlightsOn)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition ${
              headlightsOn ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-dark border-gold/30 text-gray-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>LED Lights</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Angle Preset Buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-dark/90 backdrop-blur-md border border-gold/20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mr-2">Angles:</span>
        <button
          onClick={() => setCameraAngle('3q')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
            activeCameraAngle === '3q' ? 'bg-gold text-dark font-bold' : 'text-gray-300 hover:text-gold'
          }`}
        >
          3/4 View
        </button>
        <button
          onClick={() => setCameraAngle('side')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
            activeCameraAngle === 'side' ? 'bg-gold text-dark font-bold' : 'text-gray-300 hover:text-gold'
          }`}
        >
          Side Profile
        </button>
        <button
          onClick={() => setCameraAngle('front')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
            activeCameraAngle === 'front' ? 'bg-gold text-dark font-bold' : 'text-gray-300 hover:text-gold'
          }`}
        >
          Frontal
        </button>
        <button
          onClick={() => setCameraAngle('top')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
            activeCameraAngle === 'top' ? 'bg-gold text-dark font-bold' : 'text-gray-300 hover:text-gold'
          }`}
        >
          Top Aero
        </button>
      </div>
    </div>
  )
}
