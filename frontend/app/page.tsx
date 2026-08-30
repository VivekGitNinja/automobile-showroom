'use client'

import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import BrandMarquee from '../components/BrandMarquee'

import VehicleCard from '../components/VehicleCard'
import Testimonials from '../components/Testimonials'
import QuickSellBanner from '../components/QuickSellBanner'
import BlogsSection from '../components/BlogsSection'
import QualityAssuranceSection from '../components/QualityAssuranceSection'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Award, Globe, Box, Loader2, PlayCircle, MapPin, Clock } from 'lucide-react'
import { fetchVehiclesFromApi, fetchJournalsFromApi } from '../lib/api'
import { Vehicle, Journal } from '../lib/types'
import { motion } from 'framer-motion'
import { useToast } from '../lib/useToast'



export default function HomePage() {
  const { toast } = useToast()
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [latestArrivals, setLatestArrivals] = useState<Vehicle[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [totalInventory, setTotalInventory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchVehiclesFromApi()
      .then((response) => {
        if (isMounted) {
          const data = response.data || []
          const featured = data.filter((v: Vehicle) => v.isFeatured).slice(0, 3)
          setFeaturedVehicles(featured.length > 0 ? featured : data.slice(0, 3))
          setLatestArrivals(data.slice(0, 4))
          setTotalInventory(response.total)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) {
          setFeaturedVehicles([])
          setLatestArrivals([])
        }
      })

    fetchJournalsFromApi()
      .then((data) => {
        if (isMounted) {
          setJournals(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  const flagship = featuredVehicles[0]

  return (
    <div className="bg-[#030303] min-h-screen">
      {/* 1. Cinematic Luxury Hero */}
      <Hero flagship={featuredVehicles[0]} loading={loading} />

      {/* 2. Brand Showcase Ticker */}
      <BrandMarquee />

      {/* 3. Latest Arrivals & Trending */}
      <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span className="animate-pulse">Just Arrived</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-serif font-extrabold text-white tracking-tight">
              Latest <span className="italic font-light text-white/70">Acquisitions</span>
            </h2>
          </div>
          <Link
            href="/inventory?sort=newest"
            className="group flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white hover:text-[#C9A227] transition-colors"
          >
            <span>View All Arrivals</span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C9A227] transition-all">
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
             <Loader2 className="w-10 h-10 text-[#C9A227] animate-spin" />
          </div>
        ) : latestArrivals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Sparkles className="w-12 h-12 text-[#C9A227]/30 mb-4" />
            <h3 className="text-2xl font-serif text-white mb-2">New Collection Unveiling Soon</h3>
            <p className="text-[#A0A0A0] text-sm">Our latest acquisitions are currently undergoing technical inspection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {latestArrivals.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Luxury Experience & VIP Membership */}
      <section className="relative py-40 overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 z-0">
           {/* Cinematic Video Background */}
           <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="object-cover w-full h-full opacity-50 brightness-90"
              poster="/images/hero/hero-car-1.jpg"
            >
             <source src="/videos/hero-cinematic.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent" />
           
           {/* Particle Gold Dust Overlay */}
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,162,39,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>
        </div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-4">
                <Award className="w-4 h-4" />
                <span>Apex Black Label</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-serif font-extrabold text-white mb-6 leading-[1.1]">
                The Ultimate <br/> <span className="italic font-light gold-gradient-text">VIP Experience</span>
              </h2>
              <p className="text-[#A0A0A0] text-lg font-light leading-relaxed mb-10 max-w-xl">
                Gain access to off-market allocations, closed-room hypercar previews, and dedicated white-glove concierge services. Membership is strictly by invitation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => toast('Opening Invitation Request Form...', 'info')}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#9E7D1A] text-black font-mono font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_30px_rgba(201,162,39,0.5)]"
                >
                  Request Invitation
                </button>
                <button 
                  onClick={() => toast('Playing VIP Experience Film...', 'info')}
                  className="group h-14 px-8 rounded-full glass-panel border border-[#C9A227]/30 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:border-[#C9A227] transition-all duration-300"
                >
                  <PlayCircle className="w-4 h-4 group-hover:text-[#C9A227] transition-colors" />
                  <span>Watch the Film</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 6. Quick Sell Supercar Banner */}
      <QuickSellBanner />

      {/* 7. 150-Point Technical Quality Inspection */}
      <QualityAssuranceSection />

      {/* 8. Featured Flagships (Cinematic Grid) */}
      <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-3 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Showroom</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-serif font-extrabold text-white tracking-tight">
              Featured <span className="italic font-light text-white/70">Flagships</span>
            </h2>
          </div>
          <Link
            href="/inventory"
            className="group flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#C9A227] hover:text-white transition-colors font-bold"
          >
            <span>{totalInventory ? `Explore All ${totalInventory} Vehicles` : 'Explore Full Inventory'}</span>
            <div className="w-8 h-8 rounded-full border border-[#C9A227]/40 flex items-center justify-center group-hover:border-white transition-all">
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
             <Loader2 className="w-10 h-10 text-[#C9A227] animate-spin" />
          </div>
        ) : featuredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Sparkles className="w-12 h-12 text-[#C9A227]/30 mb-4" />
            <h3 className="text-2xl font-serif text-white mb-2">Curating Excellence</h3>
            <p className="text-[#A0A0A0] text-sm">We are preparing an exclusive showcase of our most remarkable flagships.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredVehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 9. Global Logistics (Animated Redesign) */}
      <section className="py-32 glass-panel border-y border-white/5 relative overflow-hidden mt-20">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          {/* Animated SVG Map Background representation */}
          <svg viewBox="0 0 1000 500" className="w-full h-full">
             <path d="M100 200 Q 300 50 500 250 T 900 150" fill="none" stroke="#C9A227" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
          </svg>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 mx-auto bg-[#C9A227]/10 rounded-full flex items-center justify-center mb-6 border border-[#C9A227]/30 shadow-[0_0_30px_rgba(201,162,39,0.2)]">
               <MapPin className="w-8 h-8 text-[#C9A227]" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white mb-6">
              Global <span className="italic font-light text-outline-luxury">Logistics</span>
            </h2>
            <p className="text-[#A0A0A0] text-sm max-w-2xl mx-auto leading-relaxed mb-12">
              Our dedicated logistics division ensures your acquisition reaches you in pristine condition, anywhere in the world, via fully enclosed and insured air or sea freight.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227]">
              {['Dubai', 'London', 'Monaco', 'Miami', 'Tokyo'].map((city, idx) => (
                <div key={city} className="flex items-center gap-2 group cursor-default">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                  <span className="group-hover:text-white transition-colors">{city}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. Verified Client Reviews & Delivery Testimonials */}
      <Testimonials />

      {/* 11. Latest Automotive Stories & Blogs */}
      <BlogsSection journals={journals} />

      {/* 12. Showroom Heritage & Trust Badges */}
      <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {[
            { icon: ShieldCheck, title: "100% Provenance", desc: "Every single automobile in our Dubai showroom undergoes a rigorous 150-point technical inspection with verified provenance and service history." },
            { icon: Globe, title: "Air Freight Logistics", desc: "Enclosed air-freight and insured maritime logistics to major luxury hubs across Europe, GCC, Asia, and the Americas within 48 hours." },
            { icon: Award, title: "Crypto Settlements", desc: "Seamless transaction settlement via multi-currency international wire, certified bank drafts, or approved crypto payments (USDT/USDC)." }
          ].map((item, idx) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="p-10 rounded-3xl glass-card-elevated luxury-card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/40 flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-[#C9A227] rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <item.icon className="w-6 h-6 text-[#C9A227] relative z-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-4">{item.title}</h3>
              <p className="text-sm text-[#7A7A7A] leading-relaxed font-light">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
