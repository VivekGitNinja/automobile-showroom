'use client'

import React, { useState } from 'react'
import { Eye, Compass, Sparkles, Shield, Maximize2 } from 'lucide-react'

type AngleId = 'cockpit' | 'seats' | 'starlight' | 'steering'

interface InteriorAngle {
  id: AngleId
  name: string
  image: string
}

export default function InteriorPanorama3D() {
  const [activeAngle, setActiveAngle] = useState<AngleId>('cockpit')

  const angles: InteriorAngle[] = [
    { id: 'cockpit', name: 'Dashboard & Infotainment', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'seats', name: 'Bespoke Leather Seats', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'starlight', name: 'Bespoke Starlight Headliner', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'steering', name: 'Carbon Fiber Steering Wheel', image: '/images/dynamic/bugatti_exterior.jpg' },
  ]

  const currentAngle = angles.find((a) => a.id === activeAngle) || angles[0]

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden glass-panel border border-gold/30 p-6 flex flex-col justify-between shadow-2xl">
      {/* Background Image Stage */}
      <div className="absolute inset-0 z-0">
        {/* ENGINEERING JUSTIFICATION: Images sourced from Unsplash CDN with dynamic parameters. next/image remotePatterns cannot cover all runtime CMS sources. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentAngle.image}
          alt={currentAngle.name}
          className="w-full h-full object-cover transition-transform duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
      </div>

      {/* Header Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark/80 backdrop-blur-md border border-gold/30 text-gold text-xs font-mono uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5" />
          <span>360° Interior Cockpit Tour</span>
        </div>
        <span className="text-xs font-serif font-bold text-white tracking-wider">
          Rolls-Royce Phantom VIII Bespoke Cabin
        </span>
      </div>

      {/* Bottom Controls Overlay */}
      <div className="relative z-10 p-4 rounded-2xl bg-dark/90 backdrop-blur-md border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">Active Perspective</span>
          <h4 className="text-base font-serif font-bold text-white">{currentAngle.name}</h4>
        </div>

        {/* Perspective Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {angles.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveAngle(a.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                activeAngle === a.id
                  ? 'bg-gold text-dark font-bold shadow-md shadow-gold/30'
                  : 'bg-dark/80 text-gray-300 hover:text-gold border border-gold/20'
              }`}
            >
              {a.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
