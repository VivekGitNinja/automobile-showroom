import React from 'react'

const MARQUES = [
  { name: 'ROLLS-ROYCE', slug: 'rolls-royce' },
  { name: 'BUGATTI', slug: 'bugatti' },
  { name: 'FERRARI', slug: 'ferrari' },
  { name: 'LAMBORGHINI', slug: 'lamborghini' },
  { name: 'PORSCHE', slug: 'porsche' },
  { name: 'MERCEDES-BENZ', slug: 'mercedes-benz' },
  { name: 'BENTLEY', slug: 'bentley' },
  { name: 'MCLAREN', slug: 'mclaren' },
  { name: 'ASTON MARTIN', slug: 'aston-martin' },
  { name: 'PAGANI', slug: 'pagani' },
]

export default function BrandMarquee() {
  const repeated = [...MARQUES, ...MARQUES, ...MARQUES]

  return (
    <div aria-hidden="true" className="w-full py-8 glass-panel border-y border-white/10 overflow-hidden relative mt-0">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] via-[#030303]/80 to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {repeated.map((marque, idx) => (
          <div key={idx} aria-hidden="true" className="flex items-center gap-6 group cursor-default">
            <div className="w-20 h-7 relative flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <img
                src={`/uploads/brands/${marque.slug}.svg`}
                alt=""
                className="max-h-7 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              />
            </div>
            <span aria-hidden="true" className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-[0.2em] text-[#C9A227]/70 group-hover:text-[#C9A227] transition-all duration-500 cursor-crosshair">
              {marque.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/30 group-hover:bg-[#C9A227] group-hover:shadow-[0_0_10px_#C9A227] transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

