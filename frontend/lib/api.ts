import { Vehicle, Journal } from './types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export function getFallbackImages(make?: string, model?: string): string[] {
  const m = (make || '').toLowerCase()
  if (m.includes('bugatti')) {
    return [
      '/images/dynamic/bugatti_exterior.jpg',
      '/images/hero/hero-car-1.jpg',
      '/images/dynamic/spec_blue.jpg',
      '/images/dynamic/hotspot_aero.jpg'
    ]
  }
  if (m.includes('ferrari')) {
    return [
      '/images/hero/hero-car-2.jpg',
      '/images/dynamic/spec_carbon.jpg',
      '/images/dynamic/hotspot_engine.jpg',
      '/images/hero/hero-car-4.jpg'
    ]
  }
  if (m.includes('lamborghini')) {
    return [
      '/images/hero/hero-car-3.jpg',
      '/images/dynamic/spec_silver.jpg',
      '/images/hero/hero-car-5.jpg',
      '/images/dynamic/hotspot_brakes.jpg'
    ]
  }
  if (m.includes('rolls')) {
    return [
      '/images/hero/hero-car-6.jpg',
      '/images/hero/hero-car-1.jpg',
      '/images/dynamic/bugatti_exterior.jpg'
    ]
  }
  if (m.includes('porsche')) {
    return [
      '/images/hero/hero-car-4.jpg',
      '/images/hero/hero-car-5.jpg',
      '/images/dynamic/hotspot_chassis.jpg'
    ]
  }
  return [
    '/images/hero/hero-car-1.jpg',
    '/images/hero/hero-car-2.jpg',
    '/images/hero/hero-car-3.jpg',
    '/images/hero/hero-car-4.jpg'
  ]
}

export async function fetchVehiclesFromApi(params?: {
  make?: string
  maxPrice?: number
  fuelType?: string
  transmission?: string
  search?: string
  featured?: boolean
  sort?: string
  page?: number
  limit?: number
}, options?: RequestInit): Promise<{ data: Vehicle[], total: number, page: number, totalPages: number }> {
  const query = new URLSearchParams()
  if (params?.make && params.make !== 'All') query.append('make', params.make)
  if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString())
  if (params?.fuelType && params.fuelType !== 'All') query.append('fuelType', params.fuelType)
  if (params?.transmission && params.transmission !== 'All') query.append('transmission', params.transmission)
  if (params?.search) query.append('search', params.search)
  if (params?.featured) query.append('featured', 'true')
  if (params?.sort) query.append('sort', params.sort)
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  const url = `${API_BASE_URL}/vehicles${query.toString() ? `?${query.toString()}` : ''}`
  
  const fetchOptions: RequestInit = options ? options : { cache: 'no-store' }
  const res = await fetch(url, fetchOptions)

  if (!res.ok) {
    throw new Error(`API responded with status: ${res.status}`)
  }

  const data = await res.json()
  if (data && Array.isArray(data.data)) {
    const mappedData = data.data.map((v: any) => {
      const rawImgs = Array.isArray(v.images) ? v.images : []
      const validImages = rawImgs
        .map((img: any) => (typeof img === 'string' ? img : img?.urlOriginal || img?.urlLg || img?.urlSm || img?.url))
        .filter((src: any) => typeof src === 'string' && src.trim().length > 0)
      
      const finalImages = validImages.length > 0 ? validImages : getFallbackImages(v.make, v.model)

      return {
        ...v,
        images: finalImages
      }
    })
    return {
      data: mappedData,
      total: data.pagination?.total || mappedData.length,
      page: data.pagination?.page || 1,
      totalPages: data.pagination?.totalPages || 1
    }
  }
  
  return { data: [], total: 0, page: 1, totalPages: 1 }
}

export async function fetchVehicleBySlugFromApi(slug: string): Promise<Vehicle> {
  const url = `${API_BASE_URL}/vehicles/${slug}`
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Vehicle not found or API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.data) {
    const v = data.data
    const rawImgs = Array.isArray(v.images) ? v.images : []
    const validImages = rawImgs
      .map((img: any) => (typeof img === 'string' ? img : img?.urlOriginal || img?.urlLg || img?.urlSm || img?.url))
      .filter((src: any) => typeof src === 'string' && src.trim().length > 0)

    const finalImages = validImages.length > 0 ? validImages : getFallbackImages(v.make, v.model)

    return {
      ...v,
      images: finalImages
    }
  }
  
  throw new Error(`Vehicle ${slug} not found`)
}

export async function fetchJournalsFromApi(): Promise<Journal[]> {
  const url = `${API_BASE_URL}/journals`
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Journals not found or API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.data) {
    return data.data
  }
  
  return []
}
