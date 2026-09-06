import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { fetchVehiclesFromApi, fetchJournalsFromApi } from '../lib/api'
import { Vehicle, Journal } from '../lib/types'
import { SITE_URL, SITE_NAME } from '../lib/site'

// The homepage is server-rendered so search engines index the actual vehicle
// content; the client component hydrates it without refetching.
export const revalidate = 120

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: {
    siteName: SITE_NAME,
    url: SITE_URL,
  },
}

export default async function HomePage() {
  let featured: Vehicle[] = []
  let arrivals: Vehicle[] = []
  let total: number | null = null
  let journals: Journal[] = []

  try {
    const [vehicleResult, journalData] = await Promise.all([
      fetchVehiclesFromApi({ limit: 12 }, { next: { revalidate: 120 } }),
      fetchJournalsFromApi(),
    ])
    const data = vehicleResult.data || []
    featured = data.filter((v) => v.isFeatured).slice(0, 3)
    if (featured.length === 0) featured = data.slice(0, 3)
    arrivals = data.slice(0, 4)
    total = vehicleResult.total
    journals = (journalData || []).slice(0, 3)
  } catch (error) {
    console.error('Homepage SSR fetch failed, falling back to client fetch', error)
  }

  return (
    <HomeClient
      initialFeatured={featured}
      initialArrivals={arrivals}
      initialJournals={journals}
      initialTotal={total}
    />
  )
}
