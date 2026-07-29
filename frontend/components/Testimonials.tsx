'use client'

import React, { useState, useEffect } from 'react'
import { Star, Quote, Award, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: 'Sheikh Hamdan Al Maktoum',
      title: 'Collector & VIP Client',
      car: 'Bugatti Chiron Super Sport',
      rating: 5,
      comment: 'The team at Apex delivered my Chiron Super Sport with zero hassle. Seamless escrow payment and flawless 150-point inspection certification.',
      avatar: '/images/dynamic/bugatti_exterior.jpg',
    },
    {
      id: 2,
      name: 'Vikramaditya Singhania',
      title: 'Industrialist & Supercar Enthusiast',
      car: 'Rolls-Royce Phantom VIII',
      rating: 5,
      comment: 'Better experience than traditional dealerships! Enclosed air freight arrived in Mumbai within 48 hours in immaculate condition.',
      avatar: '/images/dynamic/bugatti_exterior.jpg',
    },
    {
      id: 3,
      name: 'Elena Rostova',
      title: 'Motorsport Driver',
      car: 'Ferrari SF90 Assetto Fiorano',
      rating: 5,
      comment: 'The 3D virtual tour and transparent pricing made ordering online effortless. Outstanding customer concierge support from day one.',
      avatar: '/images/dynamic/bugatti_exterior.jpg',
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current === reviews.length - 1 ? 0 : current + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [reviews.length])

  const nextTestimonial = () => {
    setActiveIndex((current) => (current === reviews.length - 1 ? 0 : current + 1))
  }

  const prevTestimonial = () => {
    setActiveIndex((current) => (current === 0 ? reviews.length - 1 : current - 1))
  }

  return (
    <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="text-center mb-20 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-mono uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(201,162,39,0.15)] font-bold">
            <Award className="w-4 h-4" />
            <span>Verified Client Reviews</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-serif font-extrabold text-white mb-6">
            Trusted By <span className="italic font-light gold-gradient-text">Global Collectors</span>
          </h2>
          <p className="text-sm text-[#A0A0A0] max-w-2xl mx-auto font-light leading-relaxed">
            Hear from hypercar collectors, celebrities, and business leaders who acquired their dream automobiles through our private global network.
          </p>
        </motion.div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        
        {/* Carousel Container */}
        <div className="relative h-[400px] sm:h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <div className="h-full glass-card-elevated p-8 sm:p-12 rounded-[40px] flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 relative overflow-hidden group">
                
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C9A227]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#C9A227]/20 transition-colors duration-700" />
                
                <Quote className="w-24 h-24 text-[#C9A227]/10 absolute -top-4 -left-4 sm:top-8 sm:left-8 -rotate-12 pointer-events-none" />

                {/* Avatar Section */}
                <div className="shrink-0 relative z-10">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-[#D4AF37] via-[#C9A227] to-[#9E7D1A] shadow-[0_0_30px_rgba(201,162,39,0.3)] relative">
                    <div className="w-full h-full rounded-full border-4 border-[#0A0A0A] bg-[#111111] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-serif text-[#C9A227]">
                        {reviews[activeIndex].name.split(' ').map(n => n[0]).join('').substring(0,2)}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C9A227] border-2 border-[#0A0A0A] flex items-center justify-center shadow-lg" title="Verified Buyer">
                      <ShieldCheck className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center sm:text-left relative z-10 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-center sm:justify-start gap-1 mb-6">
                    {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#C9A227] text-[#C9A227] drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]" />
                    ))}
                  </div>

                  <p className="text-lg sm:text-2xl text-white leading-relaxed font-light italic mb-8">
                    "{reviews[activeIndex].comment}"
                  </p>

                  <div>
                    <h4 className="font-serif font-bold text-white text-xl mb-1">{reviews[activeIndex].name}</h4>
                    <p className="text-xs text-[#C9A227] font-mono tracking-widest uppercase mb-1">{reviews[activeIndex].car}</p>
                    <span className="text-[10px] text-[#7A7A7A] font-mono uppercase tracking-[0.2em]">{reviews[activeIndex].title}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button 
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full glass-panel border border-white/10 flex items-center justify-center text-white hover:text-black hover:bg-[#C9A227] hover:border-[#C9A227] transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-3">
            {reviews.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-500 rounded-full ${
                  activeIndex === idx 
                    ? 'w-8 h-2 bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]' 
                    : 'w-2 h-2 bg-white/20 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={nextTestimonial}
            className="w-12 h-12 rounded-full glass-panel border border-white/10 flex items-center justify-center text-white hover:text-black hover:bg-[#C9A227] hover:border-[#C9A227] transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  )
}
