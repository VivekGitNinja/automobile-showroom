'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '../lib/useSettings'

export default function WhatsAppFloatingButton() {
  const { waLink } = useSettings()
  const [windowDimensions, setWindowDimensions] = useState({ width: 1440, height: 900 })
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      const handleResize = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    window.open(waLink('Hello Apex Concierge, I am interested in viewing your luxury vehicle inventory.'), '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={{
        left: -10,
        right: Math.max(windowDimensions.width - 90, 200),
        top: -Math.max(windowDimensions.height - 110, 200),
        bottom: 10,
      }}
      onDragStart={() => {
        isDraggingRef.current = true
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false
        }, 150)
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
      className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[997] select-none touch-none"
    >
      <div className="relative group">
        {/* Apple Hover Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest text-emerald-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
          WhatsApp Desk
        </div>

        {/* Apple Floating Orb - Logo Only */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Contact VIP Concierge on WhatsApp"
          className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#08080a]/85 backdrop-blur-3xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(37,211,102,0.35)] transition-all duration-300"
        >
          {/* Inner Official WhatsApp Glyph Orb */}
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-black flex items-center justify-center shadow-[0_2px_12px_rgba(37,211,102,0.4)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="text-black"
            >
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.622 2.94-6.592 6.592-6.592a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
            </svg>
          </div>

          {/* Micro Status Beacon */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#08080a] animate-pulse" />
        </button>
      </div>
    </motion.div>
  )
}
