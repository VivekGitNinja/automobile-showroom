'use client'

import React, { useState } from 'react'
import { X, CheckCircle, ShieldCheck } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleName?: string
}

import { z } from 'zod'

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Valid phone number is required"),
  message: z.string().optional(),
})

export default function BookingModal({ isOpen, onClose, vehicleName }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    leadType: 'booking',
    message: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    setErrors({})
    const validation = bookingSchema.safeParse(formData)
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      // Simulated reCAPTCHA delay / submission lock
      await new Promise(resolve => setTimeout(resolve, 800))
      
      await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          message: vehicleName ? `Inquiry for ${vehicleName}. ${formData.message}` : formData.message,
        }),
      })
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#C9A227] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-[#C9A227] mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Request Received</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed font-mono">
              Our VIP Sales Concierge will contact you within 15 minutes to arrange your private viewing.
            </p>
            <button
              onClick={() => { setSubmitted(false); onClose() }}
              className="px-6 py-3 rounded-full bg-[#C9A227] text-[#050505] font-bold text-xs uppercase tracking-widest font-mono shadow-gold-glow hover:bg-[#D4AF37] transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 shadow-gold-glow">
                <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">
                  VIP Concierge Inquiry
                </h3>
                {vehicleName && (
                  <p className="text-[10px] text-[#C9A227] font-mono uppercase tracking-widest block">{vehicleName}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Lord Alexander Wright"
                  className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.fullName ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                />
                {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@domain.com"
                    className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.email ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                  />
                  {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.phone ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                  />
                  {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">Special Requirements</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify viewing date or export requirements..."
                  className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#C9A227] hover:bg-[#D4AF37] text-[#050505] font-bold text-xs font-mono uppercase tracking-widest transition-colors mt-6 shadow-gold-glow"
              >
                {loading ? 'Submitting...' : 'Confirm Appointment Request'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
