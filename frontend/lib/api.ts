import { Vehicle, VehicleImage, Journal, Part, PartCategory } from './types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

// ---------------------------------------------------------------------------
// Fallback gallery image — used when a listing has no photos yet.
// We deliberately never substitute another car's photo: a branded
// "imagery coming soon" frame is shown until staff upload the real asset.
// ---------------------------------------------------------------------------
function buildFallbackGallery(_make?: string, _model?: string): VehicleImage[] {
  return [
    { id: 'fb-1', urlOriginal: '/images/imagery-coming-soon.png', isPrimary: true, displayOrder: 0, mediaCategory: 'exterior', title: 'Imagery coming soon' },
  ]
}

/** Backward-compat: flat string array for pages that don't need categorization */
export function getFallbackImages(make?: string, model?: string): string[] {
  return buildFallbackGallery(make, model).map(img => img.urlOriginal)
}

// ---------------------------------------------------------------------------
// Vehicle List (used by inventory page, homepage)
// ---------------------------------------------------------------------------
export async function fetchVehiclesFromApi(params?: {
  make?: string
  brand?: string
  maxPrice?: number
  fuelType?: string
  transmission?: string
  search?: string
  year?: number
  minYear?: number
  maxYear?: number
  featured?: boolean
  sort?: string
  page?: number
  limit?: number
}, options?: RequestInit): Promise<{ data: Vehicle[], total: number, page: number, totalPages: number }> {
  const query = new URLSearchParams()
  if (params?.make && params.make !== 'All') query.append('make', params.make)
  if (params?.brand) query.append('brand', params.brand)
  if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString())
  if (params?.fuelType && params.fuelType !== 'All') query.append('fuelType', params.fuelType)
  if (params?.transmission && params.transmission !== 'All') query.append('transmission', params.transmission)
  if (params?.search) query.append('search', params.search)
  if (params?.year) query.append('year', params.year.toString())
  if (params?.minYear) query.append('minYear', params.minYear.toString())
  if (params?.maxYear) query.append('maxYear', params.maxYear.toString())
  if (params?.featured) query.append('featured', 'true')
  if (params?.sort) query.append('sort', params.sort)
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  const url = `${API_BASE_URL}/vehicles${query.toString() ? `?${query.toString()}` : ''}`
  const fetchOptions: RequestInit = options ? options : { cache: 'no-store' }
  const res = await fetch(url, fetchOptions)

  if (!res.ok) throw new Error(`API responded with status: ${res.status}`)

  const data = await res.json()
  if (data && Array.isArray(data.data)) {
    const mappedData = data.data.map((v: any) => {
      const rawImgs = Array.isArray(v.images) ? v.images : []
      let validImages = rawImgs
        .map((img: any) => (typeof img === 'string' ? img : img?.urlOriginal || img?.urlLg || img?.urlSm || img?.url))
        .filter((src: any) => typeof src === 'string' && src.trim().length > 0)
      
      if (v.image) {
        validImages = [v.image, ...validImages]
      }

      const finalImages = validImages.length > 0 ? Array.from(new Set(validImages)) : getFallbackImages(v.make, v.model)
      return { ...v, images: finalImages }
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

// ---------------------------------------------------------------------------
// Single Vehicle Detail — preserves full VehicleImage objects for gallery
// ---------------------------------------------------------------------------
export async function fetchVehicleBySlugFromApi(slug: string): Promise<Vehicle> {
  const url = `${API_BASE_URL}/vehicles/${slug}`
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) throw new Error(`Vehicle not found or API error: ${res.status}`)

  const data = await res.json()
  if (data.data) {
    const v = data.data
    const rawImgs: any[] = Array.isArray(v.images) ? v.images : []

    // Build galleryImages with full metadata
    let galleryImages: VehicleImage[] = rawImgs
      .filter((img: any) => typeof img === 'object' && img !== null && img.urlOriginal)
      .map((img: any) => ({
        id: img.id || `img-${img.displayOrder || 0}`,
        urlOriginal: img.urlOriginal,
        urlLg: img.urlLg,
        urlMd: img.urlMd,
        urlSm: img.urlSm,
        isPrimary: img.isPrimary || false,
        displayOrder: img.displayOrder || 0,
        mediaCategory: img.mediaCategory || img.mediaType || 'exterior',
        title: img.title || undefined,
        description: img.description || undefined,
      }))

    if (v.image && !galleryImages.find(g => g.urlOriginal === v.image)) {
       galleryImages.unshift({
         id: 'primary-img', urlOriginal: v.image, isPrimary: true, displayOrder: -1, mediaCategory: 'exterior'
       })
    }

    // If API returned no usable images at all, use fallbacks
    if (galleryImages.length === 0) {
      galleryImages = buildFallbackGallery(v.make, v.model)
    }

    // Sort by displayOrder
    galleryImages.sort((a, b) => a.displayOrder - b.displayOrder)

    // Flat string array for backward compat
    const flatImages = galleryImages.map(img => img.urlOriginal)

    return {
      ...v,
      images: flatImages,
      galleryImages,
      specs: v.specsJson || v.specs || {},
    }
  }
  throw new Error(`Vehicle ${slug} not found`)
}

// ---------------------------------------------------------------------------
// Journals
// ---------------------------------------------------------------------------
export async function fetchJournalsFromApi(): Promise<Journal[]> {
  const url = `${API_BASE_URL}/journals`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Journals not found or API error: ${res.status}`)
  const data = await res.json()
  return data.data || []
}

// ---------------------------------------------------------------------------
// Spare Parts Catalog
// ---------------------------------------------------------------------------
export async function fetchPartCategories(): Promise<PartCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/parts/categories`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export async function fetchPartsFromApi(params?: {
  category?: string
  search?: string
  make?: string
  condition?: string
  sort?: string
  page?: number
  limit?: number
}, options?: RequestInit): Promise<{ data: Part[]; total: number; page: number; totalPages: number }> {
  const query = new URLSearchParams()
  if (params?.category && params.category !== 'all') query.append('category', params.category)
  if (params?.search) query.append('search', params.search)
  if (params?.make && params.make !== 'all') query.append('make', params.make)
  if (params?.condition && params.condition !== 'all') query.append('condition', params.condition)
  if (params?.sort) query.append('sort', params.sort)
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  const url = `${API_BASE_URL}/parts${query.toString() ? `?${query.toString()}` : ''}`
  const fetchOptions: RequestInit = options ? options : { cache: 'no-store' }
  const res = await fetch(url, fetchOptions)
  if (!res.ok) throw new Error(`Parts API error: ${res.status}`)
  const data = await res.json()
  return {
    data: data.data || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  }
}

export async function fetchPartBySlug(slug: string): Promise<Part | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/parts/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.data || null
  } catch {
    return null
  }
}
