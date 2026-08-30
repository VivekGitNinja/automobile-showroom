'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { VehicleImage } from '../../../../lib/types'

interface MediaGalleryProps {
  images: VehicleImage[]
  onImageClick: (index: number) => void
}


export default function MediaGallery({ images, onImageClick }: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>('All')

  const categories = useMemo(() => {
    const tabs = new Set<string>()
    tabs.add('All')
    images.forEach(img => {
      const label = img.mediaCategory
      if (label) tabs.add(label)
    })
    return Array.from(tabs)
  }, [images])

  const filteredImages = useMemo(() => {
    if (activeTab === 'All') return images
    return images.filter(img => img.mediaCategory === activeTab)
  }, [images, activeTab])

  if (images.length === 0) return null

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
          Gallery
        </span>
        <h2 className="text-3xl font-bold font-serif text-white">Media</h2>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {categories.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-black font-bold'
                : 'bg-[#0A0A0A] text-[#7A7A7A] border border-white/10 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((img, idx) => {
          const originalIndex = images.findIndex(i => i.id === img.id)
          return (
            <motion.div
              key={`${img.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.3) }}
              className="group relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/5 cursor-pointer"
              onClick={() => onImageClick(originalIndex >= 0 ? originalIndex : idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.urlOriginal}
                alt={img.title || `Vehicle ${img.mediaCategory || 'image'}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                <span className="text-sm font-medium text-white tracking-widest uppercase">
                  View
                </span>
              </div>

              {/* Title overlay */}
              {img.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-medium text-white">{img.title}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
