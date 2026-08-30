'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Maximize2, MessageCircle, Calendar } from 'lucide-react'
import { Vehicle, VehicleImage } from '../../../../lib/types'
import Link from 'next/link'
import PdfBrochureButton from '../../../../components/PdfBrochureButton'

interface HeroGalleryProps {
  vehicle: Vehicle
  images: VehicleImage[]
  onExpandGallery: () => void
  onBookViewing: () => void
}

export default function HeroGallery({ vehicle, images, onExpandGallery, onBookViewing }: HeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (isHovered || !images || images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex, isHovered, images])

  useEffect(() => {
    if (!images || images.length === 0) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images])

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartX.current === null || !images || images.length === 0) return
    const touchEndX = e.clientX
    const diff = touchStartX.current - touchEndX

    if (diff > 80) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    } else if (diff < -80) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
    touchStartX.current = null
  }

  const whatsappText = `I am interested in ${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const whatsappUrl = `https://wa.me/971508919441?text=${encodeURIComponent(whatsappText)}`
  const validImages = images && images.length > 0 ? images : [{ urlOriginal: '/placeholder-car.jpg', title: 'Fallback image', id: '1' } as any]

  return (
    <section 
      className="relative w-full h-[70vh] lg:h-[100dvh] overflow-hidden bg-[#050505] touch-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={validImages[currentIndex]?.urlOriginal}
            alt={validImages[currentIndex]?.title || `${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover pointer-events-none"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <Link 
          href="/inventory"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="bg-black/40 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
          <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
            VIN: {vehicle.vin || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 z-10 flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227]">
              {vehicle.make}
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            {vehicle.trim && (
              <p className="text-lg text-white/60 font-serif italic">
                {vehicle.trim}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-white/50 font-mono">
              {vehicle.mileage && (
                <>
                  <span>{vehicle.mileage.toLocaleString()} km</span>
                  <span>·</span>
                </>
              )}
              {vehicle.transmission && (
                <>
                  <span>{vehicle.transmission}</span>
                  <span>·</span>
                </>
              )}
              {vehicle.fuelType && <span>{vehicle.fuelType}</span>}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-6">
            <div className="text-right">
              <div className="text-sm font-mono text-white/50 uppercase tracking-widest mb-1">Asking Price</div>
              <div className="text-4xl font-serif font-bold text-white">
                {vehicle.currency} {vehicle.price.toLocaleString()}
              </div>
            </div>
            
            <div className="flex gap-3">
              <PdfBrochureButton vehicle={vehicle} />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <button
                onClick={onBookViewing}
                className="h-12 px-8 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all bg-[#C9A227] text-black font-bold hover:bg-[#b08d22] flex items-center justify-center gap-2 shadow-lg shadow-[#C9A227]/20"
              >
                <Calendar className="w-4 h-4" /> Book Viewing
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnails & Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full lg:max-w-2xl pr-8">
            {validImages.slice(0, 8).map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                  currentIndex === idx 
                    ? 'border-2 border-[#C9A227] opacity-100' 
                    : 'border-2 border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.urlOriginal}
                  alt={img.title || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6 shrink-0 ml-4">
            <span className="font-mono text-xs text-white/50 tracking-widest hidden sm:block">
              {(currentIndex + 1).toString().padStart(2, '0')} / {validImages.length.toString().padStart(2, '0')}
            </span>
            <button
              onClick={onExpandGallery}
              className="flex items-center gap-2 bg-black/60 backdrop-blur border border-white/20 text-white rounded-full px-6 py-3 hover:bg-white/10 transition-colors shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">
                View All {validImages.length} Photos
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
