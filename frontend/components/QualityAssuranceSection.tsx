'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, Cpu, Wrench, FileCheck, Award } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function QualityAssuranceSection() {
  const points = [
    { title: 'Drivetrain & Engine Compression', desc: 'Dyno test, cylinder compression balance, quad-turbo boost pressure checks.' },
    { title: 'Transmission & Differential Fluid', desc: 'Dual-clutch actuator timing, launch control stress testing, fluid analysis.' },
    { title: 'Carbon Ceramic Brake Systems', desc: 'Rotor thickness scan, titanium caliper pressure, high-speed thermal fade test.' },
    { title: 'Chassis & Carbon Monocoque Integrity', desc: 'Ultrasonic structural integrity scan for carbon-fiber weave perfection.' },
    { title: 'Bespoke Interior & Electronics', desc: 'Starlight headliner LED audit, infotainment CAN-bus diagnostic check.' },
    { title: 'Full UAE RTA Legal & Title Provenance', desc: '100% clear title verification, accident-free guarantee, customs duty paid.' },
  ]

  const counterRef = useRef(null)
  const isInView = useInView(counterRef, { once: true, margin: "-100px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = 150;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView])

  return (
    <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-card-elevated p-8 sm:p-16 rounded-[40px] relative overflow-hidden">
        
        {/* Subtle Glow & Noise */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 noise-overlay opacity-30"></div>

        <div className="text-center mb-16 relative z-10 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-mono uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(201,162,39,0.15)] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Apex Certified Quality Standards</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-serif font-extrabold text-white mb-6 leading-tight flex items-center justify-center gap-4 flex-wrap">
              <span ref={counterRef} className="gold-gradient-text tabular-nums">{count}</span> 
              <span className="italic font-light text-outline-luxury">-Point</span> 
              Technical Inspection
            </h2>
            <p className="text-base text-[#A0A0A0] max-w-2xl mx-auto font-light leading-relaxed">
              Every vehicle in our Dubai showroom must pass a rigorous engineering protocol designed by former factory racing mechanics before being offered for sale.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {points.map((p, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 space-y-4 hover:border-[#C9A227]/50 transition-all duration-300 group shadow-lg hover:shadow-[0_0_30px_rgba(201,162,39,0.15)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#C9A227]/10 flex items-center justify-center shrink-0 mt-1 group-hover:bg-[#C9A227] transition-colors duration-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-lg mb-2 group-hover:text-[#C9A227] transition-colors duration-300">{p.title}</h4>
                  <p className="text-[13px] text-[#7A7A7A] font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center relative z-10"
        >
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#C9A227] bg-[#C9A227]/10 px-8 py-4 rounded-full border border-[#C9A227]/40 shadow-[0_0_20px_rgba(201,162,39,0.2)]">
            <Award className="w-5 h-5" />
            <span className="font-bold">Includes 12-Month Apex Comprehensive Warranty & Roadside Concierge</span>
          </span>
        </motion.div>

      </div>
    </section>
  )
}
