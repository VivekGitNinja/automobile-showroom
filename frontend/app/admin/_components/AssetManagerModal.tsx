'use client'

import React, { useState, useRef } from 'react'
import { X, UploadCloud, Loader2, Image as ImageIcon, Box, Volume2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Vehicle } from '../../../lib/types'
import { API_BASE_URL } from '../../../lib/api'

interface AssetManagerModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AssetManagerModal({ vehicle, isOpen, onClose, onSuccess }: AssetManagerModalProps) {
  const [assetType, setAssetType] = useState<'primary' | 'gallery' | '360' | 'audio'>('primary')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !vehicle) return null

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }
    setUploading(true)
    setError('')
    setSuccessMsg('')

    const formData = new FormData()
    formData.append('asset', file)
    formData.append('assetType', assetType)

    try {
      const res = await fetch(`${API_BASE_URL}/admin/vehicles/${vehicle.id}/upload-asset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(data.message || 'Upload successful')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        onSuccess() // Refresh the parent data
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  const assetOptions = [
    { id: 'primary', label: 'Primary Cover Image', icon: ImageIcon, desc: 'Used for listings and headers (JPEG/PNG/WEBP)' },
    { id: 'gallery', label: 'Gallery Image', icon: ImageIcon, desc: 'Additional exterior/interior images' },
    { id: '360', label: '360° Frame', icon: Box, desc: 'Individual frames for the 3D viewer' },
    { id: 'audio', label: 'Engine Audio', icon: Volume2, desc: 'Engine startup/revving sound (MP3/WAV)' },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-white">Asset Manager</h3>
            <p className="text-[10px] text-[#7A7A7A] font-mono uppercase tracking-widest mt-1">
              {vehicle.make} {vehicle.model}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[#A0A0A0] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Asset Type Selection */}
          <div className="space-y-3">
            <label className="block text-[#7A7A7A] uppercase text-[10px] font-mono tracking-widest">1. Select Asset Type</label>
            <div className="grid grid-cols-2 gap-3">
              {assetOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAssetType(opt.id)}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                    assetType === opt.id 
                      ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#C9A227]' 
                      : 'bg-black border-white/5 text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <opt.icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#7A7A7A]">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-3">
            <label className="block text-[#7A7A7A] uppercase text-[10px] font-mono tracking-widest">2. Select File</label>
            <div 
              className="border-2 border-dashed border-white/10 rounded-2xl bg-black p-8 flex flex-col items-center justify-center text-center hover:border-[#C9A227]/50 hover:bg-[#C9A227]/5 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0])
                    setError('')
                    setSuccessMsg('')
                  }
                }}
                accept={assetType === 'audio' ? 'audio/*' : 'image/*'}
              />
              <UploadCloud className={`w-8 h-8 mb-4 ${file ? 'text-[#C9A227]' : 'text-[#A0A0A0] group-hover:text-[#C9A227]'} transition-colors`} />
              {file ? (
                <div className="text-sm font-mono text-white">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-white mb-1">Click to select asset</h4>
                  <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest">
                    {assetType === 'audio' ? 'Accepts MP3, WAV' : 'Accepts JPG, PNG, WEBP'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">{error}</div>}
          {successMsg && <div className="p-4 rounded-xl bg-[#3DD598]/10 border border-[#3DD598]/20 text-[#3DD598] text-xs font-mono flex items-center gap-2"><CheckCircle className="w-4 h-4" />{successMsg}</div>}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full h-14 rounded-xl font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-colors ${
              !file || uploading ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-[#C9A227] text-black hover:bg-white'
            }`}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> <span>Uploading to Server...</span></>
            ) : (
              <><UploadCloud className="w-4 h-4" /> <span>Start Upload</span></>
            )}
          </button>

        </div>
      </motion.div>
    </div>
  )
}
