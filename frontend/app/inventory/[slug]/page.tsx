'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { Vehicle } from '../../../lib/types'
import { fetchVehicleBySlugFromApi, fetchVehiclesFromApi, getFallbackImages } from '../../../lib/api'
import BookingModal from '../../../components/BookingModal'
import PdfBrochureButton from '../../../components/PdfBrochureButton'
import EmiCalculatorModal from '../../../components/EmiCalculatorModal'
import InteriorPanorama3D from '../../../components/3d/InteriorPanorama3D'
import CarShowcase3D from '../../../components/3d/CarShowcase3D'
import WheelConfigurator from '../../../components/3d/WheelConfigurator'
import VehicleCard from '../../../components/VehicleCard'
import { ShieldCheck, Phone, CheckCircle, ArrowLeft, ArrowRight, Calendar, Gauge, Fuel, Zap, Globe, Calculator, Maximize2, Loader2, AlertCircle, ChevronLeft, ChevronRight, X, Layers, Image as ImageIcon, Volume2, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playVehicleEngineSound } from '../../../lib/soundEngine'

export default function VehicleDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const [isRevving, setIsRevving] = useState(false)

  const { data: vehicle, error: vehicleError, isLoading: vehicleLoading } = useSWR(
    slug ? `vehicle-${slug}` : null,
    () => fetchVehicleBySlugFromApi(slug)
  )

  const { data: allVehiclesResponse } = useSWR(
    'vehicles-all',
    () => fetchVehiclesFromApi()
  )

  const relatedVehicles = allVehiclesResponse?.data?.filter((v) => v.slug !== slug).slice(0, 3) || []

  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [emiModalOpen, setEmiModalOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeGallery, setActiveGallery] = useState<'All' | 'Exterior' | 'Interior' | 'Engine'>('All')

  if (vehicleError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-4xl font-serif text-white">Vehicle Not Found</h2>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#A0A0A0]">The requested chassis could not be located.</p>
        <button onClick={() => router.back()} className="mt-8 px-8 py-3 rounded-full bg-[#C9A227] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
          Return to Showroom
        </button>
      </div>
    )
  }

  if (vehicleLoading || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <Loader2 className="w-12 h-12 text-[#C9A227] animate-spin" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A0A0A0]">Retrieving Specification Data...</p>
      </div>
    )
  }

  // Categorizing images with guaranteed fallback
  const rawImages = Array.isArray(vehicle.images) ? vehicle.images.filter(img => typeof img === 'string' && img.trim() !== '') : []
  const allImagesFallback = rawImages.length > 0 ? rawImages : getFallbackImages(vehicle.make, vehicle.model)
  
  let exteriorImgs = allImagesFallback.slice(0, Math.ceil(allImagesFallback.length / 2))
  let interiorImgs = allImagesFallback.slice(Math.ceil(allImagesFallback.length / 2))
  let engineImgs = allImagesFallback.slice(-1)

  const m = (vehicle?.make || '').toLowerCase()
  if (m.includes('bugatti')) {
    exteriorImgs = [
      '/images/dynamic/bugatti_exterior.jpg',
      '/images/dynamic/spec_blue.jpg',
      '/images/dynamic/hotspot_aero.jpg'
    ]
    interiorImgs = [
      '/images/dynamic/interior_dashboard_1785319238155.jpg',
      '/images/dynamic/interior_seats_1785319256690.jpg',
      '/images/dynamic/interior_steering_1785319277541.jpg',
      '/images/dynamic/interior_headliner_1785319295000.jpg'
    ]
    engineImgs = [
      '/images/dynamic/hotspot_engine.jpg'
    ]
  }

  const allFilteredImages = [...Array.from(new Set([...exteriorImgs, ...interiorImgs, ...engineImgs]))]

  const categorizedImages = {
    All: allFilteredImages,
    Exterior: exteriorImgs,
    Interior: interiorImgs,
    Engine: engineImgs
  }
  
  const currentImagesList = (categorizedImages[activeGallery] && categorizedImages[activeGallery].length > 0) 
    ? categorizedImages[activeGallery] 
    : allFilteredImages

  const currentImage = currentImagesList[currentImageIndex] || allFilteredImages[0]

  const nextImage = () => setCurrentImageIndex((prev) => (prev === currentImagesList.length - 1 ? 0 : prev + 1))
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? currentImagesList.length - 1 : prev - 1))

  return (
    <div className="bg-[#050505] min-h-screen pb-24">
      {/* Full-width Hero Gallery */}
      <div className="relative h-[60vh] md:h-[80vh] w-full bg-black overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onError={(e) => {
              const target = e.currentTarget
              const fallbacks = getFallbackImages(vehicle?.make, vehicle?.model)
              if (target.src !== fallbacks[0]) {
                target.src = fallbacks[0]
              }
            }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-32 sm:top-36 left-8 right-8 flex justify-between items-start z-20">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono uppercase tracking-[0.2em] shadow-2xl">
              VIN • {vehicle.vin?.slice(-6) || vehicle.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Gallery Navigation Controls */}
        {currentImagesList.length > 1 && (
          <div className="absolute inset-y-0 left-8 right-8 flex items-center justify-between pointer-events-none z-20">
            <button onClick={prevImage} className="w-14 h-14 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-[#C9A227] hover:text-black transition-colors pointer-events-auto">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="w-14 h-14 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-[#C9A227] hover:text-black transition-colors pointer-events-auto">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        <button
          onClick={() => setFullscreenImage(currentImage)}
          className="absolute bottom-8 right-8 px-6 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors z-20 flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Expand View</span>
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Title & Key Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227]">
                <span className="px-3 py-1 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10">{vehicle.make}</span>
                {vehicle.isFeatured && <span className="px-3 py-1 rounded-full bg-[#C9A227] text-black font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Flagship</span>}
                <span className="px-3 py-1 rounded-full border border-white/10 text-[#A0A0A0] bg-black flex items-center gap-1"><CheckCircle className="w-3 h-3"/> GCC Verified</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-white mb-4 leading-tight tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-lg text-[#A0A0A0] font-light font-serif italic mb-8">{vehicle.trim || 'Bespoke Commission'}</p>

              {/* Sub-Galleries Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/10">
                {(['All', 'Exterior', 'Interior', 'Engine'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveGallery(tab)
                      setCurrentImageIndex(0)
                    }}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-colors ${
                      activeGallery === tab ? 'bg-white text-black font-bold' : 'bg-black text-[#7A7A7A] border border-white/10 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-6">
                {currentImagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? 'border-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.3)] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* ENGINEERING JUSTIFICATION: Dynamic CMS/CDN image URLs cannot be statically configured in next.config.js remotePatterns */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Technical Specifications */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-10"
            >
              <div className="flex items-center gap-3 mb-8 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227]">
                <Layers className="w-4 h-4" />
                <span>Technical Data</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#7A7A7A] uppercase tracking-widest font-mono">Engine</span>
                  <span className="text-sm font-bold text-white truncate flex items-center gap-2"><Zap className="w-4 h-4 text-[#C9A227]"/> {vehicle.specs?.power || vehicle.horsepower || vehicle.engine || 'V8'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#7A7A7A] uppercase tracking-widest font-mono">0-100 km/h</span>
                  <span className="text-sm font-bold text-white truncate flex items-center gap-2"><Gauge className="w-4 h-4 text-[#C9A227]"/> {vehicle.specs?.acceleration || vehicle.acceleration || '2.9s'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#7A7A7A] uppercase tracking-widest font-mono">Mileage</span>
                  <span className="text-sm font-bold text-white truncate flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C9A227]"/> {vehicle.mileage}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#7A7A7A] uppercase tracking-widest font-mono">Fuel</span>
                  <span className="text-sm font-bold text-white truncate flex items-center gap-2"><Fuel className="w-4 h-4 text-[#C9A227]"/> {vehicle.fuelType}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-serif font-bold text-white mb-4">Provenance & Overview</h3>
                <p className="text-sm text-[#A0A0A0] leading-relaxed font-light mb-8">
                  {vehicle.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-[11px] font-mono">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Exterior Paint</span>
                    <span className="text-white font-bold">{vehicle.exteriorColor}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Interior Cabin</span>
                    <span className="text-white font-bold">{vehicle.interiorColor}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Transmission</span>
                    <span className="text-white font-bold">{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Body Style</span>
                    <span className="text-white font-bold">{vehicle.bodyType}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Drivetrain</span>
                    <span className="text-white font-bold">{vehicle.drivetrain || 'AWD'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-[#7A7A7A] uppercase tracking-widest">Stock Number</span>
                    <span className="text-white font-bold">{vehicle.stockNumber || vehicle.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 360 & Wheels */}
            <div className="space-y-12">
              <CarShowcase3D />
              <InteriorPanorama3D />
              <WheelConfigurator />
            </div>

          </div>

          {/* Right Sticky Column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-10">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#0A0A0A] border border-[#C9A227]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(201,162,39,0.1)] mb-6"
              >
                <div className="mb-8 border-b border-white/10 pb-6">
                  <span className="text-[9px] text-[#7A7A7A] font-mono uppercase tracking-[0.2em] block mb-2">Showroom Price</span>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl text-[#C9A227] font-bold">{vehicle.currency}</span>
                    <span className="text-4xl sm:text-5xl font-serif font-extrabold text-white tracking-tighter">
                      {vehicle.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#A0A0A0] mt-3">Excludes taxes, registration, and shipping logistics.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => playVehicleEngineSound(vehicle, (revving) => setIsRevving(revving))}
                    className={`w-full h-14 rounded-full font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 border ${
                      isRevving 
                        ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_30px_rgba(201,162,39,0.8)] scale-102' 
                        : 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/40 hover:bg-[#C9A227] hover:text-black shadow-[0_0_20px_rgba(201,162,39,0.2)]'
                    }`}
                  >
                    {isRevving ? <Activity className="w-4 h-4 animate-pulse text-black" /> : <Volume2 className="w-4 h-4 text-[#C9A227] group-hover:text-black" />}
                    <span>{isRevving ? 'REVVING ENGINE...' : `IGNITE ${vehicle.make.toUpperCase()} ENGINE SOUND`}</span>
                  </button>

                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full h-14 rounded-full bg-white text-black font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-[#C9A227] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                  >
                    <span>Secure VIP Viewing</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="https://wa.me/971508919441"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-14 rounded-full bg-[#111] border border-emerald-500/30 text-emerald-500 font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-3"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </a>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={() => setEmiModalOpen(true)}
                      className="h-12 rounded-xl bg-black border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest hover:border-[#C9A227] hover:text-[#C9A227] transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Finance</span>
                    </button>
                    <PdfBrochureButton vehicle={vehicle} />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0]">
                    <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>150-Point Inspection Passed</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0]">
                    <Globe className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>Global Air Freight Ready</span>
                  </div>
                </div>
              </motion.div>

              {/* Insurance Estimate Module */}
              <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                 className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-xs font-mono uppercase tracking-widest text-white">Insurance Estimate</h4>
                   <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div className="flex items-end justify-between bg-black p-4 rounded-xl border border-white/5">
                   <div>
                      <span className="text-[10px] text-[#7A7A7A] block mb-1">From (Annual)</span>
                      <span className="text-lg font-bold text-white">{vehicle.currency} {(vehicle.price * 0.015).toLocaleString()}</span>
                   </div>
                   <button className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest hover:text-white transition-colors border-b border-[#C9A227] hover:border-white pb-0.5">
                      Get Quote
                   </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Vehicles */}
      {relatedVehicles.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-32 border-t border-white/10 pt-20">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-serif font-extrabold text-white">Curated Alternatives</h3>
            <Link href="/inventory" className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] hover:text-white transition-colors flex items-center gap-2 border-b border-[#C9A227] pb-1 hover:border-white">
              Explore All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedVehicles.map((rV, i) => (
              <motion.div key={rV.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <VehicleCard vehicle={rV} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vehicleName={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
      />

      <EmiCalculatorModal
        isOpen={emiModalOpen}
        onClose={() => setEmiModalOpen(false)}
        vehiclePrice={vehicle.price}
      />

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex items-center justify-center p-4"
          >
            <button onClick={() => setFullscreenImage(null)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors z-50">
              <X className="w-5 h-5" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={fullscreenImage} 
              alt="Fullscreen View" 
              className="max-w-full max-h-full rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
