'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function CarRunningAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Parallax move slightly while it's also driving via CSS
  const x = useTransform(scrollYProgress, [0, 1], [-50, 50])

  return (
    <div ref={containerRef} className="relative w-full h-40 overflow-hidden bg-transparent py-4 my-8 border-y border-white/5 flex items-center">
      <div className="absolute inset-0 noise-overlay"></div>
      
      {/* Background Speed Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
         <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent absolute top-1/4 animate-pulse" style={{ animationDuration: '2s' }}></div>
         <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent absolute top-3/4 animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
      </div>

      <motion.div style={{ x }} className="w-full h-full relative flex items-center pointer-events-none">
        <div className="car-drive-animation absolute w-[300px] h-auto flex items-center justify-end z-10" style={{ left: 0 }}>
          
          {/* Headlight glow trail */}
          <div className="absolute right-0 w-64 h-1 bg-gradient-to-l from-white via-white/50 to-transparent blur-md translate-x-[90%]"></div>
          <div className="absolute right-0 w-32 h-6 bg-gradient-to-l from-[#FFF5D6] to-transparent blur-2xl translate-x-[90%] opacity-80"></div>
          
          {/* Car Silhouette (Bugatti-style) */}
          <svg viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[300px] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <path d="M40 60 C35 60, 30 55, 30 50 C30 40, 45 35, 60 30 C90 20, 130 15, 170 15 C200 15, 230 25, 250 35 C270 45, 280 50, 280 55 C280 60, 275 60, 270 60 L240 60 C240 50, 225 45, 210 45 C195 45, 180 50, 180 60 L110 60 C110 50, 95 45, 80 45 C65 45, 50 50, 50 60 L40 60 Z" fill="url(#carGradient)" />
            <path d="M110 30 C130 20, 160 18, 180 20 L160 35 L120 35 Z" fill="#0A0A0A" />
            <circle cx="65" cy="60" r="12" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="210" cy="60" r="12" fill="#171717" stroke="#333" strokeWidth="2" />
            
            <circle cx="65" cy="60" r="5" fill="#C9A227" />
            <circle cx="210" cy="60" r="5" fill="#C9A227" />
            
            <path d="M275 52 L285 52 L285 55 L275 55 Z" fill="#FFF5D6" className="animate-pulse" />
            <path d="M35 48 L40 48 L40 52 L35 52 Z" fill="#FF0000" />
            
            <defs>
              <linearGradient id="carGradient" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#111" />
                <stop offset="0.5" stopColor="#333" />
                <stop offset="1" stopColor="#111" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
