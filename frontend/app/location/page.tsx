'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, Navigation, Car } from 'lucide-react'
import { API_BASE_URL } from '../../lib/api'

export default function LocationPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setSettings(data.data)
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err))
      .finally(() => setLoading(false))
  }, [])

  const mapEmbedUrl = settings?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3611.834168051662!2d55.22271811500845!3d25.14120378392261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6a19f2a4e21b%3A0x6e7b233a5980e1b6!4sAl%20Quoz%20Industrial%20Area%203%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1622650000000!5m2!1sen!2s'
  const address = settings?.address || 'Sheikh Zayed Road, Al Quoz Industrial 3, Dubai, United Arab Emirates'
  const phone = settings?.phone || '+971 50 891 9441'
  const email = settings?.email || 'info@techzoetic.com'
  const hours = settings?.openingHours || 'Saturday – Thursday: 10:00 AM – 9:00 PM (GST)\nFriday: 2:00 PM – 9:00 PM (GST)'
  const showroomName = settings?.showroomName || 'Apex Luxury Automobiles'

  // Format WhatsApp link based on phone number (remove spaces/plus)
  const whatsappNumber = phone.replace(/[^0-9]/g, '')
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-4 font-bold">
          Our Showroom
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
          Location & Directions
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
          Experience our exclusive collection of luxury vehicles in person at our flagship showroom in the heart of Dubai.
        </p>
      </div>

      {/* Map Embed - Full Width */}
      <div className="w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.05)] mb-12 relative z-10 bg-[#0A0A0A]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
            <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(85%)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="opacity-80 hover:opacity-100 transition-opacity duration-500"
          ></iframe>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Showroom Details Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
          {/* Subtle glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C9A227]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#C9A227]/30 transition-colors duration-700" />
          
          <h2 className="text-2xl font-serif font-bold text-white mb-8 relative z-10">{showroomName} Flagship</h2>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/50 border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1 font-bold">Address</span>
                <span className="text-sm text-gray-300 font-light whitespace-pre-line">{address}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/50 border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 mt-1">
                <Clock className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1 font-bold">Opening Hours</span>
                <span className="text-sm text-gray-300 font-light whitespace-pre-line">{hours}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/50 border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 mt-1">
                <Phone className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1 font-bold">Direct Line</span>
                <span className="text-sm text-gray-300 font-light">{phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/50 border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 mt-1">
                <Mail className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1 font-bold">Email Concierge</span>
                <span className="text-sm text-gray-300 font-light">{email}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4 relative z-10">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-full bg-[#C9A227] text-[#050505] font-bold text-[10px] font-mono uppercase tracking-widest text-center hover:bg-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(201,162,39,0.3)]"
            >
              WhatsApp Us
            </a>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] bg-black/30 flex items-center justify-center text-white hover:text-[#C9A227] hover:border-[#C9A227]/50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Directions */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#050505] border border-[rgba(255,255,255,0.02)] relative">
          <h2 className="text-2xl font-serif font-bold text-white mb-8">How to Find Us</h2>
          
          <div className="space-y-8">
            <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-gradient-to-b before:from-[#C9A227] before:to-[rgba(255,255,255,0.1)]">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#0A0A0A] border border-[#C9A227] flex items-center justify-center shadow-[0_0_10px_rgba(201,162,39,0.2)]">
                <Car className="w-3 h-3 text-[#C9A227]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase font-mono tracking-widest">From Downtown Dubai</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Take Sheikh Zayed Road (E11) towards Abu Dhabi. Take the Al Manara exit (Exit 43) and turn left. Continue straight and take the second right into Al Quoz Industrial Area 3. Our showroom will be on your right side.
              </p>
            </div>

            <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-[rgba(255,255,255,0.1)]">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                <Car className="w-3 h-3 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase font-mono tracking-widest">From Dubai Marina</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Take Sheikh Zayed Road (E11) towards Sharjah/Downtown. Take the Al Manara exit (Exit 43) and turn right into Al Quoz. Continue straight and take the second right. Follow the road for 500 meters.
              </p>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                <Navigation className="w-3 h-3 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase font-mono tracking-widest">Valet Parking</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Complimentary VIP valet parking is available for all guests directly at the main entrance. Please present your vehicle to our concierge staff upon arrival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
