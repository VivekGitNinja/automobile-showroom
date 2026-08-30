'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Gauge, Award, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { fetchVehiclesFromApi } from '../lib/api'
import { Vehicle } from '../lib/types'

export default function ComparisonWidget() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleA, setVehicleA] = useState<Vehicle | null>(null)
  const [vehicleB, setVehicleB] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchVehiclesFromApi()
      .then((response) => {
        if (isMounted) {
          const data = response.data
          setVehicles(data || [])
          if (data && data.length >= 2) {
            setVehicleA(data[0])
            setVehicleB(data[1])
          } else if (data && data.length === 1) {
            setVehicleA(data[0])
            setVehicleB(data[0])
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-[rgba(255,255,255,0.08)] flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
      </section>
    )
  }

  if (vehicles.length < 2) {
    return null // Not enough vehicles to compare
  }

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-[rgba(255,255,255,0.08)]">
      
      {/* Background Radial Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A227]/10 rounded-full blur-[220px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] text-xs font-mono uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benchmark Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Side-by-Side <span className="gold-gradient-text italic font-serif">Supercar Spec Comparison</span>
          </h2>
          <p className="text-sm text-[#B8B8B8] font-light">
            Compare key technical metrics, powertrain output, and showroom pricing for Dubai's top hypercars.
          </p>
        </div>

        {/* Comparison Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Vehicle A Card */}
          <div className="lg:col-span-5 p-8 rounded-3xl glass-panel border border-[rgba(255,255,255,0.08)] space-y-6 luxury-card-hover">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest block">Select Vehicle A</label>
              <select
                value={vehicleA?.id || ''}
                onChange={(e) => setVehicleA(vehicles.find((v) => v.id === e.target.value) || vehicles[0])}
                className="w-full px-4 py-3 rounded-xl bg-[#0E0E0E] border border-[rgba(255,255,255,0.12)] text-white font-serif font-bold text-lg focus:outline-none focus:border-[#C9A227]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                ))}
              </select>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
              {/* ENGINEERING JUSTIFICATION: Dynamic CMS/CDN image URLs cannot be statically configured in next.config.js remotePatterns */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {(vehicleA?.images?.[0] || vehicleA?.image) && <img src={vehicleA.images?.[0] || vehicleA.image} alt={vehicleA.model} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent opacity-80" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Powertrain</span>
                <span className="text-white font-bold">{vehicleA?.engine || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Transmission</span>
                <span className="text-white font-bold">{vehicleA?.transmission || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Showroom Price</span>
                <span className="text-[#C9A227] font-bold text-sm">{vehicleA?.price ? `AED ${vehicleA.price.toLocaleString()}` : 'POA'}</span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="lg:col-span-2 text-center py-4">
            <div className="w-16 h-16 rounded-full border border-[#C9A227] bg-[#C9A227]/10 flex items-center justify-center mx-auto shadow-gold-glow">
              <span className="text-xl font-serif font-extrabold gold-gradient-text">VS</span>
            </div>
          </div>

          {/* Vehicle B Card */}
          <div className="lg:col-span-5 p-8 rounded-3xl glass-panel border border-[rgba(255,255,255,0.08)] space-y-6 luxury-card-hover">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest block">Select Vehicle B</label>
              <select
                value={vehicleB?.id || ''}
                onChange={(e) => setVehicleB(vehicles.find((v) => v.id === e.target.value) || vehicles[1])}
                className="w-full px-4 py-3 rounded-xl bg-[#0E0E0E] border border-[rgba(255,255,255,0.12)] text-white font-serif font-bold text-lg focus:outline-none focus:border-[#C9A227]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                ))}
              </select>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
              {/* ENGINEERING JUSTIFICATION: Dynamic CMS/CDN image URLs cannot be statically configured in next.config.js remotePatterns */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {(vehicleB?.images?.[0] || vehicleB?.image) && <img src={vehicleB.images?.[0] || vehicleB.image} alt={vehicleB.model} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent opacity-80" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Powertrain</span>
                <span className="text-white font-bold">{vehicleB?.engine || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Transmission</span>
                <span className="text-white font-bold">{vehicleB?.transmission || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[#7A7A7A]">Showroom Price</span>
                <span className="text-[#C9A227] font-bold text-sm">{vehicleB?.price ? `AED ${vehicleB.price.toLocaleString()}` : 'POA'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
