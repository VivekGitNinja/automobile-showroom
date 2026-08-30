'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle, Phone, CreditCard, Share2, ShieldCheck, Check, Sparkles, Crown } from 'lucide-react'
import { Vehicle } from '../../../../lib/types'
import PdfBrochureButton from '../../../../components/PdfBrochureButton'

interface AcquisitionDeskProps {
  vehicle: Vehicle
  onBookViewing: () => void
  onFinance: () => void
}

export default function AcquisitionDesk({ vehicle, onBookViewing, onFinance }: AcquisitionDeskProps) {
  const [copied, setCopied] = useState(false)

  const whatsappText = `I am interested in acquiring the ${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const whatsappUrl = `https://wa.me/971508919441?text=${encodeURIComponent(whatsappText)}`
  const callUrl = 'tel:+971508919441'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          url: window.location.href,
        })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  const formattedPrice = vehicle.price
    ? `${vehicle.currency || 'USD'} $${vehicle.price.toLocaleString()}`
    : 'Price Upon Application'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#080808]/90 backdrop-blur-2xl border border-[#C9A227]/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden my-12"
    >
      {/* Ambient Gold Glow Background */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C9A227]/10 blur-3xl pointer-events-none" />

      {/* Top Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] font-bold">
            Apex Executive Acquisition Desk
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ready For Immediate Delivery
          </span>
          <span className="hidden sm:inline-block text-white/40">·</span>
          <span className="hidden sm:inline-block text-white/60">Dubai Showroom Inventory</span>
        </div>
      </div>

      {/* Main Vehicle & Price Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
        {/* Title & Metadata (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227]">
            {vehicle.make} Flagship Series
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60 pt-1">
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
              VIN: {vehicle.vin || 'Not specified'}
            </span>
            <span>·</span>
            <span>GCC Specification</span>
            <span>·</span>
            <span>Private Lounge Viewing Available</span>
          </div>
        </div>

        {/* Price Card (5 Cols) */}
        <div className="lg:col-span-5 bg-black/60 border border-[#C9A227]/30 rounded-2xl p-6 flex flex-col justify-center items-start lg:items-end shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] mb-1">
            Official Showroom Price
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-white">
            {formattedPrice}
          </div>
          <span className="text-[11px] font-mono text-white/40 mt-1">
            Excluding GCC Export Tax & International Freight
          </span>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 pt-6 border-t border-white/10">
        <button
          onClick={onBookViewing}
          className="h-12 px-5 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-[#C9A227] text-black font-bold hover:bg-[#E5C158] hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#C9A227]/20"
        >
          <Calendar className="w-4 h-4" /> Book Viewing
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-5 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp VIP
        </a>

        <a
          href={callUrl}
          className="h-12 px-5 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4 text-[#C9A227]" /> Call Desk
        </a>

        <button
          onClick={onFinance}
          className="h-12 px-5 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 text-[#C9A227]" /> Finance
        </button>

        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <PdfBrochureButton vehicle={vehicle} />
        </div>

        <button
          onClick={handleShare}
          className="h-12 px-4 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#C9A227]" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>
    </motion.div>
  )
}
