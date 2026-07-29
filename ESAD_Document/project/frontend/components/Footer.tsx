'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, MapPin, Phone, Mail, Sparkles, ArrowRight, Instagram, Youtube, Twitter, Facebook, Loader2, Check } from 'lucide-react'
import CarRunningAnimation from './CarRunningAnimation'
import { API_BASE_URL } from '../lib/api'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    try {
      await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'newsletter' }),
      })
      setSuccess(true)
      setEmail('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-[#030303] text-[#B8B8B8] relative border-t border-[rgba(255,255,255,0.05)] pt-12 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#C9A227]/5 rounded-[100%] blur-[120px] pointer-events-none" />

      {/* Car Animation Divider */}
      <div className="absolute top-0 left-0 w-full z-0 opacity-50">
        <CarRunningAnimation />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group mb-4">
                <div className="w-12 h-12 rounded-full border border-[#C9A227]/50 flex items-center justify-center bg-[#C9A227]/10 shadow-[0_0_15px_rgba(201,162,39,0.3)] group-hover:scale-110 group-hover:bg-[#C9A227]/20 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-extrabold text-white tracking-widest leading-none drop-shadow-md">
                    APEX <span className="gold-gradient-text">LUXURY</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#7A7A7A] uppercase tracking-[0.3em] mt-1">DUBAI • EST. 2012</span>
                </div>
              </Link>
              <p className="text-sm text-[#A0A0A0] leading-relaxed font-light max-w-sm">
                The Middle East's premier destination for rare hypercars, bespoke luxury motorcars, and off-market automotive acquisitions.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] font-bold">Subscribe to The Collection</h4>
              {success ? (
                <div className="flex items-center gap-2 text-[#C9A227] text-sm">
                  <Check className="w-4 h-4" />
                  <span>Welcome to The Collection.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all shadow-inner"
                  />
                  <button type="submit" disabled={loading} className="w-12 shrink-0 bg-gradient-to-r from-[#D4AF37] to-[#9E7D1A] rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-[0_0_15px_rgba(201,162,39,0.3)] group disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] mb-6 font-bold flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-4 text-xs font-mono uppercase tracking-widest text-[#B8B8B8]">
              <li><Link href="/inventory" className="hover:text-[#C9A227] hover:translate-x-1 inline-block transition-all duration-300">Inventory</Link></li>
              <li><Link href="/brands" className="hover:text-[#C9A227] hover:translate-x-1 inline-block transition-all duration-300">Marques</Link></li>
              <li><Link href="/sell-your-car" className="hover:text-[#C9A227] hover:translate-x-1 inline-block transition-all duration-300">Sell Vehicle</Link></li>
              <li><Link href="/faq" className="hover:text-[#C9A227] hover:translate-x-1 inline-block transition-all duration-300">FAQ & Policies</Link></li>
            </ul>
          </div>

          {/* Curated Marques */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] mb-6 font-bold">Curated Marques</h4>
            <ul className="space-y-4 text-xs font-mono uppercase tracking-widest text-[#B8B8B8]">
              <li className="hover:text-white transition-colors cursor-default">Bugatti</li>
              <li className="hover:text-white transition-colors cursor-default">Pagani</li>
              <li className="hover:text-white transition-colors cursor-default">Koenigsegg</li>
              <li className="hover:text-white transition-colors cursor-default">Ferrari</li>
              <li className="hover:text-white transition-colors cursor-default">Rolls-Royce</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] mb-6 font-bold">Dubai Flagship Showroom</h4>
            <ul className="space-y-5 text-xs font-mono text-[#A0A0A0]">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                </div>
                <span className="leading-relaxed pt-1">Sheikh Zayed Road,<br/>Al Quoz Industrial 3, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group hover:bg-[#C9A227]/20 hover:border-[#C9A227]/50 transition-all cursor-pointer">
                  <Phone className="w-3.5 h-3.5 text-[#C9A227] group-hover:animate-pulse" />
                </div>
                <span>+971 50 891 9441</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group hover:bg-[#C9A227]/20 hover:border-[#C9A227]/50 transition-all cursor-pointer">
                  <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
                </div>
                <span>info@techzoetic.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col md:flex-row items-center justify-between text-[10px] font-mono uppercase tracking-[0.1em] text-[#7A7A7A] gap-4">
          <p>© {new Date().getFullYear()} Apex Luxury Automobiles Dubai. All rights reserved.</p>
          
          <div className="flex gap-4">
            <a href="https://twitter.com/apexluxury" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-black hover:scale-110 transition-all duration-300 text-white">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com/apexluxury" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-black hover:scale-110 transition-all duration-300 text-white">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://facebook.com/apexluxury" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-black hover:scale-110 transition-all duration-300 text-white">
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="flex items-center gap-1">
            Engineered with precision by <span className="text-[#C9A227]">TechZoetic</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
