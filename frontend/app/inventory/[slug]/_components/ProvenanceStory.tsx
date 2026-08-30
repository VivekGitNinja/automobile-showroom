'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Globe, CheckCircle, MessageCircle } from 'lucide-react'

import { VehicleStory } from '../../../../lib/types'

interface ProvenanceStoryProps {
  description?: string
  make: string
  model: string
  stories?: VehicleStory[]
}

export default function ProvenanceStory({ description, make, model, stories }: ProvenanceStoryProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDescription = description && description.trim().length > 0
  const isLong = hasDescription && description.length > 300
  const hasStories = stories && stories.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2">
          Provenance &amp; Heritage
        </span>
        <h2 className="text-3xl font-bold font-serif text-white">The Story</h2>
      </div>

      {/* Content */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-8">
        {hasStories ? (
          stories!.sort((a, b) => a.displayOrder - b.displayOrder).map((story) => (
            <div key={story.id}>
              {story.title && (
                <h3 className="text-xl font-bold font-serif text-white mb-3">{story.title}</h3>
              )}
              <div 
                className="text-lg leading-relaxed text-[#A0A0A0] font-light font-serif prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            </div>
          ))
        ) : hasDescription ? (
          <div>
            <p className="text-lg leading-relaxed text-[#A0A0A0] font-light font-serif">
              {isLong && !expanded ? `${description.slice(0, 300)}...` : description}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] hover:text-white transition-colors border-b border-[#C9A227] hover:border-white pb-0.5"
              >
                {expanded ? 'Read Less' : 'Read Full Story'}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-lg text-[#A0A0A0] font-serif font-light mb-6">
              Contact our concierge team for the complete provenance of this{' '}
              <span className="text-white font-medium">{make} {model}</span>.
            </p>
            <a
              href={`https://wa.me/971508919441?text=I'd like to know the provenance of the ${make} ${model}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-emerald-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Concierge
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}
