'use client'

import React, { useState, useCallback } from 'react'
import { Vehicle, VehicleImage } from '../../../lib/types'
import BookingModal from '../../../components/BookingModal'
import CallbackModal from '../../../components/CallbackModal'
import EmiCalculatorModal from '../../../components/EmiCalculatorModal'
import HeroGallery from './_components/HeroGallery'
import FullscreenLightbox from './_components/FullscreenLightbox'
import MediaGallery from './_components/MediaGallery'
import SpecificationsGrid from './_components/SpecificationsGrid'
import TrustBadges from './_components/TrustBadges'
import ProvenanceStory from './_components/ProvenanceStory'
import AcquisitionDesk from './_components/AcquisitionDesk'
import EngineAudioPlayer from './_components/EngineAudioPlayer'
import dynamic from 'next/dynamic'
import RelatedVehicles from './_components/RelatedVehicles'

const Vehicle3DStudio = dynamic(() => import('./_components/Vehicle3DStudio'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] sm:h-[600px] rounded-[32px] bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center p-8 animate-pulse">
      <div className="w-16 h-16 rounded-full border border-[#C9A227]/30 border-t-[#C9A227] animate-spin mb-4" />
      <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227]">
        Loading Interactive 3D Studio...
      </span>
    </div>
  ),
})

const Exterior360Viewer = dynamic(() => import('./_components/Exterior360Viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-[32px] bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center p-8 animate-pulse">
      <div className="w-12 h-12 rounded-full border border-[#C9A227]/30 border-t-[#C9A227] animate-spin mb-4" />
      <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227]">
        Loading 360° Exterior Studio...
      </span>
    </div>
  ),
})

const Interior360Panorama = dynamic(() => import('./_components/Interior360Panorama'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-[32px] bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center p-8 animate-pulse">
      <div className="w-12 h-12 rounded-full border border-[#C9A227]/30 border-t-[#C9A227] animate-spin mb-4" />
      <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227]">
        Loading 360° Cockpit Panorama...
      </span>
    </div>
  ),
})

interface VehicleClientProps {
  vehicle: Vehicle
  relatedVehicles: Vehicle[]
}

export default function VehicleClient({ vehicle, relatedVehicles }: VehicleClientProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [emiModalOpen, setEmiModalOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const galleryImages: VehicleImage[] = vehicle.galleryImages || []

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const openGalleryFromHero = useCallback(() => {
    setLightboxIndex(0)
    setLightboxOpen(true)
  }, [])

  return (
    <div className="bg-[#050505] min-h-screen">

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <HeroGallery
        vehicle={vehicle}
        images={galleryImages}
        onExpandGallery={openGalleryFromHero}
        onBookViewing={() => setBookingModalOpen(true)}
      />

      {/* ── Main Content Container ───────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Dedicated VIP Acquisition Desk (In-Page, Not Bottom Sticky) */}
        <section className="mt-12 sm:mt-16">
          <AcquisitionDesk
            vehicle={vehicle}
            onBookViewing={() => setBookingModalOpen(true)}
            onRequestCallback={() => setCallbackModalOpen(true)}
            onFinance={() => setEmiModalOpen(true)}
          />
        </section>

        {/* Interactive 3D Studio — orbit, repaint, start, shop real parts */}
        <section className="mt-16 sm:mt-24">
          <Vehicle3DStudio vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} vehicle={vehicle} />
        </section>

        {/* Cinematic Vehicle Film */}
        {vehicle.videoUrl && (
          <section className="mt-16 sm:mt-24">
            <div className="mb-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
                Motion
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                The Vehicle <span className="italic font-light text-white/70">In Film</span>
              </h2>
            </div>
            <div className="rounded-[32px] overflow-hidden border border-white/10 bg-black">
              <video
                controls
                preload="metadata"
                playsInline
                className="w-full aspect-video"
                poster={galleryImages[0]?.urlOriginal}
              >
                <source src={vehicle.videoUrl} />
                Your browser does not support embedded video.
              </video>
            </div>
          </section>
        )}

        {/* 360 Exterior Studio & Part Inspector */}
        {vehicle.frames360 && vehicle.frames360.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <Exterior360Viewer frames={vehicle.frames360} hotspots={vehicle.hotspots} vehicle={vehicle} />
          </section>
        )}

        {/* 360 Interior Cockpit Tour */}
        <section className="mt-16 sm:mt-24">
          <Interior360Panorama
            images={
              galleryImages.filter(img => img.mediaCategory === 'interior' || img.mediaCategory === 'dashboard').length > 0
                ? galleryImages.filter(img => img.mediaCategory === 'interior' || img.mediaCategory === 'dashboard')
                : galleryImages
            }
            vehicle={vehicle}
          />
        </section>

        {/* Specifications Grid */}
        <section className="mt-16 sm:mt-24">
          <SpecificationsGrid vehicle={vehicle} />
        </section>

        {/* Trust Verification Badges */}
        <section className="mt-16 sm:mt-24">
          <TrustBadges vehicle={vehicle} />
        </section>

        {/* Provenance & Heritage Story */}
        {vehicle.stories && vehicle.stories.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <ProvenanceStory
              description={vehicle.description}
              make={vehicle.make}
              model={vehicle.model}
              stories={vehicle.stories}
            />
          </section>
        )}

        {/* Categorized Media Gallery */}
        {galleryImages.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <MediaGallery
              images={galleryImages}
              onImageClick={openLightbox}
            />
          </section>
        )}

        {/* Engine Symphony / Exhaust Acoustic Notes */}
        {vehicle.sounds && vehicle.sounds.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <EngineAudioPlayer
              sounds={vehicle.sounds}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
            />
          </section>
        )}

        {/* Curated Related Vehicles */}
        <section className="mt-16 sm:mt-24 border-t border-white/5 pt-16 sm:pt-24">
          <RelatedVehicles
            vehicles={relatedVehicles}
            currentSlug={vehicle.slug}
          />
        </section>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        vehicleName={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
      />

      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      />

      <EmiCalculatorModal
        isOpen={emiModalOpen}
        onClose={() => setEmiModalOpen(false)}
        vehiclePrice={vehicle.price}
      />

      {/* ── Fullscreen Lightbox ──────────────────────────────────────── */}
      <FullscreenLightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
