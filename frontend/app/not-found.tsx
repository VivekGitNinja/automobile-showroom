import React from 'react'
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-xl p-10 rounded-3xl glass-panel border border-[rgba(255,255,255,0.08)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 flex items-center justify-center mx-auto shadow-gold-glow">
          <FileQuestion className="w-8 h-8 text-[#C9A227]" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-4xl font-serif font-bold text-white tracking-tight">404 <span className="gold-gradient-text italic">Not Found</span></h2>
          <p className="text-[#A0A0A0] text-sm font-mono max-w-md mx-auto leading-relaxed">
            The requested showroom resource could not be located. It may have been sold, relocated, or temporarily removed from the inventory.
          </p>
        </div>

        <div className="pt-6">
          <Link
            href="/inventory"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-gold-glow"
          >
            Browse Inventory
          </Link>
        </div>
      </div>
    </div>
  )
}
