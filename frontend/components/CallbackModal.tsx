'use client'

import React, { useState } from 'react'
import { X, CheckCircle, PhoneCall, ShieldCheck } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'
import { z } from 'zod'

interface CallbackModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId?: string
  vehicleName?: string
}

const callbackSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Valid phone number is required (min 7 digits)'),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  message: z.string().optional(),
})

export default function CallbackModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
}: CallbackModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredTime: 'afternoon' as 'morning' | 'afternoon' | 'evening',
    notes: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErrors({})
    setSubmitError(null)

    const validation = callbackSchema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      preferredTime: formData.preferredTime,
      message: formData.notes,
    })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      // Compose clear structured message
      const timeLabels: Record<string, string> = {
        morning: 'Morning (10:00 AM – 1:00 PM)',
        afternoon: 'Afternoon (1:00 PM – 5:00 PM)',
        evening: 'Evening (5:00 PM – 9:00 PM)',
      }
      const timeStr = timeLabels[formData.preferredTime] || formData.preferredTime
      const autoMessage = [
        `Callback request${vehicleName ? ` for ${vehicleName}` : ''}.`,
        `Preferred time: ${timeStr}.`,
        formData.notes ? `Client note: ${formData.notes}` : null,
      ]
        .filter(Boolean)
        .join(' ')

      const payload: Record<string, any> = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        leadType: 'callback',
        message: autoMessage,
        company_website: companyWebsite,
      }

      if (vehicleId) {
        payload.vehicleId = vehicleId
      }

      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(
          errData.message ||
            errData.error ||
            "We couldn't submit your callback request — please retry or call our desk directly."
        )
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Callback submission error:', err)
      setSubmitError(
        err?.message ||
          "We couldn't submit your callback request — please retry or WhatsApp our VIP concierge directly."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="callback-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close callback request modal"
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#C9A227] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-[#C9A227] mx-auto mb-4 animate-bounce" />
            <h3 id="callback-modal-title" className="text-2xl font-serif font-bold text-white mb-2">
              Callback Requested
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed font-mono">
              Our Senior Automotive Director will contact you during your preferred time window.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
              className="px-6 py-3 rounded-full bg-[#C9A227] text-[#050505] font-bold text-xs uppercase tracking-widest font-mono shadow-gold-glow hover:bg-[#D4AF37] transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 shadow-gold-glow">
                <PhoneCall className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <h3 id="callback-modal-title" className="text-xl font-serif font-bold text-white">
                  Request a Private Callback
                </h3>
                {vehicleName ? (
                  <p className="text-[10px] text-[#C9A227] font-mono uppercase tracking-widest block">
                    Regarding: {vehicleName}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#7A7A7A] font-mono uppercase tracking-widest block">
                    Apex Executive Concierge Desk
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot Spam Trap */}
              <input
                type="text"
                name="company_website"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
              />

              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono leading-relaxed">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rashid Al Maktoum"
                  className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${
                    errors.fullName ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'
                  } text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-xs mt-1 block">{errors.fullName}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.ae"
                    className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${
                      errors.email ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'
                    } text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 891 9441"
                    className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${
                      errors.phone ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'
                    } text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm`}
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">
                  Preferred Time Window *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'morning', label: 'Morning', sub: '10am - 1pm' },
                    { id: 'afternoon', label: 'Afternoon', sub: '1pm - 5pm' },
                    { id: 'evening', label: 'Evening', sub: '5pm - 9pm' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, preferredTime: t.id as any })
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.preferredTime === t.id
                          ? 'border-[#C9A227] bg-[#C9A227]/10 text-white font-bold'
                          : 'border-white/10 bg-[#050505] text-[#7A7A7A] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-mono">{t.label}</div>
                      <div className="text-[9px] text-[#A0A0A0] font-mono mt-0.5">{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-[#7A7A7A] mb-1">
                  Notes / Specific Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Inquire about export shipping or trade-in evaluation..."
                  className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A227] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#C9A227] hover:bg-[#D4AF37] text-[#050505] font-bold text-xs font-mono uppercase tracking-widest transition-colors mt-6 shadow-gold-glow disabled:opacity-50"
              >
                {loading ? 'Submitting Request...' : 'Request Private Callback'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
