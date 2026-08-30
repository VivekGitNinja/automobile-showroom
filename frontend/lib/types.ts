export interface VehicleImage {
  id: string
  urlOriginal: string
  urlLg?: string
  urlMd?: string
  urlSm?: string
  isPrimary: boolean
  displayOrder: number
  mediaCategory: string
  title?: string
  description?: string
}

export interface VehicleStory {
  id: string
  sectionType: string
  title: string
  content: string
  displayOrder: number
}

export interface Vehicle360Frame {
  id: string
  imageUrl: string
  displayOrder: number
}

export interface VehicleSound {
  id: string
  soundType: string
  audioUrl: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  trim?: string
  year: number
  slug: string
  price: number
  currency: string
  mileage?: string
  transmission?: string
  fuelType?: string
  bodyType?: string
  exteriorColor?: string
  interiorColor?: string
  engine?: string
  doors?: number
  description?: string
  isFeatured?: boolean
  image?: string
  images?: string[]
  galleryImages?: VehicleImage[]
  specsJson?: Record<string, string>
  specs?: Record<string, string>
  status?: string
  createdAt?: string
  updatedAt?: string

  frames360?: Vehicle360Frame[]
  sounds?: VehicleSound[]
  videoUrl?: string | null
  hotspots?: VehicleHotspot[]
  specConfigs?: VehicleSpecConfig[]
  brandId?: string
  brand?: { id: string; name: string; slug: string; logoUrl?: string; description?: string }

  // New Relations
  stories?: VehicleStory[]

  // Performance & Specs (deprecated in favor of specsJson, but keeping for compatibility)
  horsepower?: string
  torque?: string
  acceleration?: string
  topSpeed?: string
  drivetrain?: string
  weight?: string
  vin?: string
  stockNumber?: string

  // Trust Flags
  isLimited?: boolean
  isCollector?: boolean
  isCertified?: boolean
  hasServiceHistory?: boolean
  hasInspectionReport?: boolean
  hasWarranty?: boolean
  financeAvailable?: boolean
  exportAvailable?: boolean
  gccVerified?: boolean
  noAccidents?: boolean
  originalPaint?: boolean
}

export interface FaqItem {
  id?: string
  question: string
  answer: string
}

export interface FaqCategory {
  id?: string
  label: string
  faqs: FaqItem[]
}

export interface VehicleHotspot {
  id: string
  title: string
  subtitle: string
  details: string
  stat: string
  xPosition: number
  yPosition: number
  iconType: string
  partImageUrl?: string
}

export interface VehicleSpecConfig {
  id: string
  name: string
  hexColor: string
  imageUrl: string
}

export interface Journal {
  id: string
  slug: string
  title: string
  category: string
  snippet: string
  content?: string
  imageUrl: string
  readTime: string
  publishedAt: string
  status?: 'DRAFT' | 'PUBLISHED'
}

export type PartCondition = 'NEW' | 'REFURBISHED' | 'USED'
export type PartStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface PartCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  displayOrder?: number
  count?: number
}

export interface Part {
  id: string
  slug: string
  sku: string
  name: string
  description?: string | null
  categoryId?: string | null
  category?: { name: string; slug: string } | null
  brandName?: string | null
  compatibleMakes?: string[] | null
  condition: PartCondition
  price: string | number
  currency: string
  stockQty: number
  imageUrl?: string | null
  status?: PartStatus
  displayOrder?: number
  related?: Part[]
}

export interface VehicleVideo {
  videoUrl?: string | null
}
