import type { Metadata } from 'next'
import InventoryClient from './InventoryClient'
import { fetchVehiclesFromApi } from '../../lib/api'
import { Vehicle } from '../../lib/types'
import { SITE_URL } from '../../lib/site'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Luxury Car Inventory — Supercars & Hypercars in Dubai | Apex Luxury Automobiles',
  description: 'Browse Dubai\'s finest supercars and hypercars. Search by make, model, year and price — Rolls-Royce, Bugatti, Ferrari, Lamborghini, Porsche and more.',
  alternates: { canonical: `${SITE_URL}/inventory` },
  openGraph: {
    title: 'Luxury Car Inventory | Apex Luxury Automobiles Dubai',
    description: 'Dubai\'s finest supercars and hypercars, curated and inspected.',
    type: 'website',
  },
}

export default async function InventoryPage() {
  let initial: { data: Vehicle[]; total: number; totalPages: number } | undefined

  try {
    const result = await fetchVehiclesFromApi({ page: 1, limit: 12 }, { next: { revalidate: 120 } })
    if (result.data.length > 0) {
      initial = { data: result.data, total: result.total, totalPages: result.totalPages }
    }
  } catch (error) {
    console.error('Inventory SSR fetch failed; client will fetch', error)
  }

  return <InventoryClient initial={initial ? { ...initial, applies: true } : undefined} />
}
