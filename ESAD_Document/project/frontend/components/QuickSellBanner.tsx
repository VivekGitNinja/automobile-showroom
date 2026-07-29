'use client'

import React, { useState } from 'react'
import { ArrowRight, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { API_BASE_URL } from '../lib/api'

export default function QuickSellBanner() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('2024')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!make || !model || !fullName || !email) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/leads/sell-car`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          carMake: make,
          carModel: model,
          carYear: parseInt(year, 10)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden glass-panel p-[1px] shadow-[0_0_50px_rgba(201,162,39,0.15)] group">
        
        {/* Animated Gold Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent bg-[length:200%_100%] animate-gradient-x opacity-50 group-hover:opacity-100 transition-opacity duration-1000 z-0"></div>

        <div className="relative z-10 rounded-[23px] bg-[#0A0A0A]/95 p-8 sm:p-12 h-full w-full overflow-hidden">
          
          {/* Ambient Glow Inside */}
          <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-[140px] pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
          <div className="absolute -left-20 -top-20 w-[300px] h-[300px] bg-[#C9A227]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="xl:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-mono uppercase tracking-[0.3em] font-bold shadow-[0_0_20px_rgba(201,162,39,0.2)]">
                <Zap className="w-3.5 h-3.5" />
                <span>Private Acquisition Network</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white leading-tight">
                Liquidate Your Flagship In <span className="italic font-light gold-gradient-text">120 Minutes.</span>
              </h2>
              <p className="text-base text-[#A0A0A0] font-light leading-relaxed max-w-lg">
                Apex executes instant off-market acquisitions of pristine luxury vehicles. We offer immediate international wire settlements and white-glove collection worldwide.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-[#7A7A7A] pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center border border-[#C9A227]/30">
                    <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <span>Instant Wire Payout</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center border border-[#C9A227]/30">
                    <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <span>Zero Commission</span>
                </div>
              </div>
            </motion.div>

            {/* Right Form Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="xl:col-span-6 bg-[#030303]/80 p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Form Noise */}
              <div className="absolute inset-0 noise-overlay opacity-30"></div>

              <div className="relative z-10">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(201,162,39,0.3)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-3xl font-serif font-bold text-white">Transmission Secured</h4>
                    <p className="text-sm text-[#A0A0A0] font-light max-w-xs mx-auto">Our acquisition director will contact you via encrypted channel within 120 minutes.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 text-xs font-mono">
                    <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                      Request Confidential Valuation
                    </h3>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-xs">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Lord / Lady Name"
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                        />
                      </div>
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@domain.com"
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Marque</label>
                        <input
                          type="text"
                          required
                          value={make}
                          onChange={(e) => setMake(e.target.value)}
                          placeholder="e.g. Ferrari, Pagani"
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                        />
                      </div>
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Model & Designation</label>
                        <input
                          type="text"
                          required
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="e.g. SF90 Spider"
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Production Year</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner appearance-none"
                        >
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="2021">2021</option>
                        </select>
                      </div>
                      <div className="group/input">
                        <label className="block text-[#7A7A7A] uppercase text-[9px] tracking-[0.2em] mb-2 group-focus-within/input:text-[#C9A227] transition-colors">Direct Contact (WhatsApp)</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+971 50 000 0000"
                          className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#9E7D1A] text-black font-mono font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] flex items-center justify-center gap-3 mt-4 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span>{loading ? 'Submitting...' : 'Submit For Valuation'}</span>
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
