'use client'

import React, { useState } from 'react'
import { X, UploadCloud, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    transmission: 'automatic',
    status: 'published'
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        alert('Failed to add vehicle.')
      }
    } catch (err) {
      alert('Error connecting to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-dark border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-serif font-bold text-white mb-6">Add New Vehicle</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="pt-4 border-t border-dark-border">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Media Upload</label>
            <div className="w-full border-2 border-dashed border-dark-border rounded-xl p-6 text-center hover:border-gold transition-colors cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-gold mx-auto mb-2 transition-colors" />
              <p className="text-xs text-gray-400 font-mono">Drag & Drop Images / PDFs here</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gold hover:bg-gold-light text-dark font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : 'Create Vehicle Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
