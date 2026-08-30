'use client'

import React, { useState, useCallback } from 'react'
import { Vehicle, VehicleImage } from '../../../lib/types'
import BookingModal from '../../../components/BookingModal'
import EmiCalculatorModal from '../../../components/EmiCalculatorModal'
import HeroGallery from './_components/HeroGallery'
import FullscreenLightbox from './_components/FullscreenLightbox'
import MediaGallery from './_components/MediaGallery'
import SpecificationsGrid from './_components/SpecificationsGrid'
import TrustBadges from './_components/TrustBadges'
import ProvenanceStory from './_components/ProvenanceStory'
import AcquisitionDesk from './_components/AcquisitionDesk'
import EngineAudioPlayer from './_components/EngineAudioPlayer'
import RelatedVehicles from './_components/RelatedVehicles'
import Exterior360Viewer from './_components/Exterior360Viewer'
import Interior360Panorama from './_components/Interior360Panorama'
import Vehicle3DStudio from './_components/Vehicle3DStudio'

interface VehicleClientProps {
  vehicle: Vehicle
  relatedVehicles: Vehicle[]
}

export default function VehicleClient({ vehicle, relatedVehicles }: VehicleClientProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
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
            onFinance={() => setEmiModalOpen(true)}
          />
        </section>

        {/* Interactive 3D Studio — orbit, repaint, start, shop real parts */}
        <section className="mt-16 sm:mt-24">
          <Vehicle3DStudio vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
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
            <Exterior360Viewer frames={vehicle.frames360} hotspots={vehicle.hotspots} />
          </section>
        )}

        {/* 360 Interior Cockpit Tour */}
        {galleryImages.some(img => img.mediaCategory === 'interior' || img.mediaCategory === 'dashboard') && (
          <section className="mt-16 sm:mt-24">
            <Interior360Panorama images={galleryImages.filter(img => img.mediaCategory === 'interior' || img.mediaCategory === 'dashboard')} />
          </section>
        )}

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
