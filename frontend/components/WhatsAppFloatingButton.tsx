'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useSettings } from '../lib/useSettings'

export default function WhatsAppFloatingButton() {
  const pathname = usePathname()
  const { waLink } = useSettings()

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20, 
        delay: 0.5 
      }}
      className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[990]"
    >
      <div className="relative group">
        {/* Tooltip on hover */}
        <div className="absolute -top-12 left-0 sm:left-1/2 sm:-translate-x-1/2 px-3.5 py-1.5 bg-[#060606] border border-emerald-500/30 text-white text-[10px] font-mono uppercase tracking-widest rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-[0_4px_25px_rgba(0,0,0,0.8)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>Direct Concierge WhatsApp</span>
          <div className="absolute -bottom-1 left-6 sm:left-1/2 sm:-translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-emerald-500/30"></div>
        </div>

        {/* Luxury WhatsApp Button Badge */}
        <a
          href={waLink('Hello Apex Concierge, I am interested in viewing your luxury vehicle inventory.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact VIP Concierge on WhatsApp"
          className="relative flex items-center gap-3 px-3.5 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#080808]/95 border border-emerald-500/30 text-white font-mono font-bold text-xs uppercase tracking-[0.15em] shadow-[0_0_25px_rgba(37,211,102,0.25)] hover:shadow-[0_0_35px_rgba(37,211,102,0.45)] hover:border-emerald-400 backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03]"
        >
          {/* Pulsing emerald icon container */}
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] text-black flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="text-black"
              >
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.622 2.94-6.592 6.592-6.592a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-black animate-pulse" />
          </div>

          {/* Text on larger screens */}
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest flex items-center gap-1">
              WhatsApp Desk
            </span>
            <span className="text-xs font-serif font-bold text-white tracking-wide">
              Live Concierge
            </span>
          </div>
        </a>
      </div>
    </motion.div>
  )
}
