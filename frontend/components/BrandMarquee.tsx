import React from 'react'

export default function BrandMarquee() {
  const marques = [
    'ROLLS-ROYCE',
    'BUGATTI',
    'FERRARI',
    'LAMBORGHINI',
    'RANGE ROVER SV',
    'PORSCHE GT3',
    'ASTON MARTIN',
    'MAYBACH',
    'MCLAREN',
    'BENTLEY',
  ]

  return (
    <div className="w-full py-12 glass-panel border-y border-white/10 overflow-hidden relative mt-0">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] via-[#030303]/80 to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
        {[...marques, ...marques, ...marques].map((marque, idx) => (
          <div key={idx} className="flex items-center gap-16 group cursor-default">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-[0.2em] text-outline-luxury group-hover:gold-gradient-text transition-all duration-500 cursor-crosshair">
              {marque}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/30 group-hover:bg-[#C9A227] group-hover:shadow-[0_0_10px_#C9A227] transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  )
}
