'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ScrollProgressBar from './ScrollProgressBar'
import LanguageToggle from './LanguageToggle'
import { ShieldCheck, Phone, Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Inventory', path: '/inventory' },
    { name: 'Marques', path: '/brands' },
    { name: 'Sell Your Car', path: '/sell-your-car' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ]

  const isHomePage = pathname === '/'
  const isHeaderSolid = scrolled || !isHomePage

  return (
    <>
      <ScrollProgressBar />
      
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isHeaderSolid 
          ? 'backdrop-blur-2xl bg-[#050505]/95 border-b border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        {/* Top Announcement Bar */}
        <div className={`transition-all duration-500 overflow-hidden bg-gradient-to-r from-[#030303] via-[#0A0A0A] to-[#030303] text-[#C9A227] text-[8px] font-mono py-0.5 px-4 text-center tracking-[0.3em] font-bold border-b border-[rgba(255,255,255,0.03)] flex items-center justify-center gap-3 ${
          scrolled ? 'h-0 py-0 opacity-0 border-none' : 'h-6 opacity-100'
        }`}>
          <Sparkles className="w-2.5 h-2.5" />
          <span>DUBAI FLAGSHIP SHOWROOM • PRIVATE COLLECTION VIEWING BY INVITATION ONLY</span>
          <Sparkles className="w-2.5 h-2.5" />
        </div>

        <div className="max-w-[1650px] mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-500 ${
                scrolled ? 'border-[#C9A227] bg-[#C9A227]/10 shadow-[0_0_15px_rgba(201,162,39,0.3)]' : 'border-white/20 bg-white/5 backdrop-blur-md group-hover:border-[#C9A227] group-hover:bg-[#C9A227]/10 group-hover:shadow-[0_0_15px_rgba(201,162,39,0.3)]'
              }`}>
                <ShieldCheck className={`w-4 h-4 transition-colors duration-500 ${scrolled ? 'text-[#C9A227]' : 'text-white group-hover:text-[#C9A227]'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-serif font-extrabold text-white tracking-widest leading-none drop-shadow-md">
                  APEX <span className={scrolled ? "gold-gradient-text" : "text-white group-hover:gold-gradient-text transition-colors duration-500"}>LUXURY</span>
                </span>
                <span className="text-[8px] font-mono text-[#7A7A7A] uppercase tracking-[0.25em] mt-0.5 group-hover:text-[#A0A0A0] transition-colors">DUBAI • EST. 2012</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link 
                    key={link.name} 
                    href={link.path} 
                    className={`relative py-1.5 transition-colors duration-300 ${isActive ? 'text-[#C9A227]' : 'text-[#B8B8B8] hover:text-[#C9A227]'}`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#C9A227] rounded-full shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
                    )}
                  </Link>
                )
              })}
              <Link href="/admin" className="px-4 py-1.5 rounded-full glass-panel border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-black hover:border-[#C9A227] transition-all duration-300">
                Admin
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center gap-5">
              <LanguageToggle />
              <a
                href="https://wa.me/971508919441"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#9E7D1A] text-black text-[9px] font-mono uppercase tracking-widest font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] hover:brightness-110"
              >
                <Phone className="w-3 h-3" />
                <span>WhatsApp VIP</span>
              </a>
            </div>

            {/* Mobile menu trigger */}
            <div className="lg:hidden flex items-center gap-4">
              <LanguageToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-white hover:text-[#C9A227]' : 'text-white hover:text-[#C9A227] bg-black/20 backdrop-blur-md border border-white/10'}`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0A0A]/95 backdrop-blur-3xl border-b border-[rgba(255,255,255,0.08)] px-6 pt-4 pb-8 space-y-6 text-xs font-mono uppercase tracking-[0.2em] shadow-2xl">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`block ${pathname === link.path ? 'text-[#C9A227] font-bold' : 'text-[#B8B8B8] hover:text-[#C9A227]'}`} 
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/admin" className="block text-[#C9A227] font-bold border-t border-white/10 pt-6" onClick={() => setMobileMenuOpen(false)}>
              CMS Admin
            </Link>
            <a
              href="https://wa.me/971508919441"
              className="flex items-center gap-2 text-[#C9A227] font-bold mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone className="w-4 h-4" />
              WhatsApp VIP
            </a>
          </div>
        )}
      </header>
    </>
  )
}
