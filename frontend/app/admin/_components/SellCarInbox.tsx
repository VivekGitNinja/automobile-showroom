'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, CarFront, MessageCircle } from 'lucide-react'
import { adminFetch } from '../../../lib/adminFetch'
import { API_BASE_URL } from '../../../lib/api'

interface SellCarSubmission {
  id: string
  fullName: string
  email: string
  phone: string
  carMake: string
  carModel: string
  carYear: number
  carMileage?: string | null
  description?: string | null
  askingPrice?: string | null
  imageUrls?: string[] | string | null
  status: string
  createdAt: string
}

const STATUS_OPTIONS = ['new', 'reviewing', 'offer_made', 'accepted', 'rejected'] as const

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  reviewing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  offer_made: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  accepted: 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function SellCarInbox() {
  const [submissions, setSubmissions] = useState<SellCarSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === 'all'
        ? `${API_BASE_URL}/admin/leads/sell-car?limit=200`
        : `${API_BASE_URL}/admin/leads/sell-car?limit=200&status=${filter}`
      const res = await adminFetch(url)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const updateStatus = async (id: string, status: string) => {
    const res = await adminFetch(`${API_BASE_URL}/admin/leads/sell-car/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchSubmissions()
  }

  const photos = (s: SellCarSubmission): string[] => {
    if (Array.isArray(s.imageUrls)) return s.imageUrls
    if (typeof s.imageUrls === 'string') {
      try { return JSON.parse(s.imageUrls) } catch { return [] }
    }
    return []
  }

  return (
    <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
            <CarFront className="w-6 h-6 text-[#C9A227]" />
            Sell-Your-Car Inbox
          </h3>
          <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em] mt-1">
            Acquisition Pipeline · {submissions.length} Submission{submissions.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex bg-black border border-white/10 rounded-full p-1">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${
                filter === s ? 'bg-[#C9A227] text-black font-bold' : 'text-[#7A7A7A] hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-5 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center text-[#7A7A7A] font-mono text-xs uppercase tracking-widest py-20">
            No sell-your-car submissions yet.
          </p>
        ) : submissions.map((s) => (
          <div key={s.id} className="p-6 rounded-2xl bg-black border border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h4 className="text-lg font-serif font-bold text-white">
                    {s.carYear} {s.carMake} {s.carModel}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${STATUS_STYLES[s.status] || 'bg-white/5 text-white/50 border-white/10'}`}>
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-mono text-[#A0A0A0] space-y-1 mt-3">
                  <p><span className="text-[#7A7A7A] uppercase tracking-widest text-[9px]">Seller:</span> {s.fullName} · {s.email} · {s.phone}</p>
                  {s.carMileage && <p><span className="text-[#7A7A7A] uppercase tracking-widest text-[9px]">Mileage:</span> {s.carMileage}</p>}
                  {s.askingPrice && <p><span className="text-[#C9A227] uppercase tracking-widest text-[9px]">Asking:</span> <span className="text-[#C9A227] font-bold">{s.askingPrice}</span></p>}
                  {s.description && <p className="text-[#A0A0A0] font-light mt-2 max-w-2xl">{s.description}</p>}
                </div>
                {photos(s).length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {photos(s).slice(0, 5).map((u, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={u} alt={`${s.carMake} ${s.carModel} photo ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex lg:flex-col items-center gap-3 shrink-0">
                <select
                  value={s.status}
                  onChange={(e) => updateStatus(s.id, e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-black">{o.replace('_', ' ')}</option>
                  ))}
                </select>
                <a
                  href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
