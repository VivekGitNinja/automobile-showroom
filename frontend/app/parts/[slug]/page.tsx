import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_URL } from '../../../lib/site'
import { fetchPartBySlug } from '../../../lib/api'
import PartEnquiry from './PartEnquiry'
import { ArrowLeft, Package, Wrench, ShieldCheck, Globe } from 'lucide-react'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const part = await fetchPartBySlug(params.slug)
  if (!part) return { title: 'Part Not Found | Apex Luxury Automobiles' }
  return {
    title: `${part.name} (${part.sku}) | Apex Luxury Automobiles Dubai`,
    description: part.description?.substring(0, 155) || `Genuine ${part.name} — ${part.sku}. Available from our Dubai parts division with worldwide shipping.`,
    alternates: { canonical: `${SITE_URL}/parts/${part.slug}` },
    openGraph: {
      title: `${part.name} | Apex Luxury Automobiles`,
      description: part.description?.substring(0, 155) || `Genuine ${part.name} — ${part.sku}.`,
      images: part.imageUrl ? [{ url: part.imageUrl }] : undefined,
      type: 'website',
    },
  }
}

export default async function PartDetailPage({ params }: { params: { slug: string } }) {
  const part = await fetchPartBySlug(params.slug)
  if (!part) notFound()

  const price = Number(part.price)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.name,
    sku: part.sku,
    description: part.description || undefined,
    image: part.imageUrl ? `${SITE_URL}${part.imageUrl}` : undefined,
    brand: { '@type': 'Brand', name: part.brandName || 'Apex Luxury Automobiles' },
    offers: {
      '@type': 'Offer',
      priceCurrency: part.currency || 'AED',
      price: price.toString(),
      availability: part.stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: `${SITE_URL}/parts/${part.slug}`,
      itemCondition: part.condition === 'NEW' ? 'https://schema.org/NewCondition' : 'https://schema.org/RefurbishedCondition',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-36 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <Link href="/parts" className="inline-flex items-center gap-2 text-xs font-mono text-[#C9A227] uppercase tracking-widest mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parts Catalogue</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="rounded-[32px] bg-[#0A0A0A] border border-white/5 overflow-hidden aspect-[4/3]">
            {part.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A227]/40">
                <Wrench className="w-16 h-16 mb-4" strokeWidth={1} />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Imagery available on request</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
                SKU · {part.sku}
              </span>
              {part.category && (
                <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/5 text-[#C9A227]">
                  {part.category.name}
                </span>
              )}
              <span className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${
                part.condition === 'NEW'
                  ? 'text-[#3DD598] border-[#3DD598]/30 bg-[#3DD598]/5'
                  : 'text-[#C9A227] border-[#C9A227]/30 bg-[#C9A227]/5'
              }`}>
                {part.condition}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-white mb-3 leading-tight">
              {part.name}
            </h1>
            {part.brandName && (
              <p className="text-xs font-mono text-[#7A7A7A] uppercase tracking-widest mb-8">by {part.brandName}</p>
            )}

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl font-serif font-bold text-[#C9A227]">
                {part.currency} {price.toLocaleString()}
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${part.stockQty > 0 ? 'text-[#3DD598]' : 'text-[#7A7A7A]'}`}>
                {part.stockQty > 0 ? `In stock — ${part.stockQty} available` : 'Made to order'}
              </span>
            </div>

            {part.description && (
              <p className="text-sm text-[#A0A0A0] font-light leading-relaxed mb-10">{part.description}</p>
            )}

            {/* Assurance strip */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: ShieldCheck, label: 'Genuine & Vetted' },
                { icon: Wrench, label: 'Workshop Fitting' },
                { icon: Globe, label: 'Worldwide Shipping' },
              ].map((b) => (
                <div key={b.label} className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 text-center">
                  <b.icon className="w-5 h-5 text-[#C9A227] mx-auto mb-2" />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#7A7A7A]">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Compatible marques */}
            {Array.isArray(part.compatibleMakes) && part.compatibleMakes.length > 0 && (
              <div className="mb-10">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7A7A7A] block mb-3">
                  Compatible Marques
                </span>
                <div className="flex flex-wrap gap-2">
                  {part.compatibleMakes.map((m) => (
                    <span key={m} className="px-4 py-1.5 rounded-full bg-black border border-white/10 text-[10px] font-mono text-white/70 uppercase tracking-widest">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <PartEnquiry partName={part.name} partSku={part.sku} />
          </div>
        </div>

        {/* Related parts */}
        {part.related && part.related.length > 0 && (
          <section className="border-t border-white/5 pt-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-10">
              Frequently Bought <span className="italic font-light text-white/70">Together</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {part.related.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/parts/${rp.slug}`}
                  className="group p-6 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#C9A227]/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#C9A227]/10 transition-colors">
                    <Package className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-white group-hover:text-[#C9A227] transition-colors leading-snug mb-2">
                    {rp.name}
                  </h3>
                  <span className="text-[#C9A227] font-mono font-bold text-sm">
                    {rp.currency} {Number(rp.price).toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
