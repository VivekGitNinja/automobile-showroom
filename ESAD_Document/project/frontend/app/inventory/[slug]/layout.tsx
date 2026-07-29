import { Metadata, ResolvingMetadata } from 'next'
import { fetchVehicleBySlugFromApi } from '../../../lib/api'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug

  try {
    const vehicle = await fetchVehicleBySlugFromApi(slug)
    if (vehicle) {
      return {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model} | Apex Luxury Automobiles Dubai`,
        description: vehicle.description ? vehicle.description.substring(0, 155) + '...' : `Explore the ${vehicle.make} ${vehicle.model} at Apex Luxury Automobiles Dubai.`,
        openGraph: {
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          images: vehicle.image ? [vehicle.image] : []
        }
      }
    }
  } catch (e) {
    // Return fallback
  }

  return {
    title: 'Vehicle Details | Apex Luxury Automobiles Dubai',
  }
}



export default async function VehicleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const vehicle = await fetchVehicleBySlugFromApi(params.slug).catch(() => null);

  return (
    <>
      {vehicle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              "description": vehicle.description || `Explore the ${vehicle.make} ${vehicle.model}`,
              "image": vehicle.image,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "USD",
                "price": vehicle.price || "Contact for price",
                "itemCondition": "https://schema.org/UsedCondition",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
      )}
      {children}
    </>
  )
}
