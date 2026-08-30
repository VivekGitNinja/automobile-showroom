'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Link2, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react'
import { API_BASE_URL } from '../../../lib/api'

export default function SettingsManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`)
      const data = await res.json()
      setSettings(data.data || {
        showroomName: 'Apex Luxury Automobiles',
        address: 'Sheikh Zayed Road, Dubai, UAE',
        phone: '+971 4 123 4567',
        whatsappNumber: '+971 50 891 9441',
        email: 'concierge@apex.ae',
        openingHours: 'Mon-Sun: 9:00 AM - 9:00 PM',
        mapEmbedUrl: '',
        socialLinks: { instagram: '', facebook: '', twitter: '' }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('social_')) {
      const network = name.split('_')[1]
      setSettings((prev: any) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [network]: value }
      }))
    } else {
      setSettings((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const token = localStorage.getItem('adminToken')

    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage({ text: 'Settings updated successfully.', type: 'success' })
      } else {
        setMessage({ text: 'Failed to update settings.', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Network error.', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">Loading Configuration...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white">Global Configuration</h3>
            <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mt-1">Manage public-facing showroom information</p>
          </div>
          <ShieldCheck className="w-6 h-6 text-[#C9A227]" />
        </div>

        {message && (
          <div className={`p-4 mb-8 rounded-xl text-[11px] font-mono uppercase tracking-widest ${message.type === 'success' ? 'bg-[#3DD598]/10 text-[#3DD598] border border-[#3DD598]/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest border-b border-white/5 pb-2">Showroom Details</h4>
              
              <div>
                <label className="block text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2">Showroom Name</label>
                <input type="text" name="showroomName" value={settings.showroomName || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><MapPin className="w-3 h-3" /> Address</label>
                <textarea name="address" value={settings.address || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none h-20" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Clock className="w-3 h-3" /> Opening Hours</label>
                <input type="text" name="openingHours" value={settings.openingHours || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest border-b border-white/5 pb-2">Contact Information</h4>
              
              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Phone className="w-3 h-3" /> Phone Number</label>
                <input type="text" name="phone" value={settings.phone || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Phone className="w-3 h-3" /> WhatsApp Number (VIP Concierge)</label>
                <input type="text" name="whatsappNumber" value={settings.whatsappNumber || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Mail className="w-3 h-3" /> Email Address</label>
                <input type="email" name="email" value={settings.email || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest border-b border-white/5 pb-2">Social & External Links</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Link2 className="w-3 h-3" /> Instagram</label>
                <input type="text" name="social_instagram" value={settings.socialLinks?.instagram || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Link2 className="w-3 h-3" /> Facebook</label>
                <input type="text" name="social_facebook" value={settings.socialLinks?.facebook || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><Link2 className="w-3 h-3" /> Twitter/X</label>
                <input type="text" name="social_twitter" value={settings.socialLinks?.twitter || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none" />
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-[10px] text-[#7A7A7A] uppercase tracking-widest mb-2"><MapPin className="w-3 h-3" /> Google Maps Embed URL</label>
              <textarea name="mapEmbedUrl" value={settings.mapEmbedUrl || ''} onChange={handleChange} placeholder="<iframe src='...' /> or raw embed url" className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#C9A227] focus:outline-none h-20" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 rounded-xl bg-[#C9A227] hover:bg-white text-black font-mono font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-3 text-[10px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Synchronizing...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
