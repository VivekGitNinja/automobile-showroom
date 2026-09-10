'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Eye,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Compass,
  Sliders,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Layers,
  Wrench,
  Disc,
  Flame,
  Wind
} from 'lucide-react'
import { Vehicle360Frame, VehicleHotspot, Vehicle } from '../../../../lib/types'

interface Exterior360ViewerProps {
  frames?: Vehicle360Frame[]
  hotspots?: VehicleHotspot[]
  vehicle?: Vehicle
}

const ANGLE_PRESETS = [
  { label: 'Front 0°', deg: 0, frameRatio: 0 },
  { label: 'Front 3/4 45°', deg: 45, frameRatio: 0.125 },
  { label: 'Profile 90°', deg: 90, frameRatio: 0.25 },
  { label: 'Rear 3/4 135°', deg: 135, frameRatio: 0.375 },
  { label: 'Rear 180°', deg: 180, frameRatio: 0.5 },
  { label: 'Aero 225°', deg: 225, frameRatio: 0.625 },
  { label: 'Profile 270°', deg: 270, frameRatio: 0.75 },
  { label: 'Dynamic 315°', deg: 315, frameRatio: 0.875 },
]

export default function Exterior360Viewer({ frames = [], hotspots = [], vehicle }: Exterior360ViewerProps) {
  const activeFrames = [...frames].sort((a, b) => a.displayOrder - b.displayOrder)
  const activeHotspots = hotspots

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [autoRotate, setAutoRotate] = useState(false)
  const [autoSpeed, setAutoSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [selectedHotspot, setSelectedHotspot] = useState<VehicleHotspot | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastTimeRef = useRef(Date.now())
  const lastXRef = useRef(0)
  const animReqRef = useRef<number | null>(null)

  const totalFrames = activeFrames.length || 1
  const currentDegrees = Math.round((currentIndex / totalFrames) * 360)

  // ---------------------------------------------------------------------------
  // Smooth Momentum & Inertia Deceleration
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isDragging || autoRotate || Math.abs(velocity) < 0.1) return

    const applyFriction = () => {
      setVelocity((prev) => {
        const next = prev * 0.92
        if (Math.abs(next) < 0.08) return 0

        // Step frames based on remaining velocity
        const frameStep = next > 0 ? 1 : -1
        setCurrentIndex((curr) => {
          let updated = (curr - frameStep) % totalFrames
          if (updated < 0) updated += totalFrames
          return updated
        })
        return next
      })

      animReqRef.current = requestAnimationFrame(applyFriction)
    }

    animReqRef.current = requestAnimationFrame(applyFriction)
    return () => {
      if (animReqRef.current) cancelAnimationFrame(animReqRef.current)
    }
  }, [isDragging, autoRotate, velocity, totalFrames])

  // ---------------------------------------------------------------------------
  // Auto-Spin Turntable Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!autoRotate || isDragging || totalFrames <= 1) return

    const intervalMs = autoSpeed === 'slow' ? 240 : autoSpeed === 'normal' ? 160 : 90
    const interval = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1) % totalFrames)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [autoRotate, autoSpeed, isDragging, totalFrames])

  // ---------------------------------------------------------------------------
  // Pointer Event Handlers with Sensitivity & Velocity Tracking
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    lastXRef.current = e.clientX
    lastTimeRef.current = Date.now()
    setVelocity(0)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || totalFrames <= 1) return

    const now = Date.now()
    const dt = Math.max(now - lastTimeRef.current, 1)
    const deltaX = e.clientX - startX
    const instantDelta = e.clientX - lastXRef.current
    const sensitivity = 16

    if (Math.abs(deltaX) >= sensitivity) {
      const framesToMove = Math.floor(deltaX / sensitivity)
      let newIndex = (currentIndex - framesToMove) % totalFrames
      if (newIndex < 0) newIndex += totalFrames
      setCurrentIndex(newIndex)
      setStartX(e.clientX)
    }

    // Measure throw velocity for release momentum
    const instantSpeed = (instantDelta / dt) * 12
    setVelocity(instantSpeed)

    lastXRef.current = e.clientX
    lastTimeRef.current = now
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  // Preset jumping
  const jumpToPreset = (ratio: number) => {
    const targetIdx = Math.round(ratio * (totalFrames - 1))
    setCurrentIndex(targetIdx % totalFrames)
    setVelocity(0)
  }

  // Match icon for hotspot
  const getHotspotIcon = (iconType: string) => {
    switch (iconType) {
      case 'aero':
        return <Wind className="w-3.5 h-3.5" />
      case 'brake':
        return <Disc className="w-3.5 h-3.5" />
      case 'engine':
        return <Flame className="w-3.5 h-3.5" />
      case 'interior':
        return <Compass className="w-3.5 h-3.5" />
      default:
        return <Eye className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="mb-16">
      {/* ── Studio Header & Telemetry Badges ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> 360° Turntable Engineering Stage
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
              BEARING: {String(currentDegrees).padStart(3, '0')}° AZIMUTH
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              16-FRAME HD ORBIT
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            360° Studio & Engineering Inspection
          </h2>
          <p className="text-xs sm:text-sm font-light text-white/50 mt-1 max-w-2xl">
            Smooth inertia turntable orbit with integrated OEM component telemetry and factory provenance inspection.
          </p>
        </div>

        {/* Global Control Cluster */}
        <div className="flex items-center gap-2.5 bg-[#0C0C12] p-2 rounded-2xl border border-white/10 shadow-xl">
          {/* Auto-Spin Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
              autoRotate
                ? 'bg-[#C9A227] text-black font-bold shadow-lg shadow-[#C9A227]/30 scale-[1.02]'
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
            title="Toggle Auto-Spin Turntable"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#C9A227]" />}
            <span>Auto-Spin</span>
          </button>

          {/* Speed Selector (if auto-spin) */}
          {autoRotate && (
            <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
              {(['slow', 'normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAutoSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors ${
                    autoSpeed === spd ? 'bg-[#C9A227] text-black font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1.0, z - 0.25))}
              disabled={zoomLevel <= 1.0}
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 transition-opacity"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-white/60 px-1">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.75, z + 0.25))}
              disabled={zoomLevel >= 1.75}
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 transition-opacity"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={() => {
              setCurrentIndex(0)
              setVelocity(0)
              setZoomLevel(1.0)
            }}
            className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-[#C9A227] hover:bg-white/10 border border-white/5 transition-colors"
            title="Reset Front View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Studio Turntable Stage ───────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative w-full ${
          isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : 'aspect-[16/9] sm:aspect-[21/9] min-h-[460px] rounded-[32px]'
        } overflow-hidden border border-white/10 bg-gradient-to-b from-[#09090D] via-[#050508] to-[#020204] cursor-grab active:cursor-grabbing group shadow-2xl transition-all duration-300 select-none`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* High-Tech Radial Compass Grid Floor */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 overflow-hidden">
          {/* Outer glowing turntable ring */}
          <div
            className="absolute w-[620px] sm:w-[920px] h-[260px] sm:h-[340px] rounded-[100%] border border-[#C9A227]/25 shadow-[0_0_90px_rgba(201,162,39,0.15)] transition-transform duration-300"
            style={{
              bottom: '4%',
              transform: `perspective(600px) rotateX(68deg) rotateZ(${currentDegrees}deg)`,
            }}
          >
            {/* Degree Markers */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute text-[8px] font-mono text-[#C9A227]/70 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 46 * Math.cos((deg * Math.PI) / 180)}%`,
                }}
              >
                {deg}°
              </div>
            ))}
          </div>

          {/* Inner Studio Pedestal Rim */}
          <div
            className="absolute w-[440px] sm:w-[680px] h-[180px] sm:h-[240px] rounded-[100%] border border-white/10 bg-radial-gradient"
            style={{
              bottom: '8%',
              transform: 'perspective(600px) rotateX(68deg)',
              background: 'radial-gradient(ellipse at center, rgba(201,162,39,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* 360 Multi-Frame Vehicle Stack */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {activeFrames.map((frame, index) => (
            <img
              key={frame.id || index}
              src={frame.imageUrl}
              alt={`360 Frame ${index}`}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              draggable={false}
            />
          ))}
        </div>

        {/* Dynamic Spatial Hotspot Pins */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {activeHotspots.map((hs, i) => (
            <div
              key={hs.id || i}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ left: `${hs.xPosition}%`, top: `${hs.yPosition}%` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedHotspot(hs)
                }}
                className="relative group/pin flex items-center justify-center p-2"
                title={hs.title}
              >
                {/* Pulsing Radar Ring */}
                <span className="absolute w-8 h-8 rounded-full bg-[#C9A227]/30 animate-ping pointer-events-none" />
                <span className="absolute w-10 h-10 rounded-full border border-[#C9A227]/40 pointer-events-none" />

                {/* Badge Core */}
                <span className="relative w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-[#C9A227] text-[#C9A227] flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.5)] group-hover/pin:scale-125 group-hover/pin:bg-[#C9A227] group-hover/pin:text-black transition-all duration-200">
                  {getHotspotIcon(hs.iconType)}
                </span>

                {/* Mini Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/pin:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-black/90 backdrop-blur-xl text-white text-xs font-mono px-3.5 py-2 rounded-xl border border-[#C9A227]/40 shadow-2xl flex flex-col items-center gap-1 z-30">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#C9A227] uppercase tracking-widest font-bold">
                    <span>{hs.iconType}</span>
                    <span>•</span>
                    <span>{hs.stat}</span>
                  </div>
                  <span className="text-white text-xs font-serif font-bold">{hs.title}</span>
                  <span className="text-[9px] text-white/50 tracking-wider">CLICK TO INSPECT COMPONENT</span>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* ── Top Floating Studio HUD Bar ─────────────────────────────── */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          {/* Compass Readout */}
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto shadow-xl">
            <Compass className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
              <span className="text-[#C9A227] font-bold">{String(currentDegrees).padStart(3, '0')}°</span>
              <span className="text-white/30">•</span>
              <span className="text-white/80">
                {currentDegrees >= 337 || currentDegrees < 23
                  ? 'FRONT AERO'
                  : currentDegrees >= 23 && currentDegrees < 68
                  ? 'FRONT 3/4 DYNAMIC'
                  : currentDegrees >= 68 && currentDegrees < 113
                  ? 'LATERAL PROFILE'
                  : currentDegrees >= 113 && currentDegrees < 158
                  ? 'REAR 3/4 QUARTER'
                  : currentDegrees >= 158 && currentDegrees < 203
                  ? 'REAR AERO WING'
                  : currentDegrees >= 203 && currentDegrees < 248
                  ? 'EXHAUST DIFFUSER'
                  : currentDegrees >= 248 && currentDegrees < 293
                  ? 'OPPOSITE PROFILE'
                  : 'PROW PERSPECTIVE'}
              </span>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/10 hover:border-[#C9A227]/50 transition-colors pointer-events-auto shadow-xl"
            title="Toggle Studio Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Bottom Drag Assist Pill ─────────────────────────────────── */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden sm:flex items-center gap-3 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
          <RotateCw className="w-4 h-4 text-[#C9A227]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/80">
            DRAG TO ORBIT 360° · ({currentIndex + 1} OF {totalFrames} FRAMES)
          </span>
        </div>

        {/* Hotspots Counter Pill */}
        <div className="absolute bottom-6 right-6 z-20 pointer-events-none flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#C9A227]/30 text-[11px] font-mono text-[#C9A227] shadow-xl">
          <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
          <span>{activeHotspots.length} OEM Hotspots Verified</span>
        </div>
      </div>

      {/* ── Angle Presets Selector Bar ───────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0E] p-3 sm:p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mr-1 hidden sm:inline-block">
            PRESETS:
          </span>
          {ANGLE_PRESETS.map((preset) => {
            const targetIdx = Math.round(preset.frameRatio * (totalFrames - 1))
            const isActive = Math.abs(currentIndex - targetIdx) <= 1
            return (
              <button
                key={preset.label}
                onClick={() => jumpToPreset(preset.frameRatio)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C9A227] text-black font-bold shadow-md shadow-[#C9A227]/25 scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        <div className="text-[10px] font-mono text-white/40 flex items-center gap-2">
          <span>Inertia Touch Supported</span>
        </div>
      </div>

      {/* ── Bottom Inspected Components Tray ──────────────────────────── */}
      {activeHotspots.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A227] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Inspected Engineering Components ({activeHotspots.length})
            </span>
            <span className="text-[10px] font-mono text-white/40">
              Click any component below to jump & inspect
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {activeHotspots.map((hs, i) => (
              <button
                key={hs.id || i}
                onClick={() => setSelectedHotspot(hs)}
                className="p-3 rounded-2xl bg-[#0C0C12] border border-white/10 hover:border-[#C9A227]/50 hover:bg-white/[0.03] transition-all text-left group flex items-start gap-3 shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10 relative group-hover:border-[#C9A227]/40 transition-colors">
                  <img
                    src={hs.partImageUrl || '/images/dynamic/hotspot_engine.jpg'}
                    alt={hs.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono uppercase text-[#C9A227] tracking-wider truncate">
                      {hs.iconType}
                    </span>
                    <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-xs font-serif font-bold text-white truncate group-hover:text-[#C9A227] transition-colors">
                    {hs.title}
                  </h4>
                  <p className="text-[10px] font-mono text-white/50 truncate mt-0.5">{hs.stat}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── High-Resolution Engineering Component Modal ────────────────── */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#09090D] border border-[#C9A227]/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(201,162,39,0.2)]"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/20 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Part Image with High-Tech Watermark */}
                <div className="relative aspect-square md:aspect-auto min-h-[280px] sm:min-h-[380px] bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedHotspot.partImageUrl || '/images/dynamic/hotspot_engine.jpg'}
                    alt={selectedHotspot.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C9A227]/40 text-[10px] font-mono uppercase tracking-widest text-[#C9A227] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> OEM Genuine Part
                    </span>
                    <span className="text-[10px] font-mono text-white/50 bg-black/80 px-2.5 py-1 rounded-full">
                      HD Inspection
                    </span>
                  </div>
                </div>

                {/* Right Engineering Data Sheet */}
                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-1 rounded-full border border-[#C9A227]/20">
                        {selectedHotspot.iconType.toUpperCase()} COMPONENT
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {vehicle ? `${vehicle.make} Certified` : 'OEM Verified'}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 leading-tight">
                      {selectedHotspot.title}
                    </h3>
                    <p className="text-xs font-mono text-white/60 mb-6">{selectedHotspot.subtitle}</p>

                    {/* Stat Highlight Card */}
                    <div className="bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 p-4 rounded-2xl mb-6 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
                          Benchmark Performance Metric
                        </span>
                        <p className="text-xl font-serif font-bold text-white">{selectedHotspot.stat}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                        {getHotspotIcon(selectedHotspot.iconType)}
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed text-[#A0A0A0] font-light space-y-2">
                      <p>{selectedHotspot.details}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Original Factory Authenticity Guaranteed
                    </span>
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C9A227] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158] transition-colors shadow-lg shadow-[#C9A227]/20"
                    >
                      Close Inspection
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
