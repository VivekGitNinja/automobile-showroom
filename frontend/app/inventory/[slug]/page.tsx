import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VehicleClient from './VehicleClient'
import { Vehicle, VehicleImage } from '../../../lib/types'

import { fetchVehicleBySlugFromApi, fetchVehiclesFromApi } from '../../../lib/api'
import { SITE_URL } from '../../../lib/site'

// ---------------------------------------------------------------------------
// Server-side data fetch
// ---------------------------------------------------------------------------
async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    return await fetchVehicleBySlugFromApi(slug)
  } catch {
    return null
  }
}

async function getRelatedVehicles(currentSlug: string): Promise<Vehicle[]> {
  try {
    const res = await fetchVehiclesFromApi({ limit: 4 })
    return res.data
      .filter((v: any) => v.slug !== currentSlug)
      .slice(0, 3)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug)
  if (!vehicle) {
    return { title: 'Vehicle Not Found — Apex Luxury Automobiles' }
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} — Apex Luxury Automobiles`
  const description = vehicle.description
    ? vehicle.description.slice(0, 160)
    : `Discover the ${vehicle.year} ${vehicle.make} ${vehicle.model}. ${vehicle.engine || ''} ${vehicle.horsepower || ''}. Available at Apex Luxury Automobiles, Dubai.`
  const heroImage = vehicle.galleryImages?.[0]?.urlOriginal || vehicle.images?.[0] || '/images/hero/hero-car-1.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: heroImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroImage],
    },
    other: {
      'product:price:amount': vehicle.price?.toString() || '',
      'product:price:currency': vehicle.currency || 'AED',
    },
    alternates: {
      canonical: `${SITE_URL}/inventory/${params.slug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page Component (Server)
// ---------------------------------------------------------------------------
export default async function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const [vehicle, relatedVehicles] = await Promise.all([
    getVehicle(params.slug),
    getRelatedVehicles(params.slug),
  ])

  if (!vehicle) {
    notFound()
  }

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    manufacturer: { '@type': 'Organization', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: vehicle.year?.toString(),
    bodyType: vehicle.bodyType,
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    color: vehicle.exteriorColor,
    vehicleInteriorColor: vehicle.interiorColor,
    image: vehicle.galleryImages?.map((i: VehicleImage) => i.urlOriginal) || vehicle.images,
    description: vehicle.description || `${vehicle.make} ${vehicle.model} available at Apex Luxury Automobiles`,
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: vehicle.currency || 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Apex Luxury Automobiles',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dubai',
          addressCountry: 'AE',
        },
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VehicleClient vehicle={vehicle} relatedVehicles={relatedVehicles} />
    </>
  )
}
