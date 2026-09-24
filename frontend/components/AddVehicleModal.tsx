'use client'

import React, { useState } from 'react'
import { X, UploadCloud, Loader2, Plus, Trash2 } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'
import { useToast } from '../lib/useToast'
import { adminFetch } from '../lib/adminFetch'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
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
  const [archetype3d, setArchetype3d] = useState('auto')
  const [model3dUrl, setModel3dUrl] = useState('')
  const [stories, setStories] = useState<{sectionType: string, title: string, content: string}[]>([])
  const [frames360, setFrames360] = useState<{imageUrl: string, displayOrder: number}[]>([])
  const [sounds, setSounds] = useState<{soundType: string, audioUrl: string}[]>([])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const specsJson = specsKV.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, string>)

      if (archetype3d && archetype3d !== 'auto') {
        specsJson.archetype3d = archetype3d
      }
      if (model3dUrl) {
        specsJson.model3dUrl = model3dUrl
      }

      const payload = {
        ...formData,
        specsJson,
        stories,
        frames360,
        sounds
      }

      const res = await adminFetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)})
      if (res.ok) {
        toast('Vehicle added successfully!', 'success')
        onSuccess()
        onClose()
      } else {
        toast('Failed to add vehicle.', 'error')
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

        <h2 className="text-2xl font-serif font-bold text-white mb-6">Add New Vehicle</h2>

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

          {/* 3D Digital Twin & Stage Model */}
          <div className="space-y-4 p-5 rounded-2xl bg-dark-card border border-gold/20">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <div>
                <h3 className="text-gold font-mono uppercase tracking-widest text-xs font-bold">
                  3D Studio & Digital Twin Config
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Configure the vehicle&apos;s interactive 3D model, CAD geometry, and TopView blueprint archetype.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  3D Archetype Preset
                </label>
                <select
                  value={archetype3d}
                  onChange={(e) => setArchetype3d(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="auto">Auto-Detect (from Make / Model / Body Type)</option>
                  <option value="suv">Luxury SUV & 4x4 Off-Road (G-Class, Urus, Cullinan)</option>
                  <option value="supercar">Exotic Supercar / Hypercar (Aventador, Ferrari, GT)</option>
                  <option value="sedan">Executive Stately Saloon (Rolls-Royce, Maybach)</option>
                  <option value="coupe">Grand Tourer Coupe (Porsche 911, Aston Martin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  Custom 3D Model Asset (.glb URL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /models/ferrari.glb or custom CDN URL"
                  value={model3dUrl}
                  onChange={(e) => setModel3dUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark border border-dark-border text-white text-sm focus:outline-none focus:border-gold"
                />
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

          {/* Vehicle Video */}
          <div className="space-y-4">
            <h3 className="text-gold font-mono uppercase tracking-widest text-xs border-b border-dark-border pb-2">Vehicle Video</h3>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="Video URL (https://… or /uploads/vehicle-film.mp4)"
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          {/* 3D Virtual Studio Configuration */}
          <div className="space-y-4 p-5 rounded-2xl bg-black/50 border border-gold/20">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <h3 className="text-gold font-mono uppercase tracking-widest text-xs flex items-center gap-2">
                <span>Interactive 3D Virtual Studio Configuration</span>
              </h3>
              <span className="text-[10px] font-mono text-gray-400">WebGL & Holographic X-Ray</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  3D Digital Twin Archetype
                </label>
                <select
                  value={archetype3d}
                  onChange={(e) => setArchetype3d(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-xs focus:border-gold focus:outline-none"
                >
                  <option value="auto">✨ Auto Detect (Smart Heuristics)</option>
                  <option value="supercar">🏎️ Supercar / Hypercar Twin</option>
                  <option value="suv">🚙 Luxury High-Stance 4x4 SUV Twin</option>
                  <option value="sedan">🚘 Executive Stately Saloon Twin</option>
                  <option value="coupe">🏎️ GT Aerodynamic Sports Coupe Twin</option>
                  <option value="mclaren">🏁 British Grand Tourer / McLaren Twin</option>
                  <option value="mercedes">✨ Luxury Grand Roadster / GT Twin</option>
                </select>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Selects the base 3D chassis if no custom GLB file is specified.
                </span>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  Custom 3D Model File (.glb) URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /models/custom-car.glb or https://..."
                  value={model3dUrl}
                  onChange={(e) => setModel3dUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-xs focus:border-gold focus:outline-none placeholder-white/20"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Optional. Direct link to a dedicated 3D GLB digital twin.
                </span>
              </div>
            </div>
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
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Media Category (e.g. exterior, interior, detail)</label>
              <input
                type="text"
                value={formData.mediaCategory}
                onChange={(e) => setFormData({ ...formData, mediaCategory: e.target.value })}
                list="media-categories"
                className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm focus:outline-none focus:border-gold mb-3"
              />
              <datalist id="media-categories">
                <option value="exterior" />
                <option value="interior" />
                <option value="detail" />
                <option value="document" />
                <option value="video" />
              </datalist>
            </div>
            <div className="w-full border-2 border-dashed border-dark-border rounded-xl p-6 text-center hover:border-gold transition-colors cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-gold mx-auto mb-2 transition-colors" />
              <p className="text-xs text-gray-400 font-mono">Drag & Drop Images / PDFs here</p>
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-dark py-4 border-t border-dark-border mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gold hover:bg-gold-light text-dark font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Create Vehicle Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
