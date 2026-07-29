'use client'

import React, { useState } from 'react'
import { Plus, X, ShieldCheck, Zap, Wind, Disc, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Hotspot {
  id: string
  title: string
  subtitle: string
  x: number
  y: number
  icon: React.ReactNode | null
  details: string
  stat: string
  partImageUrl?: string
  iconType?: string
}

interface SpecConfig {
  id: string
  name: string
  image: string
  hex: string
}

interface InteractiveHotspotViewerProps {
  vehicleName?: string
  vehicleSubName?: string
  specs?: SpecConfig[]
  hotspots?: Hotspot[]
  performanceStats?: { val: string; label: string }[]
}

export default function InteractiveHotspotViewer({
  vehicleName = 'Bugatti Chiron',
  vehicleSubName = 'Super Sport',
  specs: externalSpecs,
  hotspots: externalHotspots,
  performanceStats: externalStats,
}: InteractiveHotspotViewerProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<string>('')

  const getIcon = (type?: string) => {
    switch(type) {
      case 'Zap': return <Zap className="w-5 h-5 text-[#C9A227]" />
      case 'Disc': return <Disc className="w-5 h-5 text-[#C9A227]" />
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
      case 'Wind': return <Wind className="w-5 h-5 text-[#C9A227]" />
      default: return <Sparkles className="w-5 h-5 text-[#C9A227]" />
    }
  }

  // Using highly realistic, non-AI images that fit a track/dynamic environment
  const defaultSpecs = [
    { 
      id: 'carbon', 
      name: 'Exposed Carbon Fiber', 
      image: '/images/dynamic/bugatti_exterior.jpg', 
      hex: '#111111' 
    },
    { 
      id: 'french-racing', 
      name: 'French Racing Blue', 
      image: '/images/dynamic/bugatti_exterior.jpg', 
      hex: '#0055A4' 
    },
    { 
      id: 'liquid-silver', 
      name: 'Liquid Silver', 
      image: '/images/dynamic/bugatti_exterior.jpg', 
      hex: '#D1D5DB' 
    },
  ]

  const specs = externalSpecs && externalSpecs.length > 0 ? externalSpecs : defaultSpecs
  const currentVehicleImage = specs.find((c) => c.id === selectedSpec)?.image || specs[0].image

  const defaultHotspots: Hotspot[] = [
    {
      id: 'engine',
      title: '8.0L Quad-Turbo W16',
      subtitle: 'Heart of the Hypercar',
      x: 35,
      y: 55,
      icon: <Zap className="w-5 h-5 text-[#C9A227]" />,
      details: 'Hand-assembled in Molsheim. The W16 powertrain utilizes four sequential turbochargers and titanium components to deliver relentless, uninterrupted acceleration.',
      stat: '1,578 HP • 1,600 Nm Torque',
      partImageUrl: '/images/dynamic/bugatti_exterior.jpg'
    },
    {
      id: 'brakes',
      title: 'Carbon Ceramic Brakes',
      subtitle: 'Aerospace-Grade Stopping Power',
      x: 22,
      y: 72,
      icon: <Disc className="w-5 h-5 text-[#C9A227]" />,
      details: 'Massive 420mm carbon-silicon carbide composite rotors clamped by 8-piston titanium calipers. Capable of absorbing brutal thermal loads on the track.',
      stat: '420mm Rotors • 8-Piston Calipers',
      partImageUrl: '/images/dynamic/bugatti_exterior.jpg'
    },
    {
      id: 'chassis',
      title: 'Carbon Monocoque',
      subtitle: 'LMP1-Level Rigidity',
      x: 52,
      y: 45,
      icon: <ShieldCheck className="w-5 h-5 text-[#C9A227]" />,
      details: 'A bespoke carbon fiber architecture providing 50,000 Nm per degree of torsional rigidity, ensuring razor-sharp handling and ultimate passenger safety.',
      stat: '50,000 Nm/deg Rigidity',
      partImageUrl: '/images/dynamic/bugatti_exterior.jpg'
    },
    {
      id: 'aero',
      title: 'Active Aerodynamics',
      subtitle: 'Dynamic Downforce',
      x: 82,
      y: 50,
      icon: <Wind className="w-5 h-5 text-[#C9A227]" />,
      details: 'The hydraulically actuated rear wing adjusts continuously, acting as an airbrake under heavy deceleration and maximizing downforce through high-speed apexes.',
      stat: 'Generates 600kg Downforce',
      partImageUrl: '/images/dynamic/bugatti_exterior.jpg'
    },
  ]

  const hotspots = externalHotspots && externalHotspots.length > 0 ? externalHotspots : defaultHotspots
  const bottomStats = externalStats || [
    { val: '440 km/h', label: 'Max Speed' },
    { val: '2.4 sec', label: '0 - 100 km/h' },
    { val: '8.0L W16', label: 'Powertrain' },
    { val: '1,578 HP', label: 'Bespoke Output' },
  ]

  return (
    <div className="relative w-full max-w-[1400px] mx-auto rounded-[40px] overflow-hidden bg-[#050505] border border-white/5 shadow-2xl">
      
      {/* Configuration Header */}
      <div className="absolute top-0 left-0 w-full z-20 flex flex-col md:flex-row md:items-start justify-between gap-6 p-8 md:p-12 bg-gradient-to-b from-[#030303]/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-3 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Inspection</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-serif font-extrabold text-white leading-tight drop-shadow-lg">
            {vehicleName} <span className="italic font-light text-white/80">{vehicleSubName}</span>
          </h3>
        </div>

        {/* Real-Time Spec Configurator */}
        <div className="pointer-events-auto flex items-center gap-4 bg-[#0A0A0A]/80 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] font-bold">Exterior Spec:</span>
          <div className="flex items-center gap-3">
            {specs.map((spec) => (
              <button
                key={spec.id}
                onClick={() => {
                  setSelectedSpec(spec.id);
                  setActiveHotspot(null);
                }}
                title={spec.name}
                className="relative group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 focus:outline-none"
              >
                <span 
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    selectedSpec === spec.id ? 'scale-100 opacity-100 bg-[#C9A227]' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-30 bg-white'
                  }`}
                />
                <span 
                  style={{ backgroundColor: spec.hex }}
                  className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 z-10 ${
                    selectedSpec === spec.id ? 'border-[#0A0A0A] scale-100' : 'border-white/20 scale-90 group-hover:scale-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Stage */}
      <div className="relative w-full h-[500px] sm:h-[650px] lg:h-[750px] bg-[#030303] overflow-hidden group">
        
        {/* Realistic Car Image with subtle dynamic pan (Ken Burns effect) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedSpec}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={currentVehicleImage}
            alt="Bugatti Chiron on Track"
            className="absolute inset-0 w-full h-full object-cover object-center origin-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
          />
        </AnimatePresence>

        {/* Ambient Darkening Overlays for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/50 via-transparent to-[#030303]/50 pointer-events-none" />

        {/* Hotspots */}
        {hotspots.map((spot) => (
          <div
            key={spot.id}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <button
              onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
              className="relative group flex items-center justify-center focus:outline-none"
            >
              {/* Pulsing Aura */}
              <div className={`absolute w-14 h-14 rounded-full transition-all duration-500 ${activeHotspot?.id === spot.id ? 'bg-[#C9A227]/30 scale-125' : 'bg-white/10 group-hover:bg-[#C9A227]/20 group-hover:scale-110 animate-pulse-ring'}`} />
              
              {/* Core Node */}
              <div className={`relative w-6 h-6 rounded-full backdrop-blur-md border-[1.5px] flex items-center justify-center transition-all duration-500 shadow-xl ${
                activeHotspot?.id === spot.id 
                  ? 'border-[#C9A227] bg-[#C9A227] scale-110' 
                  : 'border-white/50 bg-white/20 group-hover:border-[#C9A227] group-hover:bg-[#C9A227]/50'
              }`}>
                <Plus className={`w-3.5 h-3.5 transition-all duration-500 ${activeHotspot?.id === spot.id ? 'text-black rotate-45' : 'text-white'}`} />
              </div>

              {/* Tooltip (visible only on hover when not active) */}
              <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none ${
                activeHotspot?.id === spot.id ? 'opacity-0 scale-95' : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white bg-[#0A0A0A]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap shadow-lg">
                  Inspect {spot.title.split(' ')[0]}
                </span>
              </div>
            </button>
          </div>
        ))}

        {/* Inspection Panel */}
        <AnimatePresence>
          {activeHotspot && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-8 left-8 right-8 md:left-12 md:right-auto md:w-[420px] z-40"
            >
              <div className="relative p-8 rounded-[32px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden group/panel">
                
                {/* Gold Highlight Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent opacity-50" />
                
                {/* Close Button */}
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {activeHotspot.partImageUrl && (
                  <div className="w-full h-32 md:h-40 rounded-xl overflow-hidden mb-5 border border-white/10 shadow-lg relative">
                    <img 
                      src={activeHotspot.partImageUrl} 
                      alt={activeHotspot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
                  </div>
                )}

                <div className="flex items-start gap-5 mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#030303] flex items-center justify-center relative z-10 border border-[#C9A227]/30 group-hover:border-[#C9A227] group-hover:shadow-[0_0_15px_rgba(201,162,39,0.3)] transition-all">
                      {activeHotspot.icon || getIcon(activeHotspot.iconType)}
                    </div>
                  <div className="pr-8">
                    <h4 className="font-serif font-bold text-white text-xl leading-tight mb-1">{activeHotspot.title}</h4>
                    <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-[0.2em] font-bold">
                      {activeHotspot.subtitle}
                    </span>
                  </div>
                </div>

                <p className="text-[#A0A0A0] text-[13px] font-light leading-relaxed mb-6">
                  {activeHotspot.details}
                </p>

                <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#030303]/80 border border-white/5 shadow-inner">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#7A7A7A]">Specification</span>
                  <span className="font-mono text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    {activeHotspot.stat}
                    <ChevronRight className="w-3 h-3 text-[#C9A227]" />
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Footer Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0A0A0A] border-t border-white/5">
        {bottomStats.map((stat, idx) => (
          <div key={idx} className={`p-8 text-center border-white/5 transition-all duration-500 hover:bg-[#C9A227]/5 group ${idx !== 0 ? 'border-l' : ''} ${idx < 2 ? 'border-b md:border-b-0' : ''}`}>
            <span className="block text-[#C9A227] font-extrabold text-2xl sm:text-3xl mb-2 tracking-tight font-serif group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(201,162,39,0.2)]">
              {stat.val}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7A7A7A] group-hover:text-white transition-colors font-bold">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
