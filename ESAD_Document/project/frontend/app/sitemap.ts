import { MetadataRoute } from 'next'
import { fetchVehiclesFromApi } from '../lib/api'
import { Vehicle } from '../lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fetch all vehicles to generate dynamic routes
  let vehicles: Vehicle[] = []
  try {
    const result = await fetchVehiclesFromApi(undefined, { next: { revalidate: 3600 } })
    vehicles = result.data || []
  } catch (error) {
    console.error('Failed to fetch vehicles for sitemap', error)
  }

  const vehicleUrls = vehicles.map((vehicle) => ({
    url: `${baseUrl}/inventory/${vehicle.slug}`,
    lastModified: new Date(vehicle.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell-your-car`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...vehicleUrls,
  ]
}
