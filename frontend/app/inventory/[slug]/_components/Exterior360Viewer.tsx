'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, Maximize2, X, Eye, Sparkles, CheckCircle2 } from 'lucide-react'
import { Vehicle360Frame, VehicleHotspot } from '../../../../lib/types'

interface Exterior360ViewerProps {
  frames?: Vehicle360Frame[]
  hotspots?: VehicleHotspot[]
}

// Removed DEFAULT_BUGATTI fallbacks to strictly use database values

const ANGLE_PRESETS = [
  { label: '3/4 Front View', frameIndex: 0 },
  { label: 'Side Profile', frameIndex: 1 },
  { label: 'Liquid Finish', frameIndex: 2 },
  { label: 'Carbon Weave', frameIndex: 3 },
  { label: 'Frontal Aero', frameIndex: 4 },
]

export default function Exterior360Viewer({ frames = [], hotspots = [] }: Exterior360ViewerProps) {
  const activeFrames = [...frames].sort((a, b) => a.displayOrder - b.displayOrder)
  const activeHotspots = hotspots

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<VehicleHotspot | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || activeFrames.length === 0) return
    const deltaX = e.clientX - startX
    const sensitivity = 15
    if (Math.abs(deltaX) > sensitivity) {
      const framesToMove = Math.floor(deltaX / sensitivity)
      let newIndex = (currentIndex - framesToMove) % activeFrames.length
      if (newIndex < 0) newIndex += activeFrames.length
      setCurrentIndex(newIndex)
      setStartX(e.clientX)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Interactive 3D Stage & Part Inspector
          </span>
          <h2 className="text-3xl font-bold font-serif text-white">360° Studio & Engineering Inspection</h2>
        </div>
        <p className="text-xs font-mono text-white/50">
          Drag to rotate 360° · Click pins to view high-resolution HD part details
        </p>
      </div>

      {/* Main Stage */}
      <div
        ref={containerRef}
        className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-[16/9] rounded-3xl'} overflow-hidden border border-white/10 bg-[#070707] cursor-grab active:cursor-grabbing group shadow-2xl transition-all duration-300`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Frame rendering */}
        {activeFrames.map((frame, index) => (
          <img
            key={frame.id}
            src={frame.imageUrl}
            alt={`360 Frame ${index}`}
            className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10 scale-[1.01]' : 'opacity-0 z-0'
            }`}
            draggable={false}
          />
        ))}

        {/* Hotspot Pins */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {activeHotspots.map((hs) => (
            <div
              key={hs.id}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${hs.xPosition}%`, top: `${hs.yPosition}%` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedHotspot(hs)
                }}
                className="relative group/pin flex items-center justify-center"
              >
                <span className="absolute w-8 h-8 rounded-full bg-[#C9A227]/40 animate-ping" />
                <span className="relative w-7 h-7 rounded-full bg-[#C9A227] text-black font-bold text-[11px] flex items-center justify-center border-2 border-white shadow-lg hover:scale-125 transition-transform duration-200">
                  <Eye className="w-3.5 h-3.5" />
                </span>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-black/90 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-white/20 shadow-xl">
                  {hs.title}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Drag Indicator Overlay */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none flex items-center gap-3 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
          <RotateCw className="w-4 h-4 text-[#C9A227] animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/90">
            Drag 360° ({currentIndex + 1} / {activeFrames.length})
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/10 hover:border-[#C9A227]/50 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Fixed Angle Presets Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A0A0A0] mr-2">
            Preset Angles:
          </span>
          {ANGLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setCurrentIndex(preset.frameIndex % activeFrames.length)}
              className={`px-4 py-2 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${
                currentIndex === (preset.frameIndex % activeFrames.length)
                  ? 'bg-[#C9A227] text-black font-bold shadow-md shadow-[#C9A227]/20 scale-105'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/20">
          5 High-Resolution Part Hotspots Active
        </span>
      </div>

      {/* Part High-Quality Detail Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-[#C9A227]/30 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Part Image */}
                <div className="relative aspect-square md:aspect-auto bg-black overflow-hidden">
                  <img
                    src={selectedHotspot.partImageUrl || '/images/dynamic/hotspot_engine.jpg'}
                    alt={selectedHotspot.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#C9A227]/40 text-[10px] font-mono uppercase tracking-widest text-[#C9A227]">
                    High-Resolution Part Inspection
                  </div>
                </div>

                {/* Part Info */}
                <div className="p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
                      Engineering Component
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                      {selectedHotspot.title}
                    </h3>
                    <p className="text-xs font-mono text-white/60 mb-6">{selectedHotspot.subtitle}</p>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
                        Performance Metric
                      </span>
                      <p className="text-lg font-serif font-bold text-white">{selectedHotspot.stat}</p>
                    </div>

                    <p className="text-sm leading-relaxed text-[#A0A0A0] font-light">
                      {selectedHotspot.details}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Original Factory Part Verified
                    </span>
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="px-6 py-2.5 rounded-full bg-[#C9A227] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158] transition-colors"
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
