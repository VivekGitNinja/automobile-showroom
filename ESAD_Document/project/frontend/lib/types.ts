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
  description?: string
  isFeatured?: boolean
  image?: string
  images?: string[]
  specs?: Record<string, string>
  status?: string
  createdAt?: string
  updatedAt?: string
  hotspots?: VehicleHotspot[]
  specConfigs?: VehicleSpecConfig[]
  brandId?: string
  brand?: any
  
  // Enterprise God Mode Specs
  horsepower?: string
  torque?: string
  acceleration?: string // 0-100
  topSpeed?: string
  drivetrain?: string
  vin?: string
  stockNumber?: string
  isLimited?: boolean
  isCollector?: boolean
  isCertified?: boolean
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
  title: string
  category: string
  snippet: string
  content?: string
  imageUrl: string
  readTime: string
  publishedAt: string
}
