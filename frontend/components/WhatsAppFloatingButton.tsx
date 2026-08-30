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
      className="fixed bottom-6 right-6 z-[50]"
    >
      <div className="relative group">
        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0A0A0A] border border-white/10 text-white text-xs font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
          Chat with us on WhatsApp
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white/10"></div>
        </div>

        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></div>

        {/* Button */}
        <a
          href={waLink('Hello, I am interested in your luxury vehicles')}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="sm:w-8 sm:h-8"
          >
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.622 2.94-6.592 6.592-6.592a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
          </svg>
        </a>
      </div>
    </motion.div>
  )
}
