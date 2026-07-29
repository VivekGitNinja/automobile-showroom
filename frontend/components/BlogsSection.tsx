'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { Journal } from '../lib/types'

interface BlogsSectionProps {
  journals: Journal[]
}

export default function BlogsSection({ journals }: BlogsSectionProps) {
  // If no journals, use fallback
  const displayJournals = journals && journals.length > 0 ? journals : []

  return (
    <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8 gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-4 font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal & Intelligence</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-serif font-extrabold text-white tracking-tight">
            Latest Automotive <span className="italic font-light text-white/70">Stories</span>
          </h2>
        </div>
        <Link
          href="/blog"
          className="group flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#C9A227] hover:text-white transition-colors font-bold"
        >
          <span>Read The Journal</span>
          <div className="w-8 h-8 rounded-full border border-[#C9A227]/40 flex items-center justify-center group-hover:border-white transition-all">
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {displayJournals.map((b, i) => (
          <motion.article 
            key={b.id} 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="glass-card-elevated luxury-card-hover rounded-[32px] overflow-hidden group"
          >
            <Link href={`/blog/${b.id}`} className="h-full flex flex-col justify-between">
              <div className="relative h-64 w-full overflow-hidden bg-[#030303]">
                {/* Parallax Image Zoom */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
                
                <div className="absolute top-5 left-5 px-4 py-1.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#C9A227]/30 text-[#C9A227] text-[9px] font-mono uppercase tracking-[0.2em] font-bold shadow-lg">
                  {b.category}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10 bg-[#0A0A0A]">
                <div>
                  <div className="flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#C9A227]" /> {new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#C9A227]" /> {b.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white group-hover:gold-gradient-text transition-all duration-500 leading-snug mb-3">
                    {b.title}
                  </h3>
                  <p className="text-[13px] text-[#A0A0A0] font-light leading-relaxed line-clamp-3">
                    {b.snippet}
                  </p>
                </div>

                <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex items-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] font-bold">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
