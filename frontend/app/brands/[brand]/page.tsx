import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { API_BASE_URL } from '../../../lib/api'
import { Vehicle } from '../../../lib/types'
import VehicleCard from '../../../components/VehicleCard'

interface BrandPageProps {
  params: {
    brand: string
  }
}

function formatBrandName(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getBrandDescription(brandName: string): string {
  const descriptions: Record<string, string> = {
    'Ferrari': 'Experience the pinnacle of Italian motorsport heritage. Ferrari represents the perfect symphony of passionate design, Formula 1 technology, and raw, uncompromising performance.',
    'Lamborghini': 'Bold, unmistakable, and viscerally thrilling. Lamborghini creates automotive masterpieces that defy convention and redefine the boundaries of super sports cars.',
    'Rolls-Royce': 'The ultimate expression of automotive luxury. Rolls-Royce motor cars are handcrafted masterpieces designed for those who demand nothing less than absolute perfection.',
    'Bugatti': 'Unrivaled performance meets peerless luxury. Bugatti stands alone at the apex of the automotive world, crafting hypercars of unimaginable power and exquisite beauty.',
    'Porsche': 'Precision engineering meets everyday usability. Porsche delivers an unparalleled driving experience rooted in a rich history of motorsport dominance.',
    'Mercedes': 'The best or nothing. Mercedes-Benz represents a legacy of innovation, pioneering luxury, and sophisticated engineering that leads the automotive world.',
    'Bentley': 'Exhilarating performance and exquisite craftsmanship. Bentley creates extraordinary grand tourers that blend pulse-racing power with serene luxury.',
    'Mclaren': 'Born on the track, unleashed on the road. McLaren supercars are aerodynamically obsessed, precision-engineered machines that deliver pure driver engagement.',
    'Aston Martin': 'Power, beauty, and soul. Aston Martin crafts breathtakingly elegant grand tourers that define British luxury and high-performance motoring.',
    'Pagani': 'Automotive art in its purest form. Horacio Pagani\'s creations are bespoke masterpieces where science and art intersect to create hypercars of astonishing detail.',
  }

  return descriptions[brandName] || `Discover our exclusive collection of ${brandName} vehicles. Hand-selected for the most discerning automotive enthusiasts, representing the pinnacle of engineering and luxury.`
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brandName = formatBrandName(params.brand)
  return {
    title: `${brandName} - Luxury Vehicles | Apex Luxury Automobiles`,
    description: `Explore our exclusive inventory of ${brandName} luxury vehicles in Dubai.`,
  }
}

async function getBrandVehicles(brand: string): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vehicles?make=${brand}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch vehicles:', error)
    return []
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brandName = formatBrandName(params.brand)
  const description = getBrandDescription(brandName)
  const vehicles = await getBrandVehicles(params.brand)

  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back Link */}
      <Link 
        href="/inventory"
        className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] hover:text-[#C9A227] transition-colors mb-12"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Inventory
      </Link>

      {/* Hero Section */}
      <div className="mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-4 font-bold">
          Brand Collection
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6">
          {brandName}
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl font-light mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 rounded-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] text-xs font-mono uppercase tracking-widest text-white">
            {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Available
          </span>
        </div>
      </div>

      {/* Vehicle Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)]">
          <h3 className="text-xl font-serif font-bold text-white mb-4">No Vehicles Currently Available</h3>
          <p className="text-xs text-gray-400 font-light max-w-md mx-auto mb-8">
            We currently do not have any {brandName} vehicles in our showroom. Our inventory is constantly updating, please check back soon or contact our concierge to source one for you.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-[#C9A227] text-[#050505] font-bold text-[10px] font-mono uppercase tracking-widest hover:bg-[#D4AF37] transition-colors"
            >
              Contact Concierge
            </Link>
            <Link
              href="/brands"
              className="px-6 py-3 rounded-full bg-transparent border border-[#C9A227] text-[#C9A227] font-bold text-[10px] font-mono uppercase tracking-widest hover:bg-[#C9A227]/10 transition-colors"
            >
              View All Brands
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
