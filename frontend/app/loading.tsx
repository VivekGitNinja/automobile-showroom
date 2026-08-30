'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] pt-36 sm:pt-40">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 mb-8 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 flex items-center justify-center shadow-gold-glow"
      >
        <Shield className="w-10 h-10 text-[#C9A227]" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-[#C9A227] font-mono uppercase tracking-widest text-sm"
      >
        Preparing Your Experience
      </motion.p>
    </div>
  )
}
