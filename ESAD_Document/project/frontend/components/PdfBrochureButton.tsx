'use client'

import React, { useState } from 'react'
import { Download, FileText, CheckCircle } from 'lucide-react'
import { Vehicle } from '../lib/types'

interface PdfBrochureButtonProps {
  vehicle: Vehicle
}

export default function PdfBrochureButton({ vehicle }: PdfBrochureButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      // Create printable brochure content blob
      const brochureText = `
================================================================
APEX LUXURY AUTOMOBILES DUBAI — BESPOKE SPECIFICATION BROCHURE
================================================================

VEHICLE: ${vehicle.make} ${vehicle.model} (${vehicle.year})
TRIM: ${vehicle.trim}
SHOWROOM PRICE: ${vehicle.currency} ${vehicle.price.toLocaleString()}

SPECIFICATIONS:
- Engine: ${vehicle.engine}
- Transmission: ${vehicle.transmission}
- Mileage: ${vehicle.mileage}
- Fuel Type: ${vehicle.fuelType}
- Body Type: ${vehicle.bodyType}
- Exterior Finish: ${vehicle.exteriorColor}
- Interior Upholstery: ${vehicle.interiorColor}

KEY PERFORMANCE:
- Horsepower: ${vehicle.specs?.['Horsepower'] || 'N/A'}
- 0-100 km/h: ${vehicle.specs?.['0-100 km/h'] || 'N/A'}
- Top Speed: ${vehicle.specs?.['Top Speed'] || 'N/A'}

SHOWROOM LOCATION:
Sheikh Zayed Road, Al Quoz Industrial 3, Dubai, UAE
Direct Concierge: +971 50 891 9441
Email: info@techzoetic.com
================================================================
      `
      const blob = new Blob([brochureText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Apex-Brochure-${vehicle.slug}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloading(false)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 4000)
    }, 1000)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full py-3.5 rounded-full border border-gold/40 text-gray-200 hover:border-gold hover:text-gold font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-dark/80"
    >
      {downloaded ? (
        <>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">Brochure Downloaded</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 text-gold" />
          <span>{downloading ? 'Generating PDF...' : 'Download Spec Brochure (PDF)'}</span>
        </>
      )}
    </button>
  )
}
