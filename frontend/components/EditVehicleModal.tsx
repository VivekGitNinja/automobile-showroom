'use client'

import React, { useState, useEffect } from 'react'
import { X, UploadCloud, Loader2, Plus, Trash2 } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'
import { useToast } from '../lib/useToast'
import { Vehicle } from '../lib/types'

interface EditVehicleModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditVehicleModal({ vehicle, isOpen, onClose, onSuccess }: EditVehicleModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    transmission: 'automatic',
    status: 'published',
    isCertified: false,
    hasServiceHistory: false,
    hasInspectionReport: false,
    hasWarranty: false,
    financeAvailable: false,
    exportAvailable: false,
    gccVerified: false,
    noAccidents: false,
    originalPaint: false,
    videoUrl: '',
    mediaCategory: 'exterior'
  })

  const [specsKV, setSpecsKV] = useState<{key: string, value: string}[]>([])
  const [stories, setStories] = useState<{sectionType: string, title: string, content: string}[]>([])
  const [frames360, setFrames360] = useState<{imageUrl: string, displayOrder: number}[]>([])
  const [sounds, setSounds] = useState<{soundType: string, audioUrl: string}[]>([])

  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        price: vehicle.price ? vehicle.price.toString() : '',
        transmission: vehicle.transmission || 'automatic',
        status: vehicle.status || 'published',
        isCertified: vehicle.isCertified || false,
        hasServiceHistory: vehicle.hasServiceHistory || false,
        hasInspectionReport: vehicle.hasInspectionReport || false,
        hasWarranty: vehicle.hasWarranty || false,
        financeAvailable: vehicle.financeAvailable || false,
        exportAvailable: vehicle.exportAvailable || false,
        gccVerified: vehicle.gccVerified || false,
        noAccidents: vehicle.noAccidents || false,
        originalPaint: vehicle.originalPaint || false,
        videoUrl: vehicle.videoUrl || '',
        mediaCategory: 'exterior'
      })
      if (vehicle.specsJson) {
        setSpecsKV(Object.entries(vehicle.specsJson).map(([k, v]) => ({ key: k, value: String(v) })))
      } else {
        setSpecsKV([])
      }
      setStories(vehicle.stories || [])
      setFrames360(vehicle.frames360 || [])
      setSounds(vehicle.sounds || [])
    }
  }, [isOpen, vehicle])

  if (!isOpen || !vehicle) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const specsJson = specsKV.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, string>)

      const payload = {
        ...formData,
        specsJson,
        stories,
        frames360,
        sounds
      }

      const res = await fetch(`${API_BASE_URL}/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast('Vehicle updated successfully!', 'success')
        onSuccess()
        onClose()
      } else {
        toast('Failed to update vehicle.', 'error')
      }
    } catch (err) {
      toast('Error connecting to server.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleBoolean = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-dark border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gold transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-serif font-bold text-white mb-6">Edit Vehicle</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-gold font-mono uppercase tracking-widest text-xs border-b border-dark-border pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Make *</label>
                <input
                  type="text"
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Year *</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Price (AED)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Transmission</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold appearance-none"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trust Flags */}
          <div className="space-y-4">
            <h3 className="text-gold font-mono uppercase tracking-widest text-xs border-b border-dark-border pb-2">Trust Flags</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['isCertified', 'hasServiceHistory', 'hasInspectionReport', 'hasWarranty', 'financeAvailable', 'exportAvailable', 'gccVerified', 'noAccidents', 'originalPaint'].map((field) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData[field as keyof typeof formData] ? 'bg-gold border-gold' : 'border-gray-500 group-hover:border-gold'}`}>
                    {formData[field as keyof typeof formData] && <X className="w-3 h-3 text-black rotate-45" style={{ transform: 'rotate(0deg)' }} />}
                  </div>
                  <span className="text-xs text-gray-300">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <input type="checkbox" className="hidden" checked={!!formData[field as keyof typeof formData]} onChange={() => toggleBoolean(field as keyof typeof formData)} />
                </label>
              ))}
            </div>
          </div>

          
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A7A7A] mb-2">Video URL (vehicle film)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://… or /uploads/vehicle-film.mp4"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227]"
                />
              </div>

{/* Specs JSON Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <h3 className="text-gold font-mono uppercase tracking-widest text-xs">Custom Specifications</h3>
              <button type="button" onClick={() => setSpecsKV([...specsKV, { key: '', value: '' }])} className="text-xs text-gold flex items-center gap-1 hover:text-white">
                <Plus className="w-3 h-3" /> Add Spec
              </button>
            </div>
            {specsKV.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Key (e.g. Horsepower)" value={spec.key} onChange={(e) => { const n = [...specsKV]; n[i].key = e.target.value; setSpecsKV(n) }} className="flex-1 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <input type="text" placeholder="Value (e.g. 1600 HP)" value={spec.value} onChange={(e) => { const n = [...specsKV]; n[i].value = e.target.value; setSpecsKV(n) }} className="flex-1 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <button type="button" onClick={() => setSpecsKV(specsKV.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Stories Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <h3 className="text-gold font-mono uppercase tracking-widest text-xs">Stories</h3>
              <button type="button" onClick={() => setStories([...stories, { sectionType: '', title: '', content: '' }])} className="text-xs text-gold flex items-center gap-1 hover:text-white">
                <Plus className="w-3 h-3" /> Add Story
              </button>
            </div>
            {stories.map((story, i) => (
              <div key={i} className="bg-dark-card p-4 rounded-xl space-y-3 relative border border-dark-border">
                <button type="button" onClick={() => setStories(stories.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-2 gap-4 pr-8">
                  <input type="text" placeholder="Section Type (e.g. legacy)" value={story.sectionType} onChange={(e) => { const n = [...stories]; n[i].sectionType = e.target.value; setStories(n) }} className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-xs focus:border-gold" />
                  <input type="text" placeholder="Title" value={story.title} onChange={(e) => { const n = [...stories]; n[i].title = e.target.value; setStories(n) }} className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-xs focus:border-gold" />
                </div>
                <textarea placeholder="Content" value={story.content} onChange={(e) => { const n = [...stories]; n[i].content = e.target.value; setStories(n) }} className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-xs focus:border-gold h-20 resize-none" />
              </div>
            ))}
          </div>

          {/* 360 Frames Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <h3 className="text-gold font-mono uppercase tracking-widest text-xs">360° Frames</h3>
              <button type="button" onClick={() => setFrames360([...frames360, { imageUrl: '', displayOrder: frames360.length }])} className="text-xs text-gold flex items-center gap-1 hover:text-white">
                <Plus className="w-3 h-3" /> Add Frame
              </button>
            </div>
            {frames360.map((frame, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Image URL" value={frame.imageUrl} onChange={(e) => { const n = [...frames360]; n[i].imageUrl = e.target.value; setFrames360(n) }} className="flex-[3] px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <input type="number" placeholder="Order" value={frame.displayOrder} onChange={(e) => { const n = [...frames360]; n[i].displayOrder = parseInt(e.target.value, 10); setFrames360(n) }} className="flex-1 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <button type="button" onClick={() => setFrames360(frames360.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Sounds Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <h3 className="text-gold font-mono uppercase tracking-widest text-xs">Audio & Sounds</h3>
              <button type="button" onClick={() => setSounds([...sounds, { soundType: '', audioUrl: '' }])} className="text-xs text-gold flex items-center gap-1 hover:text-white">
                <Plus className="w-3 h-3" /> Add Sound
              </button>
            </div>
            {sounds.map((snd, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Sound Type (e.g. engine_start)" value={snd.soundType} onChange={(e) => { const n = [...sounds]; n[i].soundType = e.target.value; setSounds(n) }} className="flex-1 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <input type="text" placeholder="Audio URL" value={snd.audioUrl} onChange={(e) => { const n = [...sounds]; n[i].audioUrl = e.target.value; setSounds(n) }} className="flex-[2] px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-xs focus:border-gold" />
                <button type="button" onClick={() => setSounds(sounds.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-gold font-mono uppercase tracking-widest text-xs border-b border-dark-border pb-2">Media Upload</h3>
            <p className="text-xs text-gray-400 font-mono">Use the Asset Manager in the main table to upload media.</p>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-dark-border mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-dark-border text-white hover:bg-dark-border transition-colors text-sm font-mono tracking-widest uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gold text-black hover:bg-white transition-colors text-sm font-bold font-mono tracking-widest uppercase flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
