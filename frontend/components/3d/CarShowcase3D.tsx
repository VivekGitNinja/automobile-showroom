'use client'

import React, { useState, useEffect } from 'react'
import { RotateCw, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarShowcase3DProps {
  initialColor?: string
}

export default function CarShowcase3D({ initialColor = '0' }: CarShowcase3DProps) {
  const [hueShift, setHueShift] = useState(initialColor)
  const [autoRotate, setAutoRotate] = useState(false)
  const [headlightsOn, setHeadlightsOn] = useState(false)
  const [activeCameraAngle, setActiveCameraAngle] = useState<'3q' | 'side' | 'front' | 'top'>('3q')

  const colors = [
    { name: 'Liquid Gold', hue: '0', hex: '#C9A84C' },
    { name: 'Midnight Sapphire', hue: '200', hex: '#0B192C' },
    { name: 'Rosso Corsa', hue: '330', hex: '#D91656' },
    { name: 'Stealth Carbon', hue: 'grayscale', hex: '#1E1E1E' },
    { name: 'Emerald Bespoke', hue: '120', hex: '#104d33' },
  ]

  const angles = {
    '3q': '/images/dynamic/bugatti_chiron_3d_1785017033010.jpg',
    'side': '/images/dynamic/bugatti_exterior.jpg',
    'front': '/images/dynamic/spec_blue.jpg',
    'top': '/images/dynamic/hotspot_aero.jpg',
  }

  // 360 Orbit effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRotate) {
      const keys = Object.keys(angles) as Array<keyof typeof angles>
      let currentIndex = keys.indexOf(activeCameraAngle)
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % keys.length
        setActiveCameraAngle(keys[currentIndex])
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [autoRotate, activeCameraAngle])

  return (
    <div className="relative w-full h-[550px] bg-black rounded-3xl overflow-hidden border border-[#C9A227]/30 shadow-2xl">
      
      {/* Image Stage */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeCameraAngle}
            src={angles[activeCameraAngle]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: autoRotate ? 1.05 : 1,
              filter: hueShift === 'grayscale' 
                ? `grayscale(100%) contrast(1.2) brightness(${headlightsOn ? 1.1 : 0.95})` 
                : `hue-rotate(${hueShift}deg) saturate(1.2) brightness(${headlightsOn ? 1.1 : 0.95})` 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full h-full object-cover"
            alt="Vehicle Showcase"
            /* ENGINEERING JUSTIFICATION: Unsplash / local dynamic images require standard img tag */
            // eslint-disable-next-line @next/next/no-img-element
          />
        </AnimatePresence>
        
        {/* Headlight simulation overlay */}
        <AnimatePresence>
          {headlightsOn && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-cyan-400/20 via-transparent to-transparent mix-blend-screen pointer-events-none" 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floating 3D Control Panel Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#050505]/80 backdrop-blur-md border border-[#C9A227]/20 text-xs z-10">
        
        {/* Title Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-ping" />
          <span className="font-mono text-[#C9A227] uppercase tracking-[0.2em] font-bold">
            Interactive 3D Stage
          </span>
        </div>

        {/* Paint Color Picker */}
        <div className="flex items-center gap-2">
          <span className="text-[#A0A0A0] font-mono uppercase tracking-wider text-[10px]">Finish:</span>
          <div className="flex items-center gap-1.5 bg-[#0A0A0A]/60 p-1.5 rounded-full border border-[#C9A227]/20">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setHueShift(c.hue)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  hueShift === c.hue ? 'scale-125 border-[#C9A227] ring-2 ring-[#C9A227]/40' : 'border-white/20 hover:scale-110'
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
              autoRotate ? 'bg-[#C9A227] text-black font-bold border-[#C9A227]' : 'bg-[#0A0A0A] border-[#C9A227]/30 text-[#A0A0A0] hover:text-[#C9A227]'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>360° Orbit</span>
          </button>

          <button
            onClick={() => setHeadlightsOn(!headlightsOn)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition ${
              headlightsOn ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-[#0A0A0A] border-[#C9A227]/30 text-[#A0A0A0]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>LED Lights</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Angle Preset Buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#050505]/90 backdrop-blur-md border border-[#C9A227]/20 z-10 w-max max-w-[90vw] overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0] mr-2 shrink-0">Angles:</span>
        {(['3q', 'side', 'front', 'top'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => {
              setAutoRotate(false)
              setActiveCameraAngle(angle)
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition shrink-0 ${
              activeCameraAngle === angle ? 'bg-[#C9A227] text-black font-bold' : 'text-[#A0A0A0] hover:text-[#C9A227]'
            }`}
          >
            {angle === '3q' ? '3/4 View' : angle === 'side' ? 'Side Profile' : angle === 'front' ? 'Frontal' : 'Top Aero'}
          </button>
        ))}
      </div>
    </div>
  )
}
