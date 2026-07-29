'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShieldCheck, Award, Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutClient() {
  const statsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* 1. Hero Banner */}
      <section className="relative h-[70vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: 'url(/images/hero/hero-car-4.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20"
        >
          <span className="text-[#C9A227] font-mono uppercase tracking-[0.3em] text-xs font-bold block mb-4">
            Our Legacy
          </span>
          <h1 className="text-5xl sm:text-7xl font-serif font-extrabold text-white mb-6 leading-tight">
            The <span className="italic font-light gold-gradient-text">Apex</span> Standard
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Dubai's premier ultra-luxury automobile showroom, curating the world's most exceptional automotive masterpieces for discerning collectors.
          </p>
        </motion.div>
      </section>

      {/* 2. Our Heritage */}
      <section className="py-32 px-4 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-6">
              A Heritage of <span className="text-[#C9A227] italic">Excellence</span>
            </h2>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed">
              <p>
                Founded on an unyielding passion for automotive excellence, Apex Luxury Automobiles has established itself as the definitive destination for rare, exotic, and ultra-luxury vehicles in the Middle East.
              </p>
              <p>
                For over 15 years, we have transcended the traditional dealership model to become a trusted advisory and acquisition partner for global collectors. Our expertise lies not just in sourcing vehicles, but in verifying provenance, understanding market trajectories, and preserving automotive history.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-2xl overflow-hidden glass-panel border border-[rgba(255,255,255,0.05)] shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A227]/20 to-transparent opacity-50 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[#0A0A0A]/50 backdrop-blur-[2px]" />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <p className="text-2xl font-serif italic text-white/90">
                "We don't just sell cars; we curate automotive legacies for the world's most discerning individuals."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. By The Numbers */}
      <section className="py-20 border-y border-white/5 bg-[#0A0A0A]/30" ref={statsRef}>
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: "500+", label: "Vehicles Delivered" },
              { value: "15+", label: "Years Experience" },
              { value: "50+", label: "Global Destinations" },
              { value: "100%", label: "Verified Provenance" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-4xl sm:text-5xl font-serif font-bold text-[#C9A227]">
                  {stat.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Our Values */}
      <section className="py-32 px-4 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">Our Core Values</h2>
          <div className="w-12 h-0.5 bg-[#C9A227] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Authenticity", desc: "Every vehicle undergoes an exhaustive 150-point inspection and provenance verification to ensure absolute authenticity and peace of mind." },
            { icon: Award, title: "Excellence", desc: "From the showroom ambiance to our white-glove delivery service, we demand perfection in every interaction and every detail." },
            { icon: Lock, title: "Discretion", desc: "We operate with the highest level of confidentiality, protecting the privacy and security of our high-net-worth clientele at all times." }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl luxury-card-hover group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#C9A227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 mb-6 relative z-10">
                <value.icon className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3 relative z-10">{value.title}</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed relative z-10">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. The Team & 6. Certifications */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-serif font-bold text-white mb-6">The Apex Collective</h3>
            <p className="text-gray-400 font-light leading-relaxed mb-6">
              Our team consists of former luxury brand executives, certified master technicians, and global logistics experts. Together, we provide an unparalleled depth of knowledge spanning modern hypercars to classic investment-grade automobiles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-serif font-bold text-white mb-6">Global Partners</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                "GCC Certified Operations",
                "Premium Insurance Partners",
                "Global Logistics & Freight",
                "Authorised Service Centers"
              ].map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                  <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">{cert}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-32 px-4 max-w-[1400px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="p-16 rounded-3xl glass-panel border border-[#C9A227]/20 shadow-[0_0_50px_rgba(201,162,39,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/images/hero/hero-car-1.jpg')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-serif font-bold text-white">Experience The Standard</h2>
            <p className="text-gray-400 font-light">
              We invite you to visit our Dubai flagship showroom for a private consultation and viewing of our current portfolio.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C9A227] text-[#050505] font-bold text-xs uppercase tracking-widest font-mono hover:bg-[#D4AF37] transition-all shadow-gold-glow"
            >
              Visit Our Showroom
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
