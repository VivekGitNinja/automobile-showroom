'use client'

import React from 'react'
import { useToast } from '../../lib/useToast'
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className="pointer-events-auto bg-[#050505] border border-[#C9A227]/30 shadow-[0_0_20px_rgba(201,162,39,0.15)] rounded-xl p-4 min-w-[300px] flex items-start gap-3 transition-all duration-300"
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />}
          
          <div className="flex-1 text-sm text-gray-200 pr-4">
            {t.message}
          </div>
          
          <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
