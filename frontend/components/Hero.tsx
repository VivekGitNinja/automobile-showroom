'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Search, ChevronDown, Activity, Volume2, VolumeX, Play, Pause, ChevronLeft, ChevronRight, Sliders } from 'lucide-react'
import { Vehicle } from '../lib/types'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

interface HeroProps {
  flagship?: Vehicle
  loading?: boolean
}

interface MediaItem {
  id: string
  type: 'video' | 'image'
  src: string
  title: string
  subtitle: string
  poster?: string
  duration: number
}

const HERO_MEDIA: MediaItem[] = [
  {
    id: 'vid-1',
    type: 'video',
    src: '/videos/hero-video-1.mp4',
    title: 'Showroom Arrival',
    subtitle: 'Bugatti Chiron Super Sport Entrance',
    poster: '/images/hero/hero-car-1.jpg',
    duration: 6000
  },
  {
    id: 'vid-2',
    type: 'video',
    src: '/videos/hero-video-2.mp4',
    title: 'High-Speed Tracking Shot',
    subtitle: 'Ferrari SF90 & Lamborghini Highway Dynamics',
    poster: '/images/hero/hero-car-2.jpg',
    duration: 6000
  },
  {
    id: 'vid-3',
    type: 'video',
    src: '/videos/hero-video-3.mp4',
    title: 'Cockpit & Engine Detailing',
    subtitle: 'Carbon Fiber & Quad-Turbo Architecture',
    poster: '/images/hero/hero-car-3.jpg',
    duration: 7000
  },
  {
    id: 'img-1',
    type: 'image',
    src: '/images/hero/hero-car-1.jpg',
    title: 'Bugatti Chiron Super Sport 300+',
    subtitle: '1,578 HP Molsheim Crown Jewel',
    duration: 5000
  },
  {
    id: 'img-2',
    type: 'image',
    src: '/images/hero/hero-car-2.jpg',
    title: 'French Racing Blue Edition',
    subtitle: 'Bespoke Aerodynamic Craftsmanship',
    duration: 5000
  },
  {
    id: 'img-3',
    type: 'image',
    src: '/images/hero/hero-car-3.jpg',
    title: 'Exposed Carbon Track Spec',
    subtitle: '50,000 Nm/deg Torsional Rigidity',
    duration: 5000
  },
  {
    id: 'img-4',
    type: 'image',
    src: '/images/hero/hero-car-4.jpg',
    title: 'Liquid Silver Aero Package',
    subtitle: 'Active Rear Wing & Ceramic Rotors',
    duration: 5000
  },
  {
    id: 'img-5',
    type: 'image',
    src: '/images/hero/hero-car-5.jpg',
    title: '8.0L W16 Quad-Turbo Engine',
    subtitle: 'Hand-Assembled Titanium Powertrain',
    duration: 5000
  },
  {
    id: 'img-6',
    type: 'image',
    src: '/images/hero/hero-car-6.jpg',
    title: 'LMP1-Grade Carbon Monocoque',
    subtitle: 'Ultra-Lightweight Bespoke Architecture',
    duration: 5000
  }
]

const ENGINE_SOUNDS = [
  { name: 'Bugatti W16 Quad-Turbo', baseFreq: 80, peakFreq: 480, duration: 2.5 },
  { name: 'Ferrari V8 Twin-Turbo', baseFreq: 110, peakFreq: 620, duration: 2.3 },
  { name: 'Lamborghini V12 Atmospheric', baseFreq: 95, peakFreq: 750, duration: 2.8 },
  { name: 'Porsche Flat-6 GT3', baseFreq: 130, peakFreq: 850, duration: 2.2 },
]

export default function Hero({ flagship, loading }: HeroProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [revving, setRevving] = useState(false)
  const [selectedEngineIndex, setSelectedEngineIndex] = useState(0)
  const [volume, setVolume] = useState(0.6)
  const [isMuted, setIsMuted] = useState(false)

  const [searchMake, setSearchMake] = useState('All')
  const [searchModel, setSearchModel] = useState('')

  const router = useRouter()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, 300])
  const opacity = useTransform(scrollY, [0, 600], [1, 0])
  const scale = useTransform(scrollY, [0, 600], [1, 1.15])

  const media = HERO_MEDIA[currentMediaIndex]

  // Auto-advance media carousel
  const nextMedia = useCallback(() => {
    setCurrentMediaIndex((prev) => (prev + 1) % HERO_MEDIA.length)
  }, [])

  const prevMedia = useCallback(() => {
    setCurrentMediaIndex((prev) => (prev === 0 ? HERO_MEDIA.length - 1 : prev - 1))
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const timer = setTimeout(() => {
      nextMedia()
    }, media.duration)
    return () => clearTimeout(timer)
  }, [currentMediaIndex, isPlaying, media.duration, nextMedia])

  // Synthesize realistic engine rev sound via Web Audio API
  const handleIgniteEngine = (engineIdx?: number) => {
    const targetIdx = engineIdx !== undefined ? engineIdx : selectedEngineIndex
    setSelectedEngineIndex(targetIdx)
    setRevving(true)

    const engine = ENGINE_SOUNDS[targetIdx]
    setTimeout(() => setRevving(false), engine.duration * 1000)

    if (isMuted || volume === 0) return

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const sub = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc1.type = 'sawtooth'
      osc2.type = 'square'
      sub.type = 'triangle'

      const masterVol = isMuted ? 0 : volume

      // Frequency Sweep
      osc1.frequency.setValueAtTime(engine.baseFreq, now)
      osc1.frequency.exponentialRampToValueAtTime(engine.peakFreq, now + 0.8)
      osc1.frequency.exponentialRampToValueAtTime(engine.baseFreq + 20, now + engine.duration - 0.2)

      osc2.frequency.setValueAtTime(engine.baseFreq / 2, now)
      osc2.frequency.exponentialRampToValueAtTime(engine.peakFreq / 2, now + 0.8)
      osc2.frequency.exponentialRampToValueAtTime(engine.baseFreq / 2 + 10, now + engine.duration - 0.2)

      sub.frequency.setValueAtTime(engine.baseFreq / 4, now)
      sub.frequency.exponentialRampToValueAtTime(engine.peakFreq / 4, now + 0.8)
      sub.frequency.exponentialRampToValueAtTime(engine.baseFreq / 4, now + engine.duration - 0.2)

      // Filter Sweep
      filter.type = 'lowpass'
      filter.Q.value = 5
      filter.frequency.setValueAtTime(250, now)
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.8)
      filter.frequency.exponentialRampToValueAtTime(300, now + engine.duration - 0.2)

      // Gain Envelope
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.4 * masterVol, now + 0.2)
      gainNode.gain.linearRampToValueAtTime(0.5 * masterVol, now + 0.8)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + engine.duration)

      osc1.connect(filter)
      osc2.connect(filter)
      sub.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      sub.start(now)

      osc1.stop(now + engine.duration)
      osc2.stop(now + engine.duration)
      sub.stop(now + engine.duration)
    } catch (e) {
      console.error("Engine sound synthesis error:", e)
    }
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchMake !== 'All') params.set('make', searchMake)
    if (searchModel.trim()) params.set('search', searchModel.trim())
    router.push(`/inventory?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#030303] selection:bg-[#C9A227] selection:text-[#030303] pt-32 sm:pt-36 pb-12">
      
      {/* Background Media Slideshow */}
      <motion.div style={{ y: y1, scale }} className="absolute inset-0 z-0 origin-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={media.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {media.type === 'video' ? (
              <video
                key={media.src}
                autoPlay
                muted
                loop
                playsInline
                poster={media.poster}
                className="object-cover w-full h-full opacity-80 brightness-90"
              >
                <source src={media.src} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.src}
                alt={media.title}
                className="object-cover w-full h-full opacity-80 brightness-90 transform scale-105 animate-pulse"
                style={{ animationDuration: '8s' }}
              />
            )}

            {/* Gradient Overlays for Luxury Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/40 to-transparent w-3/4" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#030303]/30 to-[#030303] opacity-80" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none"></div>

      {/* Top Right Sound & Media Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute top-28 md:top-28 right-8 md:right-12 z-40 flex items-center gap-4"
      >
        {/* Equalizer Visualizer */}
        <div className="flex items-end gap-[2px] h-8 opacity-80">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 rounded-t-sm"
              style={{ 
                height: revving ? '100%' : `${20 + Math.random() * 25}%`,
                backgroundColor: revving ? (i > 5 ? '#ff0000' : '#C9A227') : '#ffffff',
                transition: 'all 0.1s ease',
                boxShadow: revving && i > 5 ? '0 0 10px #ff0000' : 'none'
              }}
            />
          ))}
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full glass-panel hover:border-[#C9A227]/50 text-white transition-colors"
          title={isMuted ? "Unmute Engine Audio" : "Mute Engine Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#C9A227]" />}
        </button>

        {/* Ignite Engine Sound Button */}
        <button 
          onClick={() => handleIgniteEngine()}
          className="group relative flex items-center gap-3 px-6 py-2.5 rounded-full glass-panel hover:border-[#C9A227]/50 transition-all duration-300 overflow-hidden pulse-glow-button"
        >
          <div className="absolute inset-0 bg-[#C9A227]/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
          <Activity className={`w-4 h-4 relative z-10 ${revving ? 'text-[#C9A227] animate-pulse' : 'text-white'}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] relative z-10 font-bold">
            {revving ? 'REVVING...' : 'IGNITE ENGINE'}
          </span>
        </button>
      </motion.div>

      {/* Main Hero Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-24"
      >
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 xl:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            {/* Active Media Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel border-[#C9A227]/30 text-white text-[10px] font-mono uppercase tracking-[0.3em] mb-8 shadow-[0_0_30px_rgba(201,162,39,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="gold-gradient-text font-bold">{media.subtitle}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-[7.5rem] font-serif font-extrabold text-white tracking-tighter leading-[0.95] mb-8">
              {media.title.split(' ')[0]} <br />
              <span className="italic font-light text-outline-luxury block mt-2">
                {media.title.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-2xl text-[#B8B8B8] font-light leading-relaxed max-w-2xl">
              Dubai's private network for acquiring pristine hypercars, bespoke motorcars, and rare limited-run automotive flagships.
            </p>
          </motion.div>

          {/* Quick Search Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full xl:w-[460px] glass-card-elevated rounded-2xl p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

            <h3 className="text-white font-serif text-2xl mb-6 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#C9A227]" />
              Find Your Flagship
            </h3>
            
            <form onSubmit={handleQuickSearch} className="space-y-5 relative z-10">
              <div className="relative group/input">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Marque</label>
                <div className="relative">
                  <select 
                    value={searchMake}
                    onChange={(e) => setSearchMake(e.target.value)}
                    className="w-full bg-[#0A0A0A]/80 border border-white/10 text-white text-sm rounded-xl px-5 py-4 appearance-none focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                  >
                    <option value="All">All Marques</option>
                    <option value="Bugatti">Bugatti</option>
                    <option value="Ferrari">Ferrari</option>
                    <option value="Lamborghini">Lamborghini</option>
                    <option value="Rolls-Royce">Rolls-Royce</option>
                    <option value="Porsche">Porsche</option>
                    <option value="McLaren">McLaren</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/50 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              <div className="relative group/input">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Model / Designation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chiron, SF90, Revuelto"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  className="w-full bg-[#0A0A0A]/80 border border-white/10 text-white text-sm rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner placeholder:text-white/20"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#9E7D1A] hover:brightness-110 text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 mt-4 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] flex justify-center items-center gap-2"
              >
                <span>Explore Inventory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar: Slideshow Pagination & Engine Presets */}
      <div className="absolute bottom-6 left-0 right-0 z-40 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Carousel Progress Indicators */}
        <div className="flex items-center gap-3">
          <button 
            onClick={prevMedia} 
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:border-[#C9A227] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest font-bold">
            0{currentMediaIndex + 1} / 0{HERO_MEDIA.length}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            {HERO_MEDIA.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentMediaIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentMediaIndex 
                    ? 'w-8 bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.8)]' 
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={m.title}
              />
            ))}
          </div>

          <button 
            onClick={nextMedia} 
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:border-[#C9A227] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Sound Presets Quick Select */}
        <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-white/10 text-[9px] font-mono uppercase tracking-widest text-[#7A7A7A]">
          <span className="text-white font-bold mr-1">Engine Sound:</span>
          {ENGINE_SOUNDS.map((eng, idx) => (
            <button
              key={eng.name}
              onClick={() => handleIgniteEngine(idx)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                selectedEngineIndex === idx 
                  ? 'bg-[#C9A227] text-black font-bold' 
                  : 'hover:text-white'
              }`}
            >
              {eng.name.split(' ')[0]} {eng.name.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="flex items-center gap-2 text-[#7A7A7A]">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4 text-[#C9A227]" />
          </motion.div>
        </div>

      </div>

    </section>
  )
}
