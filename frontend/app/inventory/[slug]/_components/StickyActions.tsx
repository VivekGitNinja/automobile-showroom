'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Share2, Calendar, MessageCircle, CreditCard, Heart, GitCompare, Download, Video, Check } from 'lucide-react'
import { Vehicle } from '../../../../lib/types'
import { useSettings } from '../../../../lib/useSettings'

interface StickyActionsProps {
  vehicle: Vehicle
  onBookViewing: () => void
  onFinance: () => void
}

export default function StickyActions({ vehicle, onBookViewing, onFinance }: StickyActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const { waLink, phone } = useSettings()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const whatsappText = `I am interested in ${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const whatsappUrl = waLink(whatsappText)
  const callUrl = `tel:+${phone.replace(/[^0-9]/g, '')}`

  const formattedPrice = vehicle.price
    ? new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: vehicle.currency || 'AED',
        maximumFractionDigits: 0,
      }).format(Number(vehicle.price))
    : 'Price Upon Request'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-2xl border-t border-[#C9A227]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
        >
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between max-w-[1400px] mx-auto px-8 h-[80px]">
            {/* Left Info Badge */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-serif font-bold text-white tracking-wide">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
                <span className="text-xs font-mono text-[#C9A227] font-semibold tracking-wider">
                  {formattedPrice}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBookViewing}
                className="h-11 px-6 rounded-full text-[11px] font-mono uppercase tracking-widest bg-[#C9A227] text-black font-bold hover:bg-[#E5C158] hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#C9A227]/20"
              >
                <Calendar className="w-4 h-4" /> Book Viewing
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-6 rounded-full text-[11px] font-mono uppercase tracking-widest bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>

              <a
                href={callUrl}
                className="h-11 px-5 rounded-full text-[11px] font-mono uppercase tracking-widest border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call
              </a>

              <button
                onClick={onFinance}
                className="h-11 px-5 rounded-full text-[11px] font-mono uppercase tracking-widest border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Finance
              </button>

              <div className="h-6 w-px bg-white/10 mx-1" />

              <button
                onClick={handleShare}
                className="h-11 w-11 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center relative"
                title="Share Vehicle"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex lg:hidden flex-col px-4 py-3 gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-serif font-bold text-white truncate max-w-[200px]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <span className="text-xs font-mono text-[#C9A227] font-bold">
                {formattedPrice}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBookViewing}
                className="flex-1 h-11 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#C9A227] text-black font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5" /> Book
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>

              <a
                href={callUrl}
                className="h-11 px-4 rounded-full text-[10px] font-mono uppercase tracking-widest border border-white/20 text-white flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
