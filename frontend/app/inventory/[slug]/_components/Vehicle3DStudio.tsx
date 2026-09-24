'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import {
  Loader2,
  RotateCcw,
  Play,
  Pause,
  MousePointerClick,
  Wrench,
  X,
  RotateCw,
  SunMedium,
  Moon,
  Sparkles,
  Layers,
  Lightbulb,
  Maximize2,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Compass,
  Zap,
  Gauge,
  ShieldAlert,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Car,
  Ruler,
  Crosshair,
  ArrowLeftRight,
  ArrowUpDown,
  Move
} from 'lucide-react'
import Link from 'next/link'
import { Vehicle, Part, PartCategory } from '../../../../lib/types'
import { API_BASE_URL } from '../../../../lib/api'

// ---------------------------------------------------------------------------
// Luxury Paint Palettes & Real Clearcoat Shaders
// ---------------------------------------------------------------------------
const LUXURY_PAINTS = [
  { name: 'Apex Gold', hex: '#C9A227', metallic: 0.85, roughness: 0.22, clearcoat: 1.0 },
  { name: 'Midnight Onyx', hex: '#0A0A0E', metallic: 0.92, roughness: 0.14, clearcoat: 1.0 },
  { name: 'Giallo Auge', hex: '#E5A910', metallic: 0.75, roughness: 0.20, clearcoat: 1.0 },
  { name: 'Rosso Corsa', hex: '#A81418', metallic: 0.70, roughness: 0.18, clearcoat: 1.0 },
  { name: 'Verde Mantis', hex: '#00A843', metallic: 0.80, roughness: 0.18, clearcoat: 1.0 },
  { name: 'Viola SE30', hex: '#58157D', metallic: 0.88, roughness: 0.20, clearcoat: 1.0 },
  { name: 'Blu Nethuns', hex: '#006EAE', metallic: 0.82, roughness: 0.18, clearcoat: 1.0 },
  { name: 'Glacier Pearl', hex: '#E0E4E8', metallic: 0.50, roughness: 0.12, clearcoat: 1.0 },
]

const LIGHTING_THEMES = [
  { id: 'gold', label: 'Apex Gold Studio', bg: 0x050508, floorColor: 0x111118, rimColor: 0xc9a227, icon: Sparkles },
  { id: 'stealth', label: 'Midnight Stealth', bg: 0x030305, floorColor: 0x08080c, rimColor: 0x4a779d, icon: Moon },
  { id: 'cyber', label: 'Cyberpunk Neon', bg: 0x06020c, floorColor: 0x0a0515, rimColor: 0xec4899, icon: SunMedium },
  { id: 'daylight', label: 'Daylight High-Key', bg: 0x0a0d14, floorColor: 0x141824, rimColor: 0x38bdf8, icon: Sliders },
] as const

type LightingThemeId = typeof LIGHTING_THEMES[number]['id']

interface CameraPreset {
  id: string
  label: string
  pos: THREE.Vector3
  target: THREE.Vector3
}

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'hero', label: 'Hero 3/4', pos: new THREE.Vector3(3.8, 1.8, 5.2), target: new THREE.Vector3(0, 0.4, 0) },
  { id: 'top', label: 'Top View MCP', pos: new THREE.Vector3(0, 8.2, 0.01), target: new THREE.Vector3(0, 0, 0) },
  { id: 'front', label: 'Front 0°', pos: new THREE.Vector3(0, 1.15, 5.6), target: new THREE.Vector3(0, 0.5, 0) },
  { id: 'side', label: 'Profile 90°', pos: new THREE.Vector3(5.6, 1.1, 0), target: new THREE.Vector3(0, 0.45, 0) },
  { id: 'rear', label: 'Rear Aero 180°', pos: new THREE.Vector3(0, 1.3, -5.6), target: new THREE.Vector3(0, 0.5, 0) },
  { id: 'cockpit', label: 'Cockpit Driver', pos: new THREE.Vector3(0.22, 1.05, 0.12), target: new THREE.Vector3(0, 0.9, 1.4) },
]

export type VehicleArchetype = 'suv' | 'supercar' | 'sedan' | 'coupe'

export function detectArchetype(vehicle?: Vehicle): VehicleArchetype {
  const custom = ((vehicle?.specsJson as any)?.archetype3d || '').toLowerCase()
  if (custom === 'suv' || custom === 'supercar' || custom === 'sedan' || custom === 'coupe') {
    return custom as VehicleArchetype
  }
  const body = (vehicle?.bodyType || (vehicle?.specsJson as any)?.bodyType || '').toLowerCase()
  const make = (vehicle?.make || '').toLowerCase()
  const model = (vehicle?.model || '').toLowerCase()

  if (
    body.includes('suv') ||
    body.includes('4x4') ||
    body.includes('crossover') ||
    body.includes('off-road') ||
    model.includes('g-class') ||
    model.includes('g63') ||
    model.includes('g 63') ||
    model.includes('urus') ||
    model.includes('cullinan') ||
    model.includes('range rover') ||
    model.includes('defender') ||
    model.includes('cayenne') ||
    model.includes('bentayga') ||
    model.includes('dbx')
  ) {
    return 'suv'
  }

  if (
    body.includes('sedan') ||
    body.includes('saloon') ||
    body.includes('limousine') ||
    make.includes('rolls') ||
    model.includes('phantom') ||
    model.includes('ghost') ||
    model.includes('maybach') ||
    model.includes('flying spur')
  ) {
    return 'sedan'
  }

  // 3. Supercar / Hypercar priority check
  if (
    make.includes('lamborghini') ||
    make.includes('ferrari') ||
    make.includes('mclaren') ||
    make.includes('bugatti') ||
    make.includes('pagani') ||
    make.includes('koenigsegg') ||
    model.includes('aventador') ||
    model.includes('huracan') ||
    model.includes('revuelto') ||
    model.includes('sf90') ||
    model.includes('296') ||
    model.includes('f8') ||
    model.includes('chiron') ||
    model.includes('senna') ||
    model.includes('p1') ||
    model.includes('720s') ||
    model.includes('750s') ||
    body.includes('supercar') ||
    body.includes('hypercar')
  ) {
    return 'supercar'
  }

  // 4. GT Coupe (Porsche 911, Aston Martin DBS, etc.)
  if (
    body.includes('coupe') ||
    make.includes('porsche') ||
    model.includes('911') ||
    model.includes('gt3') ||
    model.includes('vantage') ||
    model.includes('dbs') ||
    model.includes('roma') ||
    model.includes('m8')
  ) {
    return 'coupe'
  }

  return 'supercar'
}

export function resolveVehicleModelUrl(vehicle?: Vehicle): string {
  const explicit = vehicle?.model3dUrl || (vehicle?.specsJson as any)?.model3dUrl
  if (explicit) return explicit

  const explicitArchetype = ((vehicle?.specsJson as any)?.archetype3d || '').toLowerCase()
  if (explicitArchetype === 'suv') return '/models/suv.glb'
  if (explicitArchetype === 'sedan') return '/models/sedan.glb'
  if (explicitArchetype === 'coupe') return '/models/coupe.glb'
  if (explicitArchetype === 'mclaren') return '/models/mclaren.glb'
  if (explicitArchetype === 'mercedes') return '/models/mercedes.glb'
  if (explicitArchetype === 'supercar') return '/models/CarConcept.glb'

  const slug = (vehicle?.slug || '').toLowerCase()
  const make = (vehicle?.make || '').toLowerCase()
  const model = (vehicle?.model || '').toLowerCase()
  const body = (vehicle?.bodyType || (vehicle?.specsJson as any)?.bodyType || '').toLowerCase()

  // 1. Ferrari SF90 Stradale & Italian Thoroughbreds
  if (make.includes('ferrari') || model.includes('sf90') || slug.includes('ferrari')) {
    return '/models/ferrari.glb'
  }

  // 2. Lamborghini Aventador SVJ & Flagship Hypercars
  if (model.includes('aventador') || model.includes('huracan') || model.includes('revuelto') || slug.includes('aventador')) {
    return '/models/CarConcept.glb'
  }

  // 3. Aston Martin DBS Superleggera & British GT / McLaren
  if (make.includes('aston') || model.includes('dbs') || model.includes('vantage') || make.includes('mclaren')) {
    return '/models/mclaren.glb'
  }

  // 4. Porsche 911 GT3 / Sport Coupes
  if (make.includes('porsche') || model.includes('911') || model.includes('gt3') || slug.includes('porsche')) {
    return '/models/coupe.glb'
  }

  // 5. Luxury SUVs (Mercedes-Benz G-Class, Lamborghini Urus, Range Rover, Cullinan)
  if (
    body.includes('suv') ||
    body.includes('4x4') ||
    model.includes('g-class') ||
    model.includes('g63') ||
    model.includes('g 63') ||
    model.includes('urus') ||
    model.includes('cullinan') ||
    model.includes('defender') ||
    model.includes('range rover')
  ) {
    return '/models/suv.glb'
  }

  // 6. Stately Luxury Sedans (Rolls-Royce Phantom, Ghost, Maybach, Flying Spur)
  if (
    body.includes('sedan') ||
    body.includes('saloon') ||
    body.includes('limousine') ||
    make.includes('rolls') ||
    model.includes('phantom') ||
    model.includes('ghost') ||
    model.includes('maybach')
  ) {
    return '/models/sedan.glb'
  }

  // 7. Mercedes-Benz Grand Roadster / GT
  if (make.includes('mercedes') || make.includes('benz')) {
    return '/models/mercedes.glb'
  }

  // Default fallback to high-poly concept
  return '/models/CarConcept.glb'
}

interface ArchetypeCADSpecs {
  lengthMm: number
  widthMm: number
  heightMm: number
  wheelbaseMm: number
  frontTrackMm: number
  rearTrackMm: number
  weightDistribution: string
  dragCoefficient: string
  groundClearanceMm: number
  archetypeLabel: string
}

const ARCHETYPE_CAD_SPECS: Record<VehicleArchetype, ArchetypeCADSpecs> = {
  suv: {
    lengthMm: 4817,
    widthMm: 1984,
    heightMm: 1969,
    wheelbaseMm: 2890,
    frontTrackMm: 1654,
    rearTrackMm: 1654,
    weightDistribution: '51% FRONT • 49% REAR',
    dragCoefficient: 'Cd 0.54 (Aerodynamic Aprons)',
    groundClearanceMm: 241,
    archetypeLabel: 'Luxury High-Stance 4x4 Off-Road SUV',
  },
  supercar: {
    lengthMm: 4780,
    widthMm: 2030,
    heightMm: 1136,
    wheelbaseMm: 2700,
    frontTrackMm: 1720,
    rearTrackMm: 1680,
    weightDistribution: '43% FRONT • 57% REAR (Mid-Engine)',
    dragCoefficient: 'Cd 0.33 (ALA Active Aero)',
    groundClearanceMm: 100,
    archetypeLabel: 'Exotic Mid-Engine Hypercar',
  },
  sedan: {
    lengthMm: 5762,
    widthMm: 2018,
    heightMm: 1646,
    wheelbaseMm: 3552,
    frontTrackMm: 1687,
    rearTrackMm: 1671,
    weightDistribution: '50% FRONT • 50% REAR',
    dragCoefficient: 'Cd 0.38 (Acoustic Double-Glaze)',
    groundClearanceMm: 150,
    archetypeLabel: 'Flagship Executive Stately Saloon',
  },
  coupe: {
    lengthMm: 4573,
    widthMm: 1900,
    heightMm: 1322,
    wheelbaseMm: 2457,
    frontTrackMm: 1591,
    rearTrackMm: 1557,
    weightDistribution: '38% FRONT • 62% REAR (Rear-Engine)',
    dragCoefficient: 'Cd 0.32 (Active DRS Wing)',
    groundClearanceMm: 105,
    archetypeLabel: 'Rear-Engine High-Revving GT Coupe',
  },
}

interface PartHotspot3D {
  id: string
  label: string
  category: string
  pos: THREE.Vector3
  description: string
  stat: string
}

const DEFAULT_HOTSPOTS_3D: PartHotspot3D[] = [
  { id: 'aero-splitter', label: 'Active Carbon Front Splitter', category: 'exterior-carbon', pos: new THREE.Vector3(0, 0.35, 2.35), description: 'High-downforce autoclaved carbon fiber splitter with dynamic ground-effect venturis.', stat: '+140kg Front Downforce' },
  { id: 'brakes-ceramic', label: 'Brembo Carbon-Ceramic Matrix', category: 'brakes', pos: new THREE.Vector3(1.05, 0.42, 1.45), description: '420mm cross-drilled carbon-silicon carbide rotors with 8-piston monobloc calipers.', stat: '100-0 km/h in 29.5m' },
  { id: 'cockpit-interior', label: 'Bespoke Alcantara & Carbon Cockpit', category: 'interior-comfort', pos: new THREE.Vector3(0.1, 1.08, 0.1), description: 'Hand-stitched Italian leather, forged carbon console, and digital telemetry display.', stat: 'Bespoke Craftsmanship' },
  { id: 'powertrain-engine', label: 'V12 Powertrain & Dynamic Induction', category: 'engine-exhaust', pos: new THREE.Vector3(0, 0.92, -1.1), description: 'Naturally aspirated or twin-turbocharged powerplant with valvetronic acoustic mapping.', stat: 'Instant 9000 RPM Throttle' },
  { id: 'active-rear-wing', label: 'Aero Vectoring Carbon Rear Wing', category: 'exterior-carbon', pos: new THREE.Vector3(0, 1.42, -2.25), description: 'Hydraulically articulated double-element carbon wing with DRS drag reduction.', stat: '850kg High-Speed Load' },
]

interface Vehicle3DStudioProps {
  vehicle?: Vehicle
  vehicleName?: string
}

export default function Vehicle3DStudio({ vehicle, vehicleName }: Vehicle3DStudioProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  // Derive vehicle display identity first
  const displayName = vehicleName || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '2022 Lamborghini Aventador LP 780-4 Ultimae')
  const make = (vehicle?.make || 'Lamborghini').toLowerCase()
  const archetype = detectArchetype(vehicle)
  const cadSpecs = ARCHETYPE_CAD_SPECS[archetype]
  const isSupercar = archetype === 'supercar'

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing WebGL 3D Studio...')
  const [modelType, setModelType] = useState<'glb-real' | 'sculpt-bespoke'>('sculpt-bespoke')
  const [topViewBlueprint, setTopViewBlueprint] = useState(false)
  const [showDimensions, setShowDimensions] = useState(true)

  const resolveInitialPaint = () => {
    const col = (vehicle?.exteriorColor || '').toLowerCase()
    if (col.includes('red') || col.includes('corsa') || col.includes('rosso')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Rosso Corsa') || LUXURY_PAINTS[0]
    }
    if (col.includes('black') || col.includes('onyx') || col.includes('dark') || col.includes('night') || col.includes('phantom')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Midnight Onyx') || LUXURY_PAINTS[0]
    }
    if (col.includes('green') || col.includes('mantis') || col.includes('verde')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Verde Mantis') || LUXURY_PAINTS[0]
    }
    if (col.includes('yellow') || col.includes('auge') || col.includes('giallo')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Giallo Auge') || LUXURY_PAINTS[0]
    }
    if (col.includes('blue') || col.includes('nethuns') || col.includes('blu')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Blu Nethuns') || LUXURY_PAINTS[0]
    }
    if (col.includes('white') || col.includes('pearl') || col.includes('glacier')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Glacier Pearl') || LUXURY_PAINTS[0]
    }
    if (col.includes('purple') || col.includes('viola')) {
      return LUXURY_PAINTS.find((p) => p.name === 'Viola SE30') || LUXURY_PAINTS[0]
    }
    return LUXURY_PAINTS[0]
  }

  // Interactive controls state
  const [currentPaint, setCurrentPaint] = useState(resolveInitialPaint)
  const [lightingTheme, setLightingTheme] = useState<LightingThemeId>(() => {
    return make.includes('rolls') ? 'stealth' : 'gold'
  })
  const [activeCameraPreset, setActiveCameraPreset] = useState<string>('hero')
  const [wireframeMode, setWireframeMode] = useState(false)
  const [headlightsOn, setHeadlightsOn] = useState(true)
  const [underglowOn, setUnderglowOn] = useState(true)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [hoodOpen, setHoodOpen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [engineRunning, setEngineRunning] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<PartHotspot3D | null>(null)
  const [hotspotParts, setHotspotParts] = useState<Part[]>([])
  const [partsLoading, setPartsLoading] = useState(false)

  // Three.js Scene References
  const threeRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    carGroup: THREE.Group
    paintMeshes: THREE.Mesh[]
    doorLeft?: THREE.Object3D | null
    doorRight?: THREE.Object3D | null
    hood?: THREE.Object3D | null
    wheels: THREE.Object3D[]
    headlightSpots: THREE.SpotLight[]
    underglowLights: THREE.PointLight[]
    exhaustFlames: THREE.Mesh[]
    floorMesh: THREE.Mesh
    animFrame: number
    targetCamPos: THREE.Vector3 | null
    targetCamLookAt: THREE.Vector3 | null
    wireframeMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>
  } | null>(null)

  // Telemetry Specs
  const specs = {
    power: vehicle?.horsepower ? `${vehicle.horsepower} HP` : isSupercar ? '770 HP' : '585 HP',
    acceleration: vehicle?.acceleration ? `${vehicle.acceleration}s` : isSupercar ? '2.8s (0-100)' : '4.5s (0-100)',
    topSpeed: vehicle?.topSpeed ? `${vehicle.topSpeed} km/h` : isSupercar ? '355 km/h' : '240 km/h',
    engine: vehicle?.engine || (isSupercar ? '6.5L Naturally Aspirated V12' : '4.0L Twin-Turbo V8 AMG'),
    transmission: vehicle?.transmission || (isSupercar ? '7-Speed Dual-Clutch ISR' : 'AMG SPEEDSHIFT 9G-Tronic'),
  }

  // ---------------------------------------------------------------------------
  // Scene Initialization & Dynamic Vehicle Model Resolution
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth || 1200
    const height = container.clientHeight || 650

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 2. Scene & Fog
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x060608)
    scene.fog = new THREE.FogExp2(0x060608, 0.045)

    // 3. Camera & Controls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(3.8, 1.8, 5.2)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.02 // Don't clip beneath floor
    controls.minDistance = 1.2
    controls.maxDistance = 12.0
    controls.target.set(0, 0.4, 0)

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const mainKeyLight = new THREE.DirectionalLight(0xfffaed, 2.4)
    mainKeyLight.position.set(5, 8, 4)
    mainKeyLight.castShadow = true
    mainKeyLight.shadow.mapSize.width = 2048
    mainKeyLight.shadow.mapSize.height = 2048
    mainKeyLight.shadow.bias = -0.0001
    scene.add(mainKeyLight)

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.4)
    fillLight.position.set(-5, 6, -4)
    scene.add(fillLight)

    const rimLight = new THREE.SpotLight(0xc9a227, 4.2, 16, Math.PI / 4, 0.5)
    rimLight.position.set(0, 6, -5)
    scene.add(rimLight)

    // Overhead soft light for TopView CAD inspection
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8)
    topLight.position.set(0, 10, 0)
    scene.add(topLight)

    // 5. Luxury Turntable Floor
    const floorGeo = new THREE.CylinderGeometry(5.4, 5.4, 0.12, 64)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c12,
      roughness: 0.18,
      metalness: 0.88,
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.position.y = -0.06
    floorMesh.receiveShadow = true
    scene.add(floorMesh)

    // Turntable Halo Ring
    const haloGeo = new THREE.RingGeometry(4.8, 5.05, 64)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xc9a227, side: THREE.DoubleSide })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.002
    scene.add(halo)

    // 6. Car Hierarchy Setup
    const carGroup = new THREE.Group()
    scene.add(carGroup)

    const paintMeshes: THREE.Mesh[] = []
    const wheels: THREE.Object3D[] = []
    const headlightSpots: THREE.SpotLight[] = []
    const underglowLights: THREE.PointLight[] = []
    const exhaustFlames: THREE.Mesh[] = []
    let doorLeft: THREE.Object3D | null = null
    let doorRight: THREE.Object3D | null = null
    let hood: THREE.Object3D | null = null

    // Underglow point lights beneath the chassis
    const underglowL = new THREE.PointLight(0xc9a227, 2.5, 4.0)
    underglowL.position.set(0.8, 0.15, 0)
    scene.add(underglowL)
    underglowLights.push(underglowL)

    const underglowR = new THREE.PointLight(0xc9a227, 2.5, 4.0)
    underglowR.position.set(-0.8, 0.15, 0)
    scene.add(underglowR)
    underglowLights.push(underglowR)

    // Headlight Spotlights pointing forward
    const hlSpotL = new THREE.SpotLight(0xffffff, 3.8, 18, Math.PI / 6, 0.3, 1.2)
    hlSpotL.position.set(0.65, 0.8, 2.4)
    hlSpotL.target.position.set(0.65, 0, 8.0)
    scene.add(hlSpotL)
    scene.add(hlSpotL.target)
    headlightSpots.push(hlSpotL)

    const hlSpotR = new THREE.SpotLight(0xffffff, 3.8, 18, Math.PI / 6, 0.3, 1.2)
    hlSpotR.position.set(-0.65, 0.8, 2.4)
    hlSpotR.target.position.set(-0.65, 0, 8.0)
    scene.add(hlSpotR)
    scene.add(hlSpotR.target)
    headlightSpots.push(hlSpotR)

    // Base Paint Material
    const paintMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentPaint.hex),
      metalness: currentPaint.metallic,
      roughness: currentPaint.roughness,
      clearcoat: currentPaint.clearcoat,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    })

    // Carbon fiber material for splitters, diffuser, aero
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.35,
      metalness: 0.85,
    })

    // Glass material for windshield and windows
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111625,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.85,
      ior: 1.5,
    })

    // Chrome & Metallic Accent Material
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.06,
    })

    // Satin Black Trim Material
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.5,
      metalness: 0.5,
    })

    // Glowing LED material
    const ledWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const ledAmberMat = new THREE.MeshBasicMaterial({ color: 0xffa500 })
    const ledRedMat = new THREE.MeshBasicMaterial({ color: 0xff1e28 })

    // -------------------------------------------------------------------------
    // ARCHETYPE 1: LUXURY SUV & 4X4 (MERCEDES-BENZ G-CLASS / G-WAGON / URUS)
    // -------------------------------------------------------------------------
    const buildSUVVehicleSculpt = () => {
      setModelType('sculpt-bespoke')
      setLoadingText('Assembling authentic high-stance Luxury SUV digital twin...')

      // 1. Elevated Ladder Chassis & Undercarriage
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 4.4), trimMat)
      chassis.position.set(0, 0.45, 0)
      carGroup.add(chassis)

      // 2. Main Lower SUV Body & High Shoulder Line
      const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.76, 4.45), paintMaterial)
      mainBody.position.set(0, 0.86, 0.05)
      mainBody.castShadow = true
      carGroup.add(mainBody)
      paintMeshes.push(mainBody)

      // Power-dome Hood with Center Crease
      const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 1.45), paintMaterial)
      hoodMesh.position.set(0, 1.3, 1.4)
      hoodMesh.castShadow = true
      carGroup.add(hoodMesh)
      paintMeshes.push(hoodMesh)
      hood = hoodMesh

      // Signature G-Class Top Fender Amber Turn Signal Repeaters
      const turnL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.22), ledAmberMat)
      turnL.position.set(0.86, 1.34, 1.7)
      carGroup.add(turnL)

      const turnR = turnL.clone()
      turnR.position.x = -0.86
      carGroup.add(turnR)

      // 3. Upright Iconic G-Wagon Cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.96, 2.75), paintMaterial)
      cabin.position.set(0, 1.68, -0.32)
      cabin.castShadow = true
      carGroup.add(cabin)
      paintMeshes.push(cabin)

      // Tinted Glass Windows (Front, Sides, Rear)
      const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.78, 0.06), glassMat)
      frontWindshield.rotation.x = -0.15
      frontWindshield.position.set(0, 1.72, 0.98)
      carGroup.add(frontWindshield)

      const sideGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 2.5), glassMat)
      sideGlassL.position.set(0.9, 1.7, -0.32)
      carGroup.add(sideGlassL)

      const sideGlassR = sideGlassL.clone()
      sideGlassR.position.x = -0.9
      carGroup.add(sideGlassR)

      const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.74, 0.06), glassMat)
      rearWindow.position.set(0, 1.7, -1.71)
      carGroup.add(rearWindow)

      // Flat Roof with Dual Longitudinal Roof Rails
      const railL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 16), chromeMat)
      railL.rotation.x = Math.PI / 2
      railL.position.set(0.75, 2.22, -0.32)
      carGroup.add(railL)

      const railR = railL.clone()
      railR.position.x = -0.75
      carGroup.add(railR)

      // 4. Muscular Flared Boxy Wheel Arches (AMG Fender Flares)
      const archFL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.44, 1.15), paintMaterial)
      archFL.position.set(1.04, 0.75, 1.4)
      carGroup.add(archFL)
      paintMeshes.push(archFL)

      const archFR = archFL.clone()
      archFR.position.x = -1.04
      carGroup.add(archFR)
      paintMeshes.push(archFR)

      const archRL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.44, 1.15), paintMaterial)
      archRL.position.set(1.04, 0.75, -1.35)
      carGroup.add(archRL)
      paintMeshes.push(archRL)

      const archRR = archRL.clone()
      archRR.position.x = -1.04
      carGroup.add(archRR)
      paintMeshes.push(archRR)

      // 5. Upright Panamericana Radiator Grille & Mercedes Star
      const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.58, 0.12), chromeMat)
      grilleFrame.position.set(0, 0.94, 2.28)
      carGroup.add(grilleFrame)

      const grilleInner = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.5, 0.14), trimMat)
      grilleInner.position.set(0, 0.94, 2.28)
      carGroup.add(grilleInner)

      // Vertical Panamericana chrome slats
      for (let i = -4; i <= 4; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.46, 0.04), chromeMat)
        slat.position.set(i * 0.12, 0.94, 2.36)
        carGroup.add(slat)
      }

      // Central Star Emblem
      const starCircle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 16, 32), chromeMat)
      starCircle.position.set(0, 0.94, 2.38)
      carGroup.add(starCircle)

      // 6. Dual Iconic Round LED Projector Headlamps with Glowing DRL Halos
      const haloL = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 16, 32), ledWhiteMat)
      haloL.position.set(0.72, 0.94, 2.28)
      carGroup.add(haloL)

      const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), ledWhiteMat)
      bulbL.position.set(0.72, 0.94, 2.26)
      carGroup.add(bulbL)

      const haloR = haloL.clone()
      haloR.position.x = -0.72
      carGroup.add(haloR)

      const bulbR = bulbL.clone()
      bulbR.position.x = -0.72
      carGroup.add(bulbR)

      // 7. Rugged Front Bumper & Skid Plate
      const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.32, 0.45), trimMat)
      bumperFront.position.set(0, 0.46, 2.22)
      carGroup.add(bumperFront)

      const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.46), chromeMat)
      skidPlate.position.set(0, 0.35, 2.24)
      carGroup.add(skidPlate)

      // 8. Heavy-Duty Side Running Boards & AMG Side-Exit Dual Exhausts
      const stepL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 2.4), chromeMat)
      stepL.position.set(1.05, 0.38, 0.02)
      carGroup.add(stepL)

      const stepR = stepL.clone()
      stepR.position.x = -1.05
      carGroup.add(stepR)

      // AMG Dual Side-Exit Exhaust Tips (Left & Right before rear wheels)
      const tipL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16), chromeMat)
      tipL1.rotation.z = Math.PI / 2
      tipL1.position.set(1.08, 0.32, -0.65)
      carGroup.add(tipL1)

      const tipL2 = tipL1.clone()
      tipL2.position.z = -0.76
      carGroup.add(tipL2)

      const tipR1 = tipL1.clone()
      tipR1.position.x = -1.08
      carGroup.add(tipR1)

      const tipR2 = tipL2.clone()
      tipR2.position.x = -1.08
      carGroup.add(tipR2)

      // 9. Iconic Rear-Mounted Full-Size Spare Wheel Carrier
      const spareRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 16, 32), chromeMat)
      spareRing.position.set(0, 1.25, -2.25)
      carGroup.add(spareRing)

      const spareCover = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 32), paintMaterial)
      spareCover.rotation.x = Math.PI / 2
      spareCover.position.set(0, 1.25, -2.23)
      spareCover.castShadow = true
      carGroup.add(spareCover)
      paintMeshes.push(spareCover)

      const spareBadge = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 16, 32), chromeMat)
      spareBadge.position.set(0, 1.25, -2.31)
      carGroup.add(spareBadge)

      // Rear Horizontal Taillights on Bumper
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.06), ledRedMat)
      tailL.position.set(0.68, 0.58, -2.22)
      carGroup.add(tailL)

      const tailR = tailL.clone()
      tailR.position.x = -0.68
      carGroup.add(tailR)

      // 10. Massive 22-Inch AMG Cross-Spoke Wheels with High-Profile Tires & Red Calipers
      const wheelPositions = [
        { x: 1.02, y: 0.54, z: 1.4 },
        { x: -1.02, y: 0.54, z: 1.4 },
        { x: 1.02, y: 0.54, z: -1.35 },
        { x: -1.02, y: 0.54, z: -1.35 },
      ]

      const tireMat = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.85, metalness: 0.15 })
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.25, metalness: 0.95 })
      const caliperMat = new THREE.MeshStandardMaterial({ color: 0xdd121a, roughness: 0.3, metalness: 0.7 })

      wheelPositions.forEach((wp) => {
        const wheelGroup = new THREE.Group()
        wheelGroup.position.set(wp.x, wp.y, wp.z)

        // All-Terrain Thick Tire
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.34, 32), tireMat)
        tire.rotation.z = Math.PI / 2
        tire.castShadow = true
        wheelGroup.add(tire)

        // Rim
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 24), rimMat)
        rim.rotation.z = Math.PI / 2
        wheelGroup.add(rim)

        // Red AMG Caliper
        const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.12), caliperMat)
        caliper.position.set(wp.x > 0 ? -0.08 : 0.08, 0.18, 0)
        wheelGroup.add(caliper)

        carGroup.add(wheelGroup)
        wheels.push(wheelGroup)
      })

      setLoading(false)
    }

    // -------------------------------------------------------------------------
    // ARCHETYPE 2: STATELY EXECUTIVE SALOON (ROLLS-ROYCE PHANTOM / MAYBACH)
    // -------------------------------------------------------------------------
    const buildSedanVehicleSculpt = () => {
      setModelType('sculpt-bespoke')
      setLoadingText('Assembling Stately Executive Saloon architecture...')

      const bodyMain = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.82, 5.2), paintMaterial)
      bodyMain.position.set(0, 0.68, 0)
      bodyMain.castShadow = true
      carGroup.add(bodyMain)
      paintMeshes.push(bodyMain)

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.74, 2.9), paintMaterial)
      cabin.position.set(0, 1.34, -0.3)
      cabin.castShadow = true
      carGroup.add(cabin)
      paintMeshes.push(cabin)

      const glass = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.66, 2.8), glassMat)
      glass.position.set(0, 1.34, -0.3)
      carGroup.add(glass)

      // Imposing Chrome Pantheon Grille
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.72, 0.12), chromeMat)
      grille.position.set(0, 0.74, 2.62)
      carGroup.add(grille)

      // Spirit of Ecstasy Mascot
      const mascot = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 12), chromeMat)
      mascot.position.set(0, 1.16, 2.56)
      carGroup.add(mascot)

      // Stately Wheels
      const wp = [
        { x: 0.98, y: 0.44, z: 1.6 },
        { x: -0.98, y: 0.44, z: 1.6 },
        { x: 0.98, y: 0.44, z: -1.6 },
        { x: -0.98, y: 0.44, z: -1.6 },
      ]
      wp.forEach((p) => {
        const wg = new THREE.Group()
        wg.position.set(p.x, p.y, p.z)
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32), trimMat)
        tire.rotation.z = Math.PI / 2
        wg.add(tire)
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.29, 24), chromeMat)
        rim.rotation.z = Math.PI / 2
        wg.add(rim)
        carGroup.add(wg)
        wheels.push(wg)
      })

      setLoading(false)
    }

    // -------------------------------------------------------------------------
    // ARCHETYPE 3: REAR-ENGINE SPORTS COUPE / GT (PORSCHE 911 / ASTON MARTIN)
    // -------------------------------------------------------------------------
    const buildCoupeVehicleSculpt = () => {
      setModelType('sculpt-bespoke')
      setLoadingText('Assembling Teardrop Aerodynamic GT Coupe architecture...')

      const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.54, 4.4), paintMaterial)
      lowerBody.position.set(0, 0.52, 0)
      lowerBody.castShadow = true
      carGroup.add(lowerBody)
      paintMeshes.push(lowerBody)

      // Sloping aerodynamic flyline cabin
      const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, 2.2, 32), paintMaterial)
      cabin.rotation.x = Math.PI / 2
      cabin.position.set(0, 1.08, -0.25)
      cabin.castShadow = true
      carGroup.add(cabin)
      paintMeshes.push(cabin as any)

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.91, 2.15, 32), glassMat)
      glass.rotation.x = Math.PI / 2
      glass.position.set(0, 1.08, -0.25)
      carGroup.add(glass)

      // Wide muscular rear haunches
      const haunchL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 1.45), paintMaterial)
      haunchL.position.set(0.92, 0.66, -0.92)
      carGroup.add(haunchL)
      paintMeshes.push(haunchL)

      const haunchR = haunchL.clone()
      haunchR.position.x = -0.92
      carGroup.add(haunchR)
      paintMeshes.push(haunchR)

      // Horizontal rear LED light strip
      const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.05, 0.08), ledRedMat)
      lightBar.position.set(0, 0.74, -2.21)
      carGroup.add(lightBar)

      // Sports Wheels
      const wp = [
        { x: 0.95, y: 0.42, z: 1.35 },
        { x: -0.95, y: 0.42, z: 1.35 },
        { x: 0.98, y: 0.44, z: -1.3 },
        { x: -0.98, y: 0.44, z: -1.3 },
      ]
      wp.forEach((p) => {
        const wg = new THREE.Group()
        wg.position.set(p.x, p.y, p.z)
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32), trimMat)
        tire.rotation.z = Math.PI / 2
        wg.add(tire)
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.31, 24), carbonMat)
        rim.rotation.z = Math.PI / 2
        wg.add(rim)
        carGroup.add(wg)
        wheels.push(wg)
      })

      setLoading(false)
    }

    // -------------------------------------------------------------------------
    // ARCHETYPE 4: EXOTIC SUPERCAR / HYPERCAR WEDGE (FALLBACK SCULPT)
    // -------------------------------------------------------------------------
    const buildSupercarVehicleSculpt = () => {
      setModelType('sculpt-bespoke')
      setLoadingText('Assembling Exotic Aerodynamic Hypercar architecture...')

      const lowerWedge = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.48, 4.6), paintMaterial)
      lowerWedge.position.set(0, 0.48, 0)
      lowerWedge.castShadow = true
      carGroup.add(lowerWedge)
      paintMeshes.push(lowerWedge)

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.58, 2.2), glassMat)
      canopy.position.set(0, 0.98, -0.15)
      canopy.castShadow = true
      carGroup.add(canopy)

      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 1.6), paintMaterial)
      roof.position.set(0, 1.28, -0.25)
      carGroup.add(roof)
      paintMeshes.push(roof)

      const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.06, 0.6), carbonMat)
      splitter.position.set(0, 0.22, 2.25)
      carGroup.add(splitter)

      const wing = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.06, 0.45), carbonMat)
      wing.position.set(0, 1.35, -2.2)
      carGroup.add(wing)

      const wp = [
        { x: 1.0, y: 0.38, z: 1.4 },
        { x: -1.0, y: 0.38, z: 1.4 },
        { x: 1.02, y: 0.42, z: -1.4 },
        { x: -1.02, y: 0.42, z: -1.4 },
      ]
      wp.forEach((p) => {
        const wg = new THREE.Group()
        wg.position.set(p.x, p.y, p.z)
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32), trimMat)
        tire.rotation.z = Math.PI / 2
        wg.add(tire)
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.31, 24), carbonMat)
        rim.rotation.z = Math.PI / 2
        wg.add(rim)
        carGroup.add(wg)
        wheels.push(wg)
      })

      setLoading(false)
    }

    // -------------------------------------------------------------------------
    // Model Resolution: Load authentic 3D GLB digital twin for this specific car
    // -------------------------------------------------------------------------
    const glbTarget = resolveVehicleModelUrl(vehicle)
    setLoadingText(`Streaming authentic 3D digital twin for ${displayName}...`)

    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
    loader.setDRACOLoader(dracoLoader)
    loader.setMeshoptDecoder(MeshoptDecoder)

    loader.load(
      glbTarget,
      (gltf) => {
        setModelType('glb-real')
        const model = gltf.scene

        // Auto-center and normalize scale across all different 3D models
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        // Re-center object at local origin
        model.position.x = -center.x
        model.position.z = -center.z
        model.position.y = -box.min.y // place directly on turntable floor

        // Scale normalization: luxury cars are ~4.5m - 5.0m in length
        const maxLen = Math.max(size.x, size.z)
        if (maxLen > 0) {
          const targetLength = archetype === 'suv' || archetype === 'sedan' ? 4.9 : 4.6
          const scaleMultiplier = targetLength / maxLen
          model.scale.multiplyScalar(scaleMultiplier)

          // Readjust ground level after scaling
          const scaledBox = new THREE.Box3().setFromObject(model)
          model.position.y -= scaledBox.min.y
        }

        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            const name = (child.name || '').toLowerCase()
            const matName = (Array.isArray(child.material)
              ? child.material.map((m: any) => m.name).join(' ')
              : (child.material?.name || '')).toLowerCase()

            const isPaintable =
              matName.includes('paint') ||
              matName.includes('body') ||
              matName.includes('carpaint') ||
              matName.includes('lak') ||
              matName.includes('color1') ||
              name.includes('body') ||
              name.includes('paint') ||
              name.includes('door') ||
              name.includes('hood') ||
              name.includes('bonnet') ||
              name.includes('fender') ||
              name.includes('bumper') ||
              name.includes('roof') ||
              name.includes('panel')

            if (isPaintable) {
              child.material = paintMaterial.clone()
              paintMeshes.push(child)
            }

            if (name.includes('door') && (name.includes('l') || name.includes('left'))) {
              doorLeft = child
            }
            if (name.includes('door') && (name.includes('r') || name.includes('right'))) {
              doorRight = child
            }
            if (name.includes('hood') || name.includes('bonnet')) {
              hood = child
            }
            if (name.includes('wheel') || name.includes('rim') || matName.includes('rim') || matName.includes('tire')) {
              wheels.push(child)
            }
          }
        })

        carGroup.add(model)
        setLoading(false)
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100))
        }
      },
      (err) => {
        console.warn('GLB load error, falling back to procedural digital twin:', err)
        if (archetype === 'suv') buildSUVVehicleSculpt()
        else if (archetype === 'sedan') buildSedanVehicleSculpt()
        else if (archetype === 'coupe') buildCoupeVehicleSculpt()
        else buildSupercarVehicleSculpt()
      }
    )

    // Store state in ref
    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      carGroup,
      paintMeshes,
      doorLeft,
      doorRight,
      hood,
      wheels,
      headlightSpots,
      underglowLights,
      exhaustFlames,
      floorMesh,
      animFrame: 0,
      targetCamPos: null,
      targetCamLookAt: null,
      wireframeMaterials: new Map(),
    }

    // -------------------------------------------------------------------------
    // Animation & Render Loop
    // -------------------------------------------------------------------------
    let angle = 0
    const animate = () => {
      const ref = threeRef.current
      if (!ref) return

      ref.controls.update()

      // Smooth camera interpolation
      if (ref.targetCamPos) {
        ref.camera.position.lerp(ref.targetCamPos, 0.08)
        if (ref.camera.position.distanceTo(ref.targetCamPos) < 0.05) {
          ref.targetCamPos = null
        }
      }
      if (ref.targetCamLookAt) {
        ref.controls.target.lerp(ref.targetCamLookAt, 0.08)
        if (ref.controls.target.distanceTo(ref.targetCamLookAt) < 0.05) {
          ref.targetCamLookAt = null
        }
      }

      // Turntable auto-rotate
      if (autoRotate && ref.carGroup) {
        ref.carGroup.rotation.y += 0.005
      }

      // Engine rumble vibration & exhaust flame flicker
      if (engineRunning) {
        angle += 0.4
        ref.carGroup.position.y = Math.sin(angle) * 0.008
        ref.exhaustFlames.forEach((flame) => {
          flame.visible = true
          flame.scale.set(0.9 + Math.random() * 0.3, 0.8 + Math.random() * 0.5, 0.9 + Math.random() * 0.3)
        })
      } else {
        ref.carGroup.position.y = 0
        ref.exhaustFlames.forEach((flame) => (flame.visible = false))
      }

      ref.renderer.render(ref.scene, ref.camera)
      ref.animFrame = requestAnimationFrame(animate)
    }

    threeRef.current.animFrame = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!mountRef.current || !threeRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      threeRef.current.camera.aspect = w / h
      threeRef.current.camera.updateProjectionMatrix()
      threeRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animFrame)
        renderer.dispose()
      }
    }
  }, [vehicle, displayName, isSupercar, make, archetype])

  // ---------------------------------------------------------------------------
  // Paint Swatch Handler
  // ---------------------------------------------------------------------------
  const handleSelectPaint = (paint: typeof LUXURY_PAINTS[0]) => {
    setCurrentPaint(paint)
    if (!threeRef.current) return
    const color = new THREE.Color(paint.hex)

    threeRef.current.paintMeshes.forEach((mesh) => {
      if (mesh.material && (mesh.material as any).color) {
        ;(mesh.material as any).color.set(color)
        if ('metalness' in mesh.material) (mesh.material as any).metalness = paint.metallic
        if ('roughness' in mesh.material) (mesh.material as any).roughness = paint.roughness
      }
    })

    // Match underglow light to paint color
    threeRef.current.underglowLights.forEach((light) => light.color.set(color))
  }

  // ---------------------------------------------------------------------------
  // Camera Preset Navigation & TopView MCP
  // ---------------------------------------------------------------------------
  const handleCameraPreset = (preset: CameraPreset) => {
    setActiveCameraPreset(preset.id)
    if (!threeRef.current) return

    if (preset.id === 'top') {
      setTopViewBlueprint(true)
      setAutoRotate(false)
      if (threeRef.current.carGroup) {
        threeRef.current.carGroup.rotation.y = 0
      }
      threeRef.current.camera.up.set(0, 0, -1)
      threeRef.current.controls.target.set(0, 0, 0)
      threeRef.current.targetCamPos = new THREE.Vector3(0, 8.2, 0.001)
      threeRef.current.targetCamLookAt = new THREE.Vector3(0, 0, 0)
    } else {
      setTopViewBlueprint(false)
      threeRef.current.camera.up.set(0, 1, 0)
      threeRef.current.targetCamPos = preset.pos.clone()
      threeRef.current.targetCamLookAt = preset.target.clone()
    }
  }

  // ---------------------------------------------------------------------------
  // Lighting Theme Switcher
  // ---------------------------------------------------------------------------
  const handleLightingTheme = (themeId: LightingThemeId) => {
    setLightingTheme(themeId)
    if (!threeRef.current) return
    const theme = LIGHTING_THEMES.find((t) => t.id === themeId)
    if (!theme) return

    threeRef.current.scene.background = new THREE.Color(theme.bg)
    if (threeRef.current.scene.fog) {
      threeRef.current.scene.fog.color = new THREE.Color(theme.bg)
    }
    ;(threeRef.current.floorMesh.material as THREE.MeshStandardMaterial).color.set(theme.floorColor)
  }

  // ---------------------------------------------------------------------------
  // Animated Doors & Hood Toggle
  // ---------------------------------------------------------------------------
  const handleToggleDoors = () => {
    const nextState = !doorsOpen
    setDoorsOpen(nextState)
    if (!threeRef.current) return

    const { doorLeft, doorRight } = threeRef.current
    if (doorLeft) {
      doorLeft.rotation.z = nextState ? 0.95 : 0
      doorLeft.rotation.x = nextState ? 0.35 : 0
    }
    if (doorRight) {
      doorRight.rotation.z = nextState ? -0.95 : 0
      doorRight.rotation.x = nextState ? 0.35 : 0
    }
  }

  const handleToggleHood = () => {
    const nextState = !hoodOpen
    setHoodOpen(nextState)
    if (!threeRef.current) return

    const { hood } = threeRef.current
    if (hood) {
      hood.rotation.x = nextState ? -0.85 : 0
    }
  }

  // ---------------------------------------------------------------------------
  // Wireframe / X-Ray Engineering Inspection
  // ---------------------------------------------------------------------------
  const handleToggleWireframe = () => {
    const next = !wireframeMode
    setWireframeMode(next)
    if (!threeRef.current) return

    const ref = threeRef.current

    if (next) {
      // Traverse ALL meshes in the car for authentic full-chassis X-Ray
      ref.carGroup.traverse((child: any) => {
        if (child.isMesh) {
          ref.wireframeMaterials.set(child, child.material)

          const name = (child.name || '').toLowerCase()
          const matName = (Array.isArray(child.material)
            ? child.material.map((m: any) => m.name).join(' ')
            : (child.material?.name || '')).toLowerCase()

          const isInternal =
            name.includes('engine') ||
            name.includes('brake') ||
            name.includes('caliper') ||
            name.includes('disc') ||
            name.includes('susp') ||
            name.includes('steering') ||
            name.includes('chassis') ||
            matName.includes('mechanical') ||
            matName.includes('brake') ||
            matName.includes('disc') ||
            matName.includes('caliper')

          if (isInternal) {
            // Internal mechanicals glow with high-contrast Apex Gold alloy
            child.material = new THREE.MeshStandardMaterial({
              color: 0xc9a227,
              emissive: 0xc9a227,
              emissiveIntensity: 0.6,
              roughness: 0.3,
              metalness: 0.8,
            })
          } else {
            // Outer body, glass, and shell become transparent cyan holographic wireframe
            child.material = new THREE.MeshStandardMaterial({
              color: 0x00f0ff,
              emissive: 0x004466,
              emissiveIntensity: 0.25,
              wireframe: true,
              transparent: true,
              opacity: 0.35,
              roughness: 0.2,
              metalness: 0.8,
            })
          }
        }
      })
    } else {
      // Restore original materials on all meshes cleanly
      ref.carGroup.traverse((child: any) => {
        if (child.isMesh) {
          const original = ref.wireframeMaterials.get(child)
          if (original) {
            child.material = original
          }
        }
      })
      ref.wireframeMaterials.clear()
    }
  }

  // ---------------------------------------------------------------------------
  // Headlights & Underglow Toggle
  // ---------------------------------------------------------------------------
  const handleToggleHeadlights = () => {
    const next = !headlightsOn
    setHeadlightsOn(next)
    threeRef.current?.headlightSpots.forEach((spot) => (spot.visible = next))
  }

  const handleToggleUnderglow = () => {
    const next = !underglowOn
    setUnderglowOn(next)
    threeRef.current?.underglowLights.forEach((light) => (light.visible = next))
  }

  // ---------------------------------------------------------------------------
  // 3D Spatial Part Hotspot Selection
  // ---------------------------------------------------------------------------
  const handleSelectHotspot = (hs: PartHotspot3D) => {
    setActiveHotspot(hs)
    if (!threeRef.current) return

    const target = hs.pos.clone()
    const offset = new THREE.Vector3(target.x > 0 ? 1.8 : -1.8, target.y + 0.8, target.z + 1.8)
    threeRef.current.targetCamPos = offset
    threeRef.current.targetCamLookAt = target

    setPartsLoading(true)
    fetch(`${API_BASE_URL}/parts?category=${hs.category}&limit=4`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHotspotParts(d?.data || []))
      .catch(() => setHotspotParts([]))
      .finally(() => setPartsLoading(false))
  }

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden border border-white/10 bg-[#060608] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
      
      {/* ── Studio Header Bar ────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-20 p-5 sm:p-7 flex flex-wrap items-start justify-between gap-4 pointer-events-none bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] font-bold">
              Interactive 3D Studio & Engineering Stage
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-[#A0A0A0]">
              {cadSpecs.archetypeLabel}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Inspect {displayName}
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-0.5">
            Drag to orbit · scroll to zoom · use TopView MCP for CAD blueprint telemetry
          </p>
        </div>

        {/* Top Center-Right: Mode Control Panel (MCP) */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* MCP Preset Bar */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl">
            <button
              onClick={() => handleCameraPreset(CAMERA_PRESETS.find((p) => p.id === 'top')!)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all ${
                activeCameraPreset === 'top'
                  ? 'bg-[#C9A227] text-black shadow-[0_0_15px_rgba(201,162,39,0.6)]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Activate Overhead CAD Blueprint Mode Control Panel"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>TOP VIEW MCP</span>
              {activeCameraPreset === 'top' && (
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleCameraPreset(CAMERA_PRESETS.find((p) => p.id === 'hero')!)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all ${
                activeCameraPreset === 'hero'
                  ? 'bg-[#C9A227] text-black shadow-[0_0_15px_rgba(201,162,39,0.6)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Return to 3D Perspective Orbit"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D ORBIT</span>
            </button>

            <button
              onClick={() => handleCameraPreset(CAMERA_PRESETS.find((p) => p.id === 'front')!)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${
                activeCameraPreset === 'front'
                  ? 'bg-[#C9A227] text-black shadow-[0_0_15px_rgba(201,162,39,0.6)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              FRONT
            </button>

            <button
              onClick={() => handleCameraPreset(CAMERA_PRESETS.find((p) => p.id === 'side')!)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${
                activeCameraPreset === 'side'
                  ? 'bg-[#C9A227] text-black shadow-[0_0_15px_rgba(201,162,39,0.6)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              SIDE
            </button>

            <button
              onClick={() => handleCameraPreset(CAMERA_PRESETS.find((p) => p.id === 'rear')!)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${
                activeCameraPreset === 'rear'
                  ? 'bg-[#C9A227] text-black shadow-[0_0_15px_rgba(201,162,39,0.6)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              REAR
            </button>
          </div>

          {/* Quick Turntable & Reset */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2.5 rounded-xl border transition-all ${
              autoRotate
                ? 'bg-[#C9A227] text-black border-[#C9A227]'
                : 'bg-black/70 backdrop-blur-xl border-white/10 text-white hover:border-[#C9A227]'
            }`}
            title="Toggle 360° Turntable Rotation"
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleCameraPreset(CAMERA_PRESETS[0])}
            className="p-2.5 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white hover:border-[#C9A227] transition-all"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── WebGL Canvas Container ──────────────────────────────────────── */}
      <div
        ref={mountRef}
        className="w-full h-[600px] sm:h-[700px] cursor-grab active:cursor-grabbing"
      />

      {/* ── TopView MCP Engineering Blueprint HUD Overlay ────────────── */}
      {topViewBlueprint && (
        <div className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between p-6 sm:p-8">
          
          {/* Top Blueprint Header Telemetry */}
          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
            <div className="p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-[#C9A227]/40 shadow-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-ping" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C9A227] block">
                  Top-Down CAD Engineering MCP
                </span>
                <span className="text-xs font-mono text-white/80">
                  Orthographic Blueprint • Scale 1:1 Telemetry
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`px-3 py-2 rounded-xl border text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
                  showDimensions
                    ? 'bg-[#C9A227]/20 border-[#C9A227] text-white'
                    : 'bg-black/70 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Ruler className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{showDimensions ? 'Hide Dimensions' : 'Show Dimensions'}</span>
              </button>
              <button
                onClick={handleToggleWireframe}
                className={`px-3 py-2 rounded-xl border text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
                  wireframeMode
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-black/70 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Wireframe CAD</span>
              </button>
              <button
                onClick={() => handleCameraPreset(CAMERA_PRESETS[0])}
                className="px-3 py-2 rounded-xl bg-white text-black font-bold text-[10px] font-mono uppercase tracking-wider hover:bg-[#C9A227] hover:text-white transition-all shadow-lg"
              >
                Exit to 3D Orbit
              </button>
            </div>
          </div>

          {/* Center Dimension Graphics Overlay */}
          {showDimensions && (
            <div className="relative w-full max-w-2xl mx-auto my-auto py-8">
              {/* Length Dimension Indicator Bar */}
              <div className="flex items-center justify-between text-[#C9A227] text-xs font-mono mb-2">
                <span className="flex items-center gap-1.5 font-bold tracking-widest bg-black/80 px-2.5 py-1 rounded-lg border border-[#C9A227]/30">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  OVERALL LENGTH: {cadSpecs.lengthMm} mm
                </span>
                <span className="text-[10px] text-white/60 tracking-wider bg-black/60 px-2 py-0.5 rounded">
                  WHEELBASE: {cadSpecs.wheelbaseMm} mm
                </span>
              </div>

              {/* Center Crosshair / CoG */}
              <div className="w-full flex items-center justify-center my-4">
                <div className="relative flex items-center justify-center p-3 rounded-full bg-black/70 border border-dashed border-[#C9A227]/50 shadow-[0_0_30px_rgba(201,162,39,0.3)]">
                  <Crosshair className="w-8 h-8 text-[#C9A227] animate-spin-slow" />
                  <span className="absolute -bottom-5 text-[9px] font-mono tracking-widest text-[#C9A227] whitespace-nowrap">
                    CENTER OF GRAVITY (CoG)
                  </span>
                </div>
              </div>

              {/* Width Dimension Indicator Bar */}
              <div className="flex items-center justify-between text-[#C9A227] text-xs font-mono mt-2">
                <span className="flex items-center gap-1.5 font-bold tracking-widest bg-black/80 px-2.5 py-1 rounded-lg border border-[#C9A227]/30">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  OVERALL WIDTH: {cadSpecs.widthMm} mm
                </span>
                <span className="text-[10px] text-white/60 tracking-wider bg-black/60 px-2 py-0.5 rounded">
                  TRACK: F {cadSpecs.frontTrackMm} mm • R {cadSpecs.rearTrackMm} mm
                </span>
              </div>
            </div>
          )}

          {/* Bottom Blueprint Spec Grid Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 pointer-events-auto">
            <div>
              <span className="text-[9px] font-mono uppercase text-white/50 block">Axle Weight Distribution</span>
              <span className="text-xs font-mono text-[#C9A227] font-bold">{cadSpecs.weightDistribution}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-white/50 block">Aerodynamic Drag Factor</span>
              <span className="text-xs font-mono text-white font-bold">{cadSpecs.dragCoefficient}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-white/50 block">Ground Clearance</span>
              <span className="text-xs font-mono text-[#C9A227] font-bold">{cadSpecs.groundClearanceMm} mm</span>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-white/50 block">Digital Twin Architecture</span>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">{modelType === 'glb-real' ? 'Real GLB Mesh' : 'Bespoke CAD Twin'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Overlay ─────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060608] backdrop-blur-md">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#C9A227] border-t-transparent animate-spin" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] mb-2 font-bold">
            {loadingText}
          </span>
          {loadingProgress > 0 && (
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A227] transition-all duration-200"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Left Floating Panel: Materials, Controls & Animations ─────── */}
      <div className="absolute top-28 left-6 z-20 hidden lg:flex flex-col gap-4 max-w-[260px] pointer-events-auto">
        
        {/* Paint Customizer */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold">
              Exterior Lacquer
            </span>
            <span className="text-[10px] font-mono text-white/80">{currentPaint.name}</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {LUXURY_PAINTS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPaint(p)}
                className={`w-11 h-11 rounded-xl transition-all duration-300 relative border flex items-center justify-center ${
                  currentPaint.name === p.name
                    ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : 'border-white/15 hover:border-white/50 hover:scale-105'
                }`}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              >
                {currentPaint.name === p.name && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Part Animations */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold block mb-2">
            Mechanical Controls
          </span>
          <button
            onClick={handleToggleDoors}
            className={`w-full py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center justify-between transition-all ${
              doorsOpen
                ? 'bg-[#C9A227]/20 border-[#C9A227] text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <span>{doorsOpen ? 'Close Doors' : 'Open Doors'}</span>
            <span className={`w-2 h-2 rounded-full ${doorsOpen ? 'bg-[#C9A227]' : 'bg-white/20'}`} />
          </button>

          <button
            onClick={handleToggleHood}
            className={`w-full py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center justify-between transition-all ${
              hoodOpen
                ? 'bg-[#C9A227]/20 border-[#C9A227] text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <span>{hoodOpen ? 'Close Bonnet' : 'Open Bonnet'}</span>
            <span className={`w-2 h-2 rounded-full ${hoodOpen ? 'bg-[#C9A227]' : 'bg-white/20'}`} />
          </button>

          <button
            onClick={handleToggleWireframe}
            className={`w-full py-2 px-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center justify-between transition-all ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <span>X-Ray Chassis</span>
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lighting & Engine Ignition */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleToggleHeadlights}
              className={`py-2 px-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                headlightsOn
                  ? 'bg-white/15 border-white text-white'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Headlights</span>
            </button>
            <button
              onClick={handleToggleUnderglow}
              className={`py-2 px-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                underglowOn
                  ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#C9A227]'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Underglow</span>
            </button>
          </div>

          <button
            onClick={() => setEngineRunning(!engineRunning)}
            className={`w-full py-2.5 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              engineRunning
                ? 'bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-white text-black hover:bg-[#C9A227] hover:text-white border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{engineRunning ? 'Stop Engine' : 'Ignite Engine'}</span>
          </button>
        </div>
      </div>

      {/* ── Right Floating Panel: Vehicle Telemetry Specs ────────────────── */}
      <div className="absolute top-28 right-6 z-20 hidden xl:flex flex-col gap-3 max-w-[240px] pointer-events-auto">
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold block border-b border-white/10 pb-2">
            Engineering Telemetry
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-white/50 text-[10px] uppercase block">Power Output</span>
              <span className="text-white font-bold text-sm tracking-wider">{specs.power}</span>
            </div>
            <div>
              <span className="text-white/50 text-[10px] uppercase block">Acceleration</span>
              <span className="text-[#C9A227] font-bold text-sm tracking-wider">{specs.acceleration}</span>
            </div>
            <div>
              <span className="text-white/50 text-[10px] uppercase block">Top Speed</span>
              <span className="text-white font-bold text-sm tracking-wider">{specs.topSpeed}</span>
            </div>
            <div>
              <span className="text-white/50 text-[10px] uppercase block">Powertrain</span>
              <span className="text-white/80 text-[11px] leading-tight block">{specs.engine}</span>
            </div>
            <div>
              <span className="text-white/50 text-[10px] uppercase block">Transmission</span>
              <span className="text-white/80 text-[11px] leading-tight block">{specs.transmission}</span>
            </div>
          </div>
        </div>

        {/* 3D Spatial Parts Hotspot Trigger Pills */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold block mb-2">
            Inspect & Shop Parts
          </span>
          {DEFAULT_HOTSPOTS_3D.map((hs) => (
            <button
              key={hs.id}
              onClick={() => handleSelectHotspot(hs)}
              className={`w-full py-1.5 px-2.5 rounded-lg border text-left text-[10px] font-mono truncate transition-all flex items-center justify-between ${
                activeHotspot?.id === hs.id
                  ? 'bg-[#C9A227]/20 border-[#C9A227] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="truncate">{hs.label}</span>
              <ChevronRight className="w-3 h-3 text-[#C9A227] shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar: Lighting Themes Switcher ────────────────────────── */}
      <div className="absolute bottom-6 inset-x-6 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        
        {/* Lighting Themes */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 pointer-events-auto shadow-2xl">
          {LIGHTING_THEMES.map((theme) => {
            const Icon = theme.icon
            return (
              <button
                key={theme.id}
                onClick={() => handleLightingTheme(theme.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
                  lightingTheme === theme.id
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{theme.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Current Camera Angle Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-white/70 pointer-events-auto shadow-2xl">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
          <span>STAGE CAMERA: <strong className="text-white uppercase">{activeCameraPreset}</strong></span>
        </div>
      </div>

      {/* ── Hotspot Detail Drawer Modal ─────────────────────────────────── */}
      {activeHotspot && (
        <div className="absolute bottom-24 right-6 z-30 w-full max-w-sm p-5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-[#C9A227]/40 shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A227] font-bold block">
                Inspected Component
              </span>
              <h4 className="text-base font-serif font-bold text-white mt-0.5">
                {activeHotspot.label}
              </h4>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="p-1 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-white/70 leading-relaxed mb-3">
            {activeHotspot.description}
          </p>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-white/50">Factory Benchmark</span>
            <span className="text-xs font-mono font-bold text-[#C9A227]">{activeHotspot.stat}</span>
          </div>

          {/* Related Parts */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">
              Available Inventory Upgrades
            </span>
            {partsLoading ? (
              <div className="flex items-center justify-center py-4 text-white/50 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading inventory...
              </div>
            ) : hotspotParts.length > 0 ? (
              hotspotParts.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-white truncate font-medium">{part.name}</p>
                    <p className="text-[10px] text-white/50 font-mono">${part.price.toLocaleString()}</p>
                  </div>
                  <Link
                    href={`/parts/${part.id}`}
                    className="px-2.5 py-1 rounded-md bg-[#C9A227] text-black text-[10px] font-mono font-bold uppercase hover:bg-white transition-colors shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-white/40 font-mono italic py-1">
                OEM parts available on request via VIP concierge.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
