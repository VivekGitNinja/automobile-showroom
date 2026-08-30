'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Eye, X, Maximize2, Sparkles, CheckCircle2 } from 'lucide-react'

import { VehicleImage } from '../../../../lib/types'

interface CockpitHotspot {
  id: string
  title: string
  subtitle: string
  details: string
  x: number
  y: number
  imageUrl: string
}

interface Interior360PanoramaProps {
  images?: VehicleImage[]
}

export default function Interior360Panorama({ images = [] }: Interior360PanoramaProps) {
  const [activeViewIndex, setActiveViewIndex] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<CockpitHotspot | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Map database images to cockpit views, fallback to empty array
  const dynamicViews = images.map((img, idx) => ({
    id: `view-${idx}`,
    label: img.title || `Interior View ${idx + 1}`,
    imageUrl: img.urlOriginal,
    hotspots: [] as CockpitHotspot[]
  }))

  const currentView = dynamicViews[activeViewIndex]

  if (!currentView) return null


  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center gap-2 mb-2">
            <Compass className="w-3.5 h-3.5" /> 360° Interior Cockpit Tour
          </span>
          <h2 className="text-3xl font-bold font-serif text-white">Cockpit & Interior Inspection</h2>
        </div>
        <p className="text-xs font-mono text-white/50">
          Switch camera angles to inspect dashboard, leather, and steering controls
        </p>
      </div>

      {/* Main View Container */}
      <div
        className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-[16/9] rounded-3xl'} overflow-hidden border border-white/10 bg-[#070707] shadow-2xl transition-all duration-300`}
      >
        <img
          src={currentView.imageUrl}
          alt={currentView.label}
          className="w-full h-full object-cover transition-all duration-700"
        />

        {/* Hotspots */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {currentView.hotspots.map((hs) => (
            <div
              key={hs.id}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            >
              <button
                onClick={() => setSelectedHotspot(hs)}
                className="relative group/pin flex items-center justify-center"
              >
                <span className="absolute w-8 h-8 rounded-full bg-[#C9A227]/40 animate-ping" />
                <span className="relative w-7 h-7 rounded-full bg-[#C9A227] text-black font-bold text-[11px] flex items-center justify-center border-2 border-white shadow-lg hover:scale-125 transition-transform duration-200">
                  <Eye className="w-3.5 h-3.5" />
                </span>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-black/90 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-white/20 shadow-xl">
                  {hs.title}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/10 transition-colors"
        >
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* View Selector Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {dynamicViews.map((view, idx) => (
          <button
            key={view.id}
            onClick={() => setActiveViewIndex(idx)}
            className={`px-5 py-3 rounded-2xl text-xs font-mono uppercase tracking-widest transition-all duration-200 ${
              activeViewIndex === idx
                ? 'bg-white text-black font-bold shadow-lg shadow-white/10 scale-105'
                : 'bg-[#0A0A0A] text-[#7A7A7A] border border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl bg-[#0A0A0A] border border-[#C9A227]/30 rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#C9A227] border border-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
                Interior Craftsmanship
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">{selectedHotspot.title}</h3>
              <p className="text-xs font-mono text-white/60 mb-6">{selectedHotspot.subtitle}</p>

              <p className="text-sm leading-relaxed text-[#A0A0A0] font-light mb-8">
                {selectedHotspot.details}
              </p>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Molsheim Atelier Handcrafted
                </span>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="px-6 py-2.5 rounded-full bg-[#C9A227] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
