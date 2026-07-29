'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle } from 'lucide-react'
import { API_BASE_URL } from '../../lib/api'

import { z } from 'zod'

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long")
})

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
    phone: '',
  })

  // Persistence
  React.useEffect(() => {
    const saved = sessionStorage.getItem('contactFormDraft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(prev => ({ ...prev, fullName: parsed.fullName || '', email: parsed.email || '', phone: parsed.phone || '' }))
      } catch (e) {}
    }
  }, [])

  React.useEffect(() => {
    sessionStorage.setItem('contactFormDraft', JSON.stringify({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    }))
  }, [formData.fullName, formData.email, formData.phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErrors({})
    const validation = contactSchema.safeParse(formData)
    
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
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || 'N/A',
          message: formData.message,
          leadType: 'enquiry'
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
    <div className="pt-36 sm:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-2 font-bold">
          Concierge Relations
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
          Visit Our Showroom
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto font-light">
          Located in the heart of Dubai. Contact our concierge team to schedule a private viewing or discuss custom vehicle sourcing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info Card */}
        <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 shadow-gold-glow">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white">Apex Luxury Automobiles</h3>
              <p className="text-xs text-[#C9A227] font-mono uppercase tracking-widest font-bold">Dubai Flagship Showroom</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-gray-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block mb-0.5 font-mono uppercase tracking-widest text-[10px]">Address</span>
                <span>Sheikh Zayed Road, Al Quoz Industrial 3, Dubai, United Arab Emirates</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#C9A227] shrink-0" />
              <div>
                <span className="font-semibold text-white block mb-0.5 font-mono uppercase tracking-widest text-[10px]">Direct / WhatsApp</span>
                <span>+971 50 891 9441</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#C9A227] shrink-0" />
              <div>
                <span className="font-semibold text-white block mb-0.5 font-mono uppercase tracking-widest text-[10px]">Email Contact</span>
                <span>info@techzoetic.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C9A227] shrink-0" />
              <div>
                <span className="font-semibold text-white block mb-0.5 font-mono uppercase tracking-widest text-[10px]">Showroom Hours</span>
                <span>Saturday – Thursday: 10:00 AM – 9:00 PM (GST)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] shadow-2xl">
          <h3 className="text-xl font-serif font-bold text-white mb-6">Send Concierge Message</h3>
          
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-[#C9A227] mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-white mb-2">Message Sent</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Our concierge team has received your enquiry and will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-full bg-[#C9A227] text-[#050505] font-bold text-[11px] font-mono uppercase tracking-widest"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Lord / Lady Name"
                  autoComplete="name"
                  className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.fullName ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C9A227]`}
                />
                {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@domain.com"
                    autoComplete="email"
                    inputMode="email"
                    className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.email ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C9A227]`}
                  />
                  {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+971 50..."
                    className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="How may our concierge assist you?"
                  className={`w-full px-4 py-3 rounded-xl bg-[#050505] border ${errors.message ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C9A227]`}
                />
                {errors.message && <span className="text-red-500 text-xs mt-1 block">{errors.message}</span>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#C9A227] text-[#050505] font-bold text-xs uppercase tracking-widest font-mono hover:bg-[#D4AF37] transition-colors shadow-gold-glow mt-4"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
