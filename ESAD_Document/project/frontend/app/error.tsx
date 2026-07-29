'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error Boundary Caught:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-xl p-10 rounded-3xl glass-panel border border-red-500/20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center mx-auto shadow-red-glow">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">System Exception</h2>
          <p className="text-[#A0A0A0] text-sm font-mono max-w-md mx-auto">
            An unexpected error occurred in the application layer. The system architecture has safely captured this exception.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-left mt-4 overflow-auto max-h-32">
              <p className="text-xs font-mono text-red-400 font-bold">{error.message}</p>
            </div>
          )}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Attempt Recovery</span>
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#2A2A2A] text-white hover:border-[#C9A227] hover:text-[#C9A227] font-mono text-xs font-bold uppercase tracking-widest transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
