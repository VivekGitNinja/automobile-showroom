'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Eye,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sliders,
  SunMedium,
  Layers,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight,
  Gauge,
  Flame,
  Radio,
  Zap
} from 'lucide-react'
import { VehicleImage, Vehicle } from '../../../../lib/types'

interface CockpitHotspot {
  id: string
  title: string
  category: string
  subtitle: string
  stat: string
  details: string
  x: number // percentage
  y: number // percentage
  icon: 'steering' | 'gauge' | 'switch' | 'seat' | 'mode' | 'audio'
}

interface InteriorViewpoint {
  id: string
  label: string
  subtitle: string
  yaw: number
  pitch: number
  zoom: number
  imageUrl: string
  hotspots: CockpitHotspot[]
}

const AMBIENT_LIGHT_MODES = [
  { id: 'gold', label: 'Apex Gold', hex: '#C9A227', glow: 'rgba(201,162,39,0.35)', filter: 'sepia(0.2) hue-rotate(5deg)' },
  { id: 'crimson', label: 'Cyber Crimson', hex: '#EF4444', glow: 'rgba(239,68,68,0.35)', filter: 'sepia(0.3) hue-rotate(320deg)' },
  { id: 'ice', label: 'Ice Blue', hex: '#38BDF8', glow: 'rgba(56,189,248,0.35)', filter: 'sepia(0.2) hue-rotate(180deg)' },
  { id: 'emerald', label: 'Emerald Aurora', hex: '#10B981', glow: 'rgba(16,185,129,0.35)', filter: 'sepia(0.2) hue-rotate(95deg)' },
  { id: 'violet', label: 'Midnight Violet', hex: '#A855F7', glow: 'rgba(168,85,247,0.35)', filter: 'sepia(0.25) hue-rotate(250deg)' },
]

interface Interior360PanoramaProps {
  images?: VehicleImage[]
  vehicle?: Vehicle
}

export default function Interior360Panorama({ images = [], vehicle }: Interior360PanoramaProps) {
  // Determine primary interior image
  const primaryInteriorImage =
    images.find((img) => img.mediaCategory === 'interior' || img.mediaCategory === 'dashboard')?.urlOriginal ||
    images[0]?.urlOriginal ||
    '/images/dynamic/hotspot_interior.jpg'

  // Build 4 Curated Cockpit Viewpoints with dedicated high-res atelier photography
  const viewpoints: InteriorViewpoint[] = [
    {
      id: 'driver-cockpit',
      label: 'Driver Cockpit',
      subtitle: 'Primary Command Center & Steering Hub',
      yaw: 0,
      pitch: -2,
      zoom: 1.15,
      imageUrl:
        images.find((img) => img.title?.toLowerCase().includes('steering'))?.urlOriginal ||
        '/images/dynamic/interior_steering_1785319277541.jpg',
      hotspots: [
        {
          id: 'steering-wheel',
          title: 'Alcantara Racing Wheel & Carbon Paddles',
          category: 'STEERING CONTROL',
          subtitle: 'Milled Billet Aluminum & Hand-Stitched Grip',
          stat: '0.04s Shift Response',
          details:
            'Flat-bottom racing wheel wrapped in authentic Italian Alcantara with tactile 12 o’clock centering stripe, steering wheel mounted telemetry triggers, and extended column-mounted carbon shift paddles.',
          x: 48,
          y: 62,
          icon: 'steering',
        },
        {
          id: 'virtual-cluster',
          title: 'High-Definition Virtual Cockpit TFT',
          category: 'TELEMETRY DISPLAY',
          subtitle: 'Multi-Mode Digital Instrument Binnacle',
          stat: '9,000 RPM Redline Display',
          details:
            'Aeronautical TFT virtual binnacle displaying real-time G-forces, tyre temperatures, individual brake pressure telemetry, and dynamic gear ratio indicators.',
          x: 48,
          y: 44,
          icon: 'gauge',
        },
      ],
    },
    {
      id: 'center-console',
      label: 'Console & Shifter',
      subtitle: 'Aeronautical Switchgear & Active Controls',
      yaw: -15,
      pitch: 12,
      zoom: 1.25,
      imageUrl:
        images.find(
          (img) =>
            img.title?.toLowerCase().includes('dash') ||
            img.title?.toLowerCase().includes('console') ||
            img.mediaCategory === 'dashboard'
        )?.urlOriginal || '/images/dynamic/interior_dashboard_1785319238155.jpg',
      hotspots: [
        {
          id: 'start-flap',
          title: 'Fighter-Jet Missile Start/Stop Switch',
          category: 'IGNITION SYSTEM',
          subtitle: 'Aerospace-Grade Anodized Safety Flap',
          stat: 'Spring-Loaded Safety Gate',
          details:
            'Inspired by fighter jet weapon triggers, the spring-loaded anodized red flap protects the primary starter button, delivering mechanical tactile feedback upon firing up the engine.',
          x: 52,
          y: 68,
          icon: 'switch',
        },
        {
          id: 'mode-selector',
          title: 'Dynamic ANIMA / Driving Mode Selector',
          category: 'CHASSIS DYNAMICS',
          subtitle: 'Strada · Sport · Corsa · Ego Mode Dial',
          stat: 'Instant Dynamic Remap',
          details:
            'Recalibrates magnetorheological suspension stiffness, all-wheel steering aggressiveness, gearbox shift speed, and active exhaust butterfly valves within milliseconds.',
          x: 42,
          y: 74,
          icon: 'mode',
        },
      ],
    },
    {
      id: 'passenger-horizon',
      label: 'Passenger Horizon',
      subtitle: 'Handcrafted Leather Dash & Carbon Weave',
      yaw: 24,
      pitch: 2,
      zoom: 1.1,
      imageUrl:
        images.find((img) => img.title?.toLowerCase().includes('seat') || img.title?.toLowerCase().includes('upholstery'))
          ?.urlOriginal || '/images/dynamic/interior_seats_1785319256690.jpg',
      hotspots: [
        {
          id: 'carbon-trim',
          title: 'Forged Carbon Fiber & Fine Leather Architecture',
          category: 'INTERIOR CRAFTSMANSHIP',
          subtitle: 'Bespoke Contrast Stitching & Atelier Finish',
          stat: 'Handcrafted Atelier Stitch',
          details:
            'Every square centimeter of the dashboard is hand-fitted by master craftsmen using premium Nappa leather, contrast French stitching, and genuine exposed satin twill carbon fiber weave.',
          x: 68,
          y: 52,
          icon: 'seat',
        },
      ],
    },
    {
      id: 'starlight-suite',
      label: 'Acoustic & Starlight Suite',
      subtitle: 'Surround Sound & Headliner Architecture',
      yaw: 0,
      pitch: -22,
      zoom: 1.2,
      imageUrl:
        images.find((img) => img.title?.toLowerCase().includes('starlight') || img.title?.toLowerCase().includes('lounge'))
          ?.urlOriginal || '/images/dynamic/interior_headliner_1785319295000.jpg',
      hotspots: [
        {
          id: 'sound-system',
          title: 'Bespoke Diamond High-End Surround Sound',
          category: 'ACOUSTIC ENGINEERING',
          subtitle: 'Motorized Acoustic Lens Diamond Tweeters',
          stat: '1,280W 3D Spatial Audio',
          details:
            'Precision-engineered acoustic lens tweeters engineered into the A-pillars with active noise cancellation designed to filter out road vibration while magnifying pure engine exhaust notes.',
          x: 28,
          y: 36,
          icon: 'audio',
        },
      ],
    },
  ]

  // State
  const [activeViewIdx, setActiveViewIdx] = useState(0)
  const currentView = viewpoints[activeViewIdx] || viewpoints[0]

  const [yaw, setYaw] = useState(currentView.yaw)
  const [pitch, setPitch] = useState(currentView.pitch)
  const [zoom, setZoom] = useState(currentView.zoom)
  const [ambientLight, setAmbientLight] = useState(AMBIENT_LIGHT_MODES[0])
  const [selectedHotspot, setSelectedHotspot] = useState<CockpitHotspot | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [cabinAudioActive, setCabinAudioActive] = useState(false)

  // Drag & Inertia
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const stageRef = useRef<HTMLDivElement>(null)

  // Sync viewpoint changes smoothly
  const handleViewpointSwitch = (idx: number) => {
    setActiveViewIdx(idx)
    const target = viewpoints[idx]
    if (target) {
      setYaw(target.yaw)
      setPitch(target.pitch)
      setZoom(target.zoom)
    }
  }

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - startPos.x
    const dy = e.clientY - startPos.y

    // Adjust yaw (-180 to 180 continuous or bounded)
    setYaw((prev) => {
      const next = prev - dx * 0.18
      return Math.max(-120, Math.min(120, next))
    })

    // Adjust pitch (-30 to 30 bounded)
    setPitch((prev) => {
      const next = prev + dy * 0.14
      return Math.max(-32, Math.min(32, next))
    })

    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const resetView = () => {
    setYaw(currentView.yaw)
    setPitch(currentView.pitch)
    setZoom(1.15)
  }

  const getHotspotIcon = (icon: CockpitHotspot['icon']) => {
    switch (icon) {
      case 'steering':
        return <Compass className="w-4 h-4" />
      case 'gauge':
        return <Gauge className="w-4 h-4" />
      case 'switch':
        return <Flame className="w-4 h-4" />
      case 'seat':
        return <Layers className="w-4 h-4" />
      case 'mode':
        return <Zap className="w-4 h-4" />
      case 'audio':
        return <Radio className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  return (
    <div className="mb-16">
      {/* ── Header & Telemetry ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#C9A227]" /> 360° Cockpit & Interior Tour
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
              YAW: {yaw >= 0 ? `+${Math.round(yaw)}` : Math.round(yaw)}° · PITCH: {pitch >= 0 ? `+${Math.round(pitch)}` : Math.round(pitch)}°
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              HORIZON CALIBRATED
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Cockpit & Interior Inspection
          </h2>
          <p className="text-xs sm:text-sm font-light text-white/50 mt-1 max-w-2xl">
            Interactive drag-to-pan spherical inspection of Italian Alcantara, forged carbon switchgear, and digital instrument telemetry.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-[#0C0C12] p-2 rounded-2xl border border-white/10 shadow-xl">
          {/* Ambient Lighting Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono text-white/50 px-1 hidden sm:inline-block">
              LED AMBIENT:
            </span>
            {AMBIENT_LIGHT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setAmbientLight(mode)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  ambientLight.id === mode.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: mode.hex }}
                title={`Switch to ${mode.label}`}
              />
            ))}
          </div>

          {/* Cabin Sound Ambience Toggle */}
          <button
            onClick={() => setCabinAudioActive(!cabinAudioActive)}
            className={`p-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              cabinAudioActive
                ? 'bg-[#C9A227] text-black font-bold'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
            title="Toggle Cabin Acoustic Staging"
          >
            {cabinAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Acoustics</span>
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(1.0, z - 0.15))}
              disabled={zoom <= 1.0}
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 transition-opacity"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-white/60 px-1">{zoom.toFixed(1)}x</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              disabled={zoom >= 1.6}
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 transition-opacity"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Camera Button */}
          <button
            onClick={resetView}
            className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-[#C9A227] hover:bg-white/10 border border-white/5 transition-colors"
            title="Center Steering View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Panoramic Stage ───────────────────────────────────────── */}
      <div
        ref={stageRef}
        className={`relative w-full ${
          isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : 'aspect-[16/9] sm:aspect-[21/9] min-h-[460px] rounded-[32px]'
        } overflow-hidden border border-white/10 bg-black cursor-grab active:cursor-grabbing group shadow-2xl transition-all duration-300 select-none`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Dynamic 3D Curved Panoramic Canvas Layer */}
        <div
          className="absolute inset-0 transition-transform ease-out pointer-events-none"
          style={{
            transform: `perspective(1000px) rotateX(${pitch}deg) rotateY(${yaw * 0.4}deg) scale(${zoom})`,
            transitionDuration: isDragging ? '0ms' : '400ms',
          }}
        >
          <img
            src={currentView.imageUrl}
            alt={currentView.label}
            className="w-full h-full object-cover select-none pointer-events-none transition-all duration-700"
            draggable={false}
          />
        </div>

        {/* Ambient Mood Light Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-color transition-all duration-700 opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 70%, ${ambientLight.glow} 0%, transparent 75%)`,
          }}
        />

        {/* Ambient LED Light Pipe Reflection Along Lower Dash */}
        <div
          className="absolute bottom-0 inset-x-0 h-28 pointer-events-none transition-all duration-700"
          style={{
            background: `linear-gradient(to top, ${ambientLight.glow} 0%, transparent 100%)`,
          }}
        />

        {/* Dynamic Spatial Hotspot Pins (Tracking inside Cockpit Space) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {currentView.hotspots.map((hs) => {
            // Apply slight dynamic parallax offset based on yaw & pitch
            const offsetX = hs.x - yaw * 0.15
            const offsetY = hs.y + pitch * 0.15

            return (
              <div
                key={hs.id}
                className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
                style={{ left: `${offsetX}%`, top: `${offsetY}%` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedHotspot(hs)
                  }}
                  className="relative group/pin flex items-center justify-center p-2"
                  title={hs.title}
                >
                  {/* Outer Radar Ping */}
                  <span
                    className="absolute w-8 h-8 rounded-full animate-ping pointer-events-none"
                    style={{ backgroundColor: ambientLight.glow }}
                  />
                  <span
                    className="absolute w-10 h-10 rounded-full border pointer-events-none"
                    style={{ borderColor: ambientLight.hex }}
                  />

                  {/* Core Badge */}
                  <span
                    className="relative w-8 h-8 rounded-full bg-black/85 backdrop-blur-md border text-white flex items-center justify-center shadow-2xl group-hover/pin:scale-125 transition-all duration-200"
                    style={{
                      borderColor: ambientLight.hex,
                      boxShadow: `0 0 15px ${ambientLight.glow}`,
                    }}
                  >
                    {getHotspotIcon(hs.icon)}
                  </span>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/pin:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-black/95 backdrop-blur-xl text-white text-xs font-mono px-3.5 py-2 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center gap-1 z-30">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#C9A227] uppercase tracking-widest font-bold">
                      <span>{hs.category}</span>
                      <span>•</span>
                      <span>{hs.stat}</span>
                    </div>
                    <span className="text-white text-xs font-serif font-bold">{hs.title}</span>
                    <span className="text-[9px] text-white/50 tracking-wider">CLICK TO INSPECT CRAFTSMANSHIP</span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Top Floating Cockpit HUD Bar ────────────────────────────── */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          {/* Active Viewpoint Badge */}
          <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 pointer-events-auto shadow-xl">
            <Compass className="w-4 h-4 text-[#C9A227]" />
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
              <span className="text-white font-bold">{currentView.label}</span>
              <span className="text-white/30">•</span>
              <span className="text-[#C9A227]">{ambientLight.label} Ambient</span>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 rounded-full bg-black/75 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/15 hover:border-[#C9A227]/50 transition-colors pointer-events-auto shadow-xl"
            title="Toggle Cockpit Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Bottom Drag Assist Pill ─────────────────────────────────── */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden sm:flex items-center gap-3 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
          <Compass className="w-4 h-4 text-[#C9A227] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/80">
            DRAG TO PAN & TILT COCKPIT · CLICK PINS TO INSPECT
          </span>
        </div>

        {/* Hotspots Counter Pill */}
        <div className="absolute bottom-6 right-6 z-20 pointer-events-none flex items-center gap-2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full border border-[#C9A227]/30 text-[11px] font-mono text-[#C9A227] shadow-xl">
          <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
          <span>{currentView.hotspots.length} Cockpit Pins Active</span>
        </div>
      </div>

      {/* ── Viewpoint Switcher Tabs ──────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0E] p-3 sm:p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mr-1 hidden sm:inline-block">
            PERSPECTIVES:
          </span>
          {viewpoints.map((vp, idx) => (
            <button
              key={vp.id}
              onClick={() => handleViewpointSwitch(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                activeViewIdx === idx
                  ? 'bg-white text-black font-bold shadow-lg shadow-white/20 scale-[1.03]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {vp.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>Handcrafted Atelier Interior</span>
        </div>
      </div>

      {/* ── Cockpit Component Quick-Inspect Tray ─────────────────────── */}
      {currentView.hotspots.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A227] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Cockpit Features in Current Perspective
            </span>
            <span className="text-[10px] font-mono text-white/40">
              Click to view material provenance and telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentView.hotspots.map((hs) => (
              <button
                key={hs.id}
                onClick={() => setSelectedHotspot(hs)}
                className="p-4 rounded-2xl bg-[#0C0C12] border border-white/10 hover:border-[#C9A227]/50 hover:bg-white/[0.03] transition-all text-left group flex items-start justify-between shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${ambientLight.hex}15`,
                      borderColor: `${ambientLight.hex}40`,
                      color: ambientLight.hex,
                    }}
                  >
                    {getHotspotIcon(hs.icon)}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#C9A227] tracking-wider block mb-0.5">
                      {hs.category}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-white group-hover:text-[#C9A227] transition-colors">
                      {hs.title}
                    </h4>
                    <p className="text-[11px] font-mono text-white/50 mt-0.5">{hs.subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch">
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all" />
                  <span className="text-[10px] font-mono font-bold text-white/90 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    {hs.stat}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Craftsmanship Detail Modal ────────────────────────────────── */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#09090D] border border-[#C9A227]/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(201,162,39,0.2)] p-6 sm:p-8"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/20 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-1 rounded-full border border-[#C9A227]/20">
                  {selectedHotspot.category}
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {vehicle ? `${vehicle.make} Cockpit Architecture` : 'Bespoke Atelier Specification'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1.5 leading-tight">
                {selectedHotspot.title}
              </h3>
              <p className="text-xs font-mono text-white/60 mb-6">{selectedHotspot.subtitle}</p>

              {/* Stat Highlight Card */}
              <div className="bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 p-4 rounded-2xl mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
                    Cockpit Benchmark Specification
                  </span>
                  <p className="text-xl font-serif font-bold text-white">{selectedHotspot.stat}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${ambientLight.hex}20`,
                    borderColor: `${ambientLight.hex}50`,
                    color: ambientLight.hex,
                  }}
                >
                  {getHotspotIcon(selectedHotspot.icon)}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#A0A0A0] font-light mb-8">
                {selectedHotspot.details}
              </p>

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Molsheim / Sant’Agata Bolognese Handcrafted
                </span>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C9A227] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158] transition-colors shadow-lg shadow-[#C9A227]/20"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
