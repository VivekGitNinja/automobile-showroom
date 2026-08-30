'use client'

import React, { useState } from 'react'
import { Send, Loader2, MessageCircle, CheckCircle } from 'lucide-react'
import { API_BASE_URL } from '../../../lib/api'
import { useSettings } from '../../../lib/useSettings'

export default function PartEnquiry({ partName, partSku }: { partName: string; partSku: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const { waLink } = useSettings()

  const waText = `Hello, I would like to enquire about the part "${partName}" (SKU: ${partSku}).`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          leadType: 'enquiry',
          message: `PART ENQUIRY — ${partName} (SKU: ${partSku})\n\n${message || 'Please confirm availability, pricing and fitting options.'}`,
        }),
      })
      if (res.ok) {
        setSubmitted('Enquiry received — our parts desk will contact you shortly.')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Submission failed. Please try WhatsApp or call us directly.')
      }
    } catch {
      setError('Network error. Please try WhatsApp or call us directly.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-[#3DD598]/30 text-center">
        <CheckCircle className="w-10 h-10 text-[#3DD598] mx-auto mb-4" />
        <p className="text-white font-serif text-lg mb-1">{submitted}</p>
        <p className="text-xs text-[#7A7A7A] font-mono uppercase tracking-widest">Reference: {partSku}</p>
      </div>
    )
  }

  return (
    <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5">
      <h3 className="text-lg font-serif font-bold text-white mb-1">Enquire About This Part</h3>
      <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mb-6">
        Confirm availability · fitting · worldwide shipping
      </p>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="px-5 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] text-xs font-mono"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="px-5 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] text-xs font-mono"
          />
        </div>
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (incl. country code)"
          className="w-full px-5 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] text-xs font-mono"
        />
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Your ${partName} question (VIN helps us confirm fitment)`}
          className="w-full px-5 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] text-xs font-mono resize-none"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 h-14 rounded-xl bg-[#C9A227] hover:bg-white text-black font-mono font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Enquiry
          </button>
          <a
            href={waLink(waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-14 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black font-mono font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Ask on WhatsApp
          </a>
        </div>
      </form>
    </div>
  )
}
