'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Vehicle } from '../../../../lib/types'

interface RelatedVehiclesProps {
  vehicles: Vehicle[]
  currentSlug: string
}

export default function RelatedVehicles({ vehicles, currentSlug }: RelatedVehiclesProps) {
  const related = vehicles.filter(v => v.slug !== currentSlug).slice(0, 3)

  if (related.length === 0) return null

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
            You May Also Consider
          </span>
          <h2 className="text-3xl font-bold font-serif text-white">Curated Alternatives</h2>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] hover:text-white transition-colors border-b border-[#C9A227] hover:border-white pb-1"
        >
          Explore All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {related.map((v, i) => {
          const imgSrc = Array.isArray(v.images) && v.images.length > 0
            ? (typeof v.images[0] === 'string' ? v.images[0] : '/images/hero/hero-car-1.jpg')
            : '/images/hero/hero-car-1.jpg'

          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/inventory/${v.slug}`} className="block group">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-[#0A0A0A] border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-serif text-lg text-white group-hover:text-[#C9A227] transition-colors">
                  {v.year} {v.make} {v.model}
                </h3>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#A0A0A0] mt-1">
                  {v.currency || 'AED'} {v.price?.toLocaleString() || 'Price on Request'}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
