import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '../../lib/site'
import { fetchPartCategories } from '../../lib/api'
import PartsCatalogue from './PartsCatalogue'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Genuine Spare Parts & Performance Components — Apex Luxury Automobiles',
  description: 'Genuine OEM and vetted performance parts for Ferrari, Lamborghini, Porsche, Rolls-Royce, Bentley and more. Wheels, brakes, carbon aero, interior and service components — Dubai showroom with worldwide shipping.',
  alternates: { canonical: `${SITE_URL}/parts` },
  openGraph: {
    title: 'Genuine Spare Parts & Performance Components | Apex Luxury',
    description: 'Genuine OEM and performance parts for the world\'s finest marques — from our Dubai showroom.',
    type: 'website',
  },
}

export default async function PartsPage() {
  const categories = await fetchPartCategories()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Spare Parts & Performance Components',
    url: `${SITE_URL}/parts`,
    hasPart: categories.map((c) => ({
      '@type': 'ItemList',
      name: c.name,
      numberOfItems: c.count,
      url: `${SITE_URL}/parts?category=${c.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-36 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-4">
            Genuine Components Division
          </span>
          <h1 className="text-5xl sm:text-7xl font-serif font-extrabold text-white mb-6 tracking-tight">
            Spare <span className="italic font-light text-white/70">Parts</span>
          </h1>
          <p className="text-sm text-[#A0A0A0] max-w-2xl mx-auto font-light leading-relaxed">
            Genuine OEM and carefully vetted performance components for the marques we represent.
            Fitted and documented by our certified workshop — protecting your warranty and resale value.
          </p>
        </div>

        <PartsCatalogue categories={categories} />
      </div>
    </>
  )
}
