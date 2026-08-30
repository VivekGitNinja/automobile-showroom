'use client'

import React, { useState } from 'react'
import { ShieldCheck, CheckCircle } from 'lucide-react'
import { API_BASE_URL } from '../../lib/api'

import { z } from 'zod'

const sellCarSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Valid phone number is required"),
  carMake: z.string().min(2, "Make is required"),
  carModel: z.string().min(2, "Model is required"),
  carYear: z.number().int().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  carMileage: z.string().optional(),
  askingPrice: z.string().optional(),
  description: z.string().optional(),
})

export default function SellYourCarPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    carMake: '',
    carModel: '',
    carYear: new Date().getFullYear(),
    carMileage: '',
    askingPrice: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || uploadingFiles) return
    
    setErrors({})
    const validation = sellCarSchema.safeParse(formData)
    
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
      let uploadedUrls: string[] = []
      
      if (files.length > 0) {
        const uploadData = new FormData()
        files.forEach(file => uploadData.append('files', file))
        
        const uploadRes = await fetch(`${API_BASE_URL}/leads/upload`, {
          method: 'POST',
          body: uploadData,
        })
        
        if (uploadRes.ok) {
          const resJson = await uploadRes.json()
          uploadedUrls = resJson.urls || resJson.data?.urls || []
        }
      }

      const finalData = {
        ...formData,
        mediaUrls: uploadedUrls
      }

      await fetch(`${API_BASE_URL}/leads/sell-car`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })
    } catch (err) {
      console.error("Submission error:", err)
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles(prev => [...prev, ...Array.from(newFiles)])
    }
  }

  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold block mb-2">
          Consignment & Direct Acquisition
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
          Sell Your Supercar
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto font-light">
          We purchase rare hypercars, luxury sedans, and low-mileage exotic sports cars outright or offer global consignment options.
        </p>
      </div>

      <div className="bg-dark-card border border-gold/30 rounded-2xl p-8 shadow-2xl">
        {submitted ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gold mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Vehicle Valuation Submitted</h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
              Our acquisition specialists will review your vehicle specifications and present an initial offer within 2 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-full bg-gold text-dark font-bold text-xs uppercase tracking-wider"
            >
              Submit Another Vehicle
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-white border-b border-gold/20 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              <span>Vehicle & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Make *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ferrari"
                  value={formData.carMake}
                  onChange={(e) => setFormData({ ...formData, carMake: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.carMake ? 'border-red-500' : 'border-gold/20'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold`}
                />
                {errors.carMake && <span className="text-red-500 text-xs mt-1 block">{errors.carMake}</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 812 Superfast"
                  value={formData.carModel}
                  onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.carModel ? 'border-red-500' : 'border-gold/20'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold`}
                />
                {errors.carModel && <span className="text-red-500 text-xs mt-1 block">{errors.carModel}</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Model Year *</label>
                <input
                  type="number"
                  required
                  value={formData.carYear}
                  onChange={(e) => setFormData({ ...formData, carYear: parseInt(e.target.value, 10) })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.carYear ? 'border-red-500' : 'border-gold/20'} text-white text-sm focus:outline-none focus:border-gold`}
                />
                {errors.carYear && <span className="text-red-500 text-xs mt-1 block">{errors.carYear}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Current Mileage</label>
                <input
                  type="text"
                  placeholder="e.g. 4,500 km"
                  value={formData.carMileage}
                  onChange={(e) => setFormData({ ...formData, carMileage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark border border-gold/20 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Asking Price (AED)</label>
                <input
                  type="text"
                  placeholder="e.g. 1,450,000"
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark border border-gold/20 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-dark-border">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Owner Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.fullName ? 'border-red-500' : 'border-gold/20'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold`}
                />
                {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName}</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="owner@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.email ? 'border-red-500' : 'border-gold/20'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold`}
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+971 50 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-dark border ${errors.phone ? 'border-red-500' : 'border-gold/20'} text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold`}
                />
                {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>}
              </div>
            </div>

            {/* Drag & Drop File Upload */}
            <div className="pt-4 border-t border-dark-border">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Vehicle Images & Documents (Optional)</label>
              <div 
                className="w-full border-2 border-dashed border-gold/30 rounded-2xl p-8 text-center hover:border-gold hover:bg-gold/5 transition-colors cursor-pointer group"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-gold', 'bg-gold/5'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-gold', 'bg-gold/5'); }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  e.currentTarget.classList.remove('border-gold', 'bg-gold/5');
                  handleFileChange(e.dataTransfer.files);
                }}
                onClick={() => {
                   const input = document.createElement('input');
                   input.type = 'file';
                   input.multiple = true;
                   input.accept = 'image/jpeg, image/png, application/pdf';
                   input.onchange = (e) => {
                     const target = e.target as HTMLInputElement;
                     handleFileChange(target.files);
                   };
                   input.click();
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-dark flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="text-sm text-gray-300 font-mono mt-2">
                    {files.length > 0 ? (
                      <span className="text-gold font-bold">{files.length} File(s) Selected</span>
                    ) : (
                      <>Drag & Drop your files here, or <span className="text-gold underline underline-offset-4">browse</span></>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Supports JPG, PNG, PDF (Max 10MB)</p>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="px-3 py-1 bg-dark-card border border-gold/20 rounded-full text-xs text-gray-300 flex items-center gap-2">
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gold hover:bg-gold-light text-dark font-bold text-xs uppercase tracking-widest transition-colors shadow-lg shadow-gold/20"
            >
              {loading ? 'Submitting Valuation...' : 'Submit Vehicle For Valuation'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
