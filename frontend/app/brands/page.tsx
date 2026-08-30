import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { SITE_URL } from '../../lib/site'
import { API_BASE_URL } from '../../lib/api'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Luxury Car Brands — Apex Luxury Automobiles',
  alternates: {
    canonical: `${SITE_URL}/brands`,
  },
}

// Curated brand copy — counts always come from the live inventory
const BRAND_COPY: Record<string, string> = {
  'Rolls-Royce': 'The pinnacle of bespoke luxury and effortless power.',
  'Bugatti': 'Unmatched W16 hypercar engineering and speed mastery.',
  'Ferrari': 'Pure Italian racing heritage and electrifying performance.',
  'Lamborghini': 'Extroverted design, atmospheric V12 sound, and raw emotion.',
  'Porsche': 'Precision engineering, track-focused GT models, and iconic silhouettes.',
  'Mercedes-Maybach': 'First-class luxury, supreme silence, and grand presence.',
  'Bentley': 'Handcrafted British grand tourers with immense presence.',
  'McLaren': 'Race-bred aerodynamics and relentless performance.',
  'Aston Martin': 'Timeless British elegance fused with sporting pedigree.',
  'Koenigsegg': 'Extreme engineering from the Swedish hypercar pioneers.',
  'Pagani': 'Art on wheels — obsessive detail and V12 theatre.',
  'Maserati': 'Italian sophistication with racing DNA.',
}

async function getBrands(): Promise<{ name: string; slug: string; count: number }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vehicles/brands`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export default async function BrandsPage() {
  const brands = await getBrands()

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

      {brands.length === 0 ? (
        <p className="text-sm text-gray-400 font-light">
          Our brand portfolio is being updated. In the meantime, browse the{' '}
          <Link href="/inventory" className="text-gold hover:underline">full inventory</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/inventory?brand=${b.slug}`}
              className="p-8 rounded-2xl bg-dark-card border border-gold/20 hover:border-gold hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                  {b.name}
                </h3>
                <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono">
                  {b.count} {b.count === 1 ? 'Vehicle' : 'Vehicles'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
                {BRAND_COPY[b.name] || `Discover our curated ${b.name} collection in Dubai.`}
              </p>
              <span className="text-xs font-mono uppercase tracking-widest text-gold group-hover:underline">
                View Portfolio →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
