import React from 'react'
import Link from 'next/link'

export default function BrandsPage() {
  const brands = [
    { name: 'Rolls-Royce', count: 18, desc: 'The pinnacle of bespoke luxury and effortless power.' },
    { name: 'Bugatti', count: 4, desc: 'Unmatched W16 hypercar engineering and speed mastery.' },
    { name: 'Ferrari', count: 32, desc: 'Pure Italian racing heritage and electrifying performance.' },
    { name: 'Lamborghini', count: 26, desc: 'Extroverted design, atmospheric V12 sound, and raw emotion.' },
    { name: 'Porsche', count: 45, desc: 'Precision engineering, track-focused GT models, and iconic silhouettes.' },
    { name: 'Mercedes-Maybach', count: 14, desc: 'First-class luxury, supreme silence, and grand presence.' },
  ]

  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 border-b border-gold/20 pb-8 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold block mb-2">
          Automobile Marques
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
          Bespoke Portfolios
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl font-light">
          Explore our curated selection of prestige vehicle manufacturers represented in our Dubai showroom.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((b) => (
          <Link
            key={b.name}
            href={`/inventory?brand=${b.name.toLowerCase()}`}
            className="p-8 rounded-2xl bg-dark-card border border-gold/20 hover:border-gold hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                {b.name}
              </h3>
              <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono">
                {b.count} Vehicles
              </span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
              {b.desc}
            </p>
            <span className="text-xs font-mono uppercase tracking-widest text-gold group-hover:underline">
              View Portfolio →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
