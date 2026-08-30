import { MetadataRoute } from 'next'
import { fetchVehiclesFromApi, API_BASE_URL } from '../lib/api'
import { SITE_URL } from '../lib/site'
import { Vehicle, Journal } from '../lib/types'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Fetch ALL published vehicles by walking every page of the inventory.
  let vehicles: Vehicle[] = []
  try {
    let page = 1
    let totalPages = 1
    do {
      const result = await fetchVehiclesFromApi({ page, limit: 100 }, { next: { revalidate: 3600 } })
      vehicles = vehicles.concat(result.data || [])
      totalPages = result.totalPages || 1
      page++
    } while (page <= totalPages)
  } catch (error) {
    console.error('Failed to fetch vehicles for sitemap', error)
  }

  // Brand landing pages
  let brands: { name: string; slug: string }[] = []
  try {
    const res = await fetch(`${API_BASE_URL}/vehicles/brands`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      brands = (data.data || []).map((b: any) => ({ name: b.name, slug: b.slug }))
    }
  } catch (error) {
    console.error('Failed to fetch brands for sitemap', error)
  }

  // Blog/journal articles
  let journals: Journal[] = []
  try {
    const res = await fetch(`${API_BASE_URL}/journals?limit=50`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      journals = data.data || []
    }
  } catch (error) {
    console.error('Failed to fetch journals for sitemap', error)
  }

  // Spare parts catalogue
  let parts: { slug: string }[] = []
  try {
    const res = await fetch(`${API_BASE_URL}/parts?limit=60`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      parts = (data.data || []).map((p: any) => ({ slug: p.slug }))
    }
  } catch (error) {
    console.error('Failed to fetch parts for sitemap', error)
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/inventory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/location`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/parts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/sell-your-car`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const brandUrls: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${baseUrl}/brands/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const vehicleUrls: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: `${baseUrl}/inventory/${vehicle.slug}`,
    lastModified: new Date((vehicle as any).updatedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const journalUrls: MetadataRoute.Sitemap = journals.map((j) => ({
    url: `${baseUrl}/blog/${j.slug}`,
    lastModified: new Date((j as any).updatedAt || (j as any).publishedAt || new Date()),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const partUrls: MetadataRoute.Sitemap = parts.map((p) => ({
    url: `${baseUrl}/parts/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...brandUrls, ...vehicleUrls, ...journalUrls, ...partUrls]
}
