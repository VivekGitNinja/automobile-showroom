'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Vehicle } from '../lib/types'
import { ArrowUpRight, ShieldCheck, Sparkles, Heart, GitCompare, ChevronLeft, ChevronRight, Volume2, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playVehicleEngineSound } from '../lib/soundEngine'

import { getFallbackImages } from '../lib/api'

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [hovered, setHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCompared, setIsCompared] = useState(false)
  const [isRevving, setIsRevving] = useState(false)

  // Ensure images are arrays with valid non-empty strings
  const validImages = Array.isArray(vehicle.images) 
    ? vehicle.images.filter(img => typeof img === 'string' && img.trim() !== '')
    : []

  const images = validImages.length > 0 
    ? validImages 
    : getFallbackImages(vehicle.make, vehicle.model)

  const hasMultipleImages = images.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCompared(!isCompared)
  }

  const handlePlaySound = (e: React.MouseEvent) => {
    e.preventDefault()
    playVehicleEngineSound(vehicle, (revving) => setIsRevving(revving))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative h-[480px] rounded-3xl overflow-hidden glass-card-elevated luxury-card-hover flex flex-col justify-end isolate"
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 bg-[#C9A227]/30 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Shimmer sweep effect */}
      <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-[1.5s] ease-in-out pointer-events-none z-40"></div>

      {/* Full Bleed Background Image Gallery */}
      <div className="absolute inset-0 z-0 bg-[#030303]">
        <AnimatePresence initial={false}>
          <motion.img
            key={images[currentImageIndex]}
            src={images[currentImageIndex]}
            alt={`${vehicle.make} ${vehicle.model}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onError={(e) => {
              // Fallback to local high-res asset if external image URL 404s
              const target = e.currentTarget
              const fallbacks = getFallbackImages(vehicle.make, vehicle.model)
              if (target.src !== fallbacks[0]) {
                target.src = fallbacks[0]
              }
            }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-90 group-hover:opacity-100"
          />
        </AnimatePresence>

        {/* Subtle Luxury Gradient (Ensures text readability while keeping vehicle image bright and visible) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/30 to-transparent opacity-90 h-full w-full" />
      </div>

      {/* Top Controls & Badges (Visible on Hover if multiple images) */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-30 pointer-events-none">
        <div className="flex flex-col gap-2">
          {vehicle.isFeatured && (
            <span className="px-3 py-1.5 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 backdrop-blur-md text-[#C9A227] text-[9px] font-mono uppercase tracking-[0.3em] font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(201,162,39,0.3)]">
              <Sparkles className="w-3 h-3" />
              <span>Flagship</span>
            </span>
          )}
          {vehicle.isLimited && (
            <span className="px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/50 backdrop-blur-md text-red-400 text-[9px] font-mono uppercase tracking-[0.3em] font-bold">
              Limited Edition
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={handlePlaySound} 
            title={`Listen to ${vehicle.make} ${vehicle.model} Engine Sound`}
            className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${isRevving ? 'bg-[#C9A227] border-[#C9A227] text-black shadow-[0_0_20px_rgba(201,162,39,0.8)] scale-110' : 'bg-black/60 border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227] hover:text-black'}`}
          >
            {isRevving ? <Activity className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={handleWishlist} className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${isWishlisted ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/40 border-white/10 text-white hover:text-red-500 hover:border-red-500/50'}`}>
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleCompare} className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${isCompared ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.4)]' : 'bg-black/40 border-white/10 text-white hover:text-[#C9A227] hover:border-[#C9A227]/50'}`}>
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery Arrows */}
      {hasMultipleImages && hovered && (
        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex items-center justify-between z-30 pointer-events-none">
          <button 
            onClick={prevImage}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#C9A227] hover:text-black transition-colors pointer-events-auto"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextImage}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#C9A227] hover:text-black transition-colors pointer-events-auto"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card Content & Specs (Slide Up) */}
      <div className="p-6 pb-8 z-30 relative w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <Link href={`/inventory/${vehicle.slug}`} className="block">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-[0.3em] font-bold">{vehicle.make}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">{vehicle.year}</span>
          </div>
          
          <h3 className="text-3xl font-serif font-bold text-white group-hover:gold-gradient-text transition-all duration-500 leading-tight mb-1">
            {vehicle.model}
          </h3>
          <p className="text-xs text-[#B8B8B8] font-mono line-clamp-1 mb-4">{vehicle.trim || vehicle.engine}</p>
        </Link>

        {/* Detailed Specs Grid (Fades in on hover) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-[rgba(255,255,255,0.08)] opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-1">Power</span>
            <span className="text-[11px] font-mono text-white truncate">{vehicle.specs?.power || vehicle.horsepower || 'V8 Twin-Turbo'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-1">0-100 km/h</span>
            <span className="text-[11px] font-mono text-white truncate">{vehicle.specs?.acceleration || vehicle.acceleration || '2.9s'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-1">Mileage</span>
            <span className="text-[11px] font-mono text-white truncate">{vehicle.mileage}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#7A7A7A] mb-1">Price</span>
            <span className="text-[13px] font-serif font-bold text-[#C9A227] tracking-tight">
              {vehicle.currency} {vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Action Button (Slides up from bottom) */}
        <div className="absolute left-6 right-6 bottom-[-20px] opacity-0 group-hover:bottom-6 group-hover:opacity-100 transition-all duration-500 ease-out flex gap-2">
          <Link
            href={`/inventory/${vehicle.slug}`}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9E7D1A] text-black font-mono font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(201,162,39,0.3)]"
          >
            <span>Acquire</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/contact?vehicle=${vehicle.id}`}
            className="w-12 h-12 rounded-xl glass-panel border border-[#C9A227]/30 flex items-center justify-center text-white hover:border-[#C9A227] hover:text-[#C9A227] transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
