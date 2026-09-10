'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, Loader2, X, Printer, Download, Sparkles, ShieldCheck, Crown } from 'lucide-react'
import { Vehicle } from '../lib/types'

interface PdfBrochureButtonProps {
  vehicle: Vehicle
}

export default function PdfBrochureButton({ vehicle }: PdfBrochureButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const formattedPrice = vehicle.price
    ? `${vehicle.currency || 'USD'} $${vehicle.price.toLocaleString()}`
    : 'Price Upon Application'

  const heroImage = vehicle.galleryImages?.[0]?.urlOriginal || vehicle.images?.[0] || '/images/hero/hero-car-1.jpg'
  const interiorImage = vehicle.galleryImages?.find(img => img.mediaCategory === 'interior')?.urlOriginal || '/images/hero/hero-car-1.jpg'
  const engineImage = vehicle.hotspots?.find(h => h.iconType === 'engine')?.partImageUrl || '/images/hero/hero-car-1.jpg'

  const handleOpenPreview = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setIsPreviewOpen(true)
    }, 400)
  }

  const handlePrintPdf = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex Luxury Automobiles — Spec Brochure ${vehicle.make} ${vehicle.model}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      background-color: #030303;
      color: #F0F0F0;
      font-family: 'Outfit', sans-serif;
      -webkit-print-color-adjust: exact;
    }

    .page {
      width: 297mm;
      height: 210mm;
      padding: 20mm;
      page-break-after: always;
      position: relative;
      background: #060606;
      border: 12px solid #0D0D0D;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .gold-border-frame {
      position: absolute;
      inset: 12mm;
      border: 1px solid rgba(201, 162, 39, 0.4);
      pointer-events: none;
    }

    /* Page 1: Executive Cover */
    .header-logo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    
    .brand-mark {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 6px;
      background: linear-gradient(135deg, #FFF 0%, #C9A227 50%, #997415 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sub-mark {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 4px;
      color: #A0A0A0;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .badge-certified {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C9A227;
      border: 1px solid #C9A227;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(201, 162, 39, 0.08);
    }

    .hero-container {
      position: relative;
      height: 98mm;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin: 6mm 0;
    }

    .hero-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #060606 0%, transparent 60%);
    }

    .title-price-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 10;
    }

    .car-title-block h1 {
      font-family: 'Cinzel', serif;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #FFFFFF;
      line-height: 1.1;
    }

    .car-title-block .meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #A0A0A0;
      letter-spacing: 2px;
      margin-top: 6px;
      text-transform: uppercase;
    }

    .price-block {
      text-align: right;
    }

    .price-block .label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 3px;
      color: #888888;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .price-block .amount {
      font-family: 'JetBrains Mono', monospace;
      font-size: 26px;
      font-weight: 600;
      color: #C9A227;
    }

    .footer-bar {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 4mm;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #666666;
      letter-spacing: 2px;
      text-transform: uppercase;
      z-index: 10;
    }

    /* Page 2: Technical Dossier */
    .page-2-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(201, 162, 39, 0.3);
      padding-bottom: 4mm;
    }

    .page-2-header h2 {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      letter-spacing: 3px;
      color: #C9A227;
      text-transform: uppercase;
    }

    .key-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 6mm 0;
    }

    .metric-card {
      background: #0C0C0C;
      border: 1px solid rgba(201, 162, 39, 0.3);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 700;
      color: #FFF;
    }

    .metric-lbl {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #C9A227;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .specs-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 6mm;
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 4px;
    }

    .spec-k {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
    }

    .spec-v {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #EEE;
    }

    .photo-mosaic {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 48mm;
    }

    .detail-img-box {
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page">
    <div class="gold-border-frame"></div>
    
    <div class="header-logo">
      <div>
        <div class="brand-mark">APEX AUTOMOBILI</div>
        <div class="sub-mark">Sheikh Zayed Road Atelier · Dubai, UAE</div>
      </div>
      <div class="badge-certified">Certified Provenance</div>
    </div>

    <div class="hero-container">
      <img src="${heroImage}" alt="${vehicle.make} ${vehicle.model}">
      <div class="hero-gradient"></div>
    </div>

    <div class="title-price-row">
      <div class="car-title-block">
        <div class="meta">${vehicle.year} · GCC SPECIFICATION · CHASSIS ARCHIVE</div>
        <h1>${vehicle.year} ${vehicle.make} ${vehicle.model}</h1>
      </div>
      <div class="price-block">
        <div class="label">Showroom Price</div>
        <div class="amount">${formattedPrice}</div>
      </div>
    </div>

    <div class="footer-bar">
      <div>VIN: ${vehicle.vin || 'CONFIDENTIAL / VERIFIED'}</div>
      <div>Confidential Client Specification Dossier · Page 1 of 2</div>
    </div>
  </div>

  <!-- PAGE 2: SPECS -->
  <div class="page">
    <div class="gold-border-frame"></div>

    <div class="page-2-header">
      <h2>Engineering & Performance Dossier</h2>
      <div class="sub-mark">${vehicle.make} ${vehicle.model}</div>
    </div>

    <div class="key-metrics-grid">
      <div class="metric-card">
        <div class="metric-val">1,600 HP</div>
        <div class="metric-lbl">Power Output</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">440 KM/H</div>
        <div class="metric-lbl">Maximum Velocity</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">2.4 SEC</div>
        <div class="metric-lbl">0 - 100 KM/H</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">1,600 NM</div>
        <div class="metric-lbl">Peak Torque</div>
      </div>
    </div>

    <div class="specs-table">
      <div class="spec-item">
        <span class="spec-k">Engine Architecture</span>
        <span class="spec-v">${vehicle.engine || '8.0L Quad-Turbocharged W16'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Transmission</span>
        <span class="spec-v">${vehicle.transmission || '7-Speed Dual-Clutch'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Drivetrain</span>
        <span class="spec-v">${vehicle.drivetrain || 'All-Wheel Drive (AWD)'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Exterior Livery</span>
        <span class="spec-v">${vehicle.exteriorColor || 'Nocturne Black / Clear Carbon'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Interior Trim</span>
        <span class="spec-v">${vehicle.interiorColor || 'Gaucho Leather / Polished Titanium'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Odometer</span>
        <span class="spec-v">${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'Delivery Mileage (0 km)'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">Warranty</span>
        <span class="spec-v">${vehicle.hasWarranty ? '2-Year Apex Atelier Warranty' : 'Factory Direct Support'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-k">GCC Verification</span>
        <span class="spec-v">${vehicle.gccVerified ? 'Certified GCC Compliance' : 'Global Export Ready'}</span>
      </div>
    </div>

    <div>
      <div class="sub-mark" style="margin-bottom: 6px; color: #C9A227;">Atelier Inspection Angles</div>
      <div class="photo-mosaic">
        <div class="detail-img-box"><img src="${engineImage}" alt="Engine"></div>
        <div class="detail-img-box"><img src="${interiorImage}" alt="Interior"></div>
      </div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 600);
      };
    </script>
  </body>
  </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      return
    }

    // Fallback if browser popup blocker stops window.open
    try {
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.zIndex = '-9999'
      document.body.appendChild(iframe)
      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
        setTimeout(() => {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe)
            }
          }, 2000)
        }, 600)
      }
    } catch {
      window.print()
    }
  }

  return (
    <>
      <button
        onClick={handleOpenPreview}
        disabled={generating}
        className="h-12 w-full px-5 rounded-2xl text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-white hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-200 flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 text-[#C9A227] animate-spin" />
            <span>Preparing Presentation...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 text-[#C9A227]" />
            <span>Spec Brochure (PDF)</span>
          </>
        )}
      </button>

      {/* God-Level Canva Interactive PDF Previewer Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-[#070707] border border-[#C9A227]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-6 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest block">
                      Executive Canva PDF Presentation · 2 Pages
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrintPdf}
                    className="px-5 py-2.5 rounded-full bg-[#C9A227] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158] transition-all flex items-center gap-2 shadow-lg shadow-[#C9A227]/20"
                  >
                    <Printer className="w-4 h-4" /> Save / Print PDF
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2.5 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Luxury Brochure Canvas Preview */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-12 bg-[#040404] scrollbar-thin scrollbar-thumb-[#C9A227]/30">
                
                {/* PAGE 1 PREVIEW */}
                <div className="relative bg-[#060606] border-2 border-[#C9A227]/40 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-[#C9A227]/30">
                    <div>
                      <h1 className="font-serif text-2xl font-bold text-[#C9A227] tracking-widest uppercase">
                        APEX AUTOMOBILI
                      </h1>
                      <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase block mt-1">
                        Dubai · Sheikh Zayed Road Atelier
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#C9A227] border border-[#C9A227] px-4 py-1.5 rounded-full uppercase tracking-widest bg-[#C9A227]/5">
                      Certificate of Provenance
                    </span>
                  </div>

                  <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden border border-white/10">
                    <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest block mb-1">
                        Bespoke Specification Document
                      </span>
                      <h2 className="font-serif text-3xl font-bold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h2>
                      <span className="text-[10px] font-mono text-white/40 block mt-2">
                        VIN: {vehicle.vin || 'Not specified'} · GCC CERTIFIED
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-1">
                        Showroom Price
                      </span>
                      <span className="font-mono text-2xl sm:text-3xl font-bold text-[#C9A227]">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAGE 2 PREVIEW */}
                <div className="relative bg-[#060606] border-2 border-[#C9A227]/40 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-[#C9A227]/30">
                    <h2 className="font-serif text-lg font-bold text-[#C9A227] tracking-widest uppercase">
                      Technical Specification Matrix
                    </h2>
                    <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase">
                      Page 2 of 2
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#0E0E0E] border border-[#C9A227]/30 p-5 rounded-xl text-center">
                      <div className="font-serif text-xl sm:text-2xl font-bold text-white">1,600 HP</div>
                      <div className="text-[9px] font-mono text-[#C9A227] uppercase tracking-widest mt-1">Powertrain</div>
                    </div>
                    <div className="bg-[#0E0E0E] border border-[#C9A227]/30 p-5 rounded-xl text-center">
                      <div className="font-serif text-xl sm:text-2xl font-bold text-white">440 KM/H</div>
                      <div className="text-[9px] font-mono text-[#C9A227] uppercase tracking-widest mt-1">Top Speed</div>
                    </div>
                    <div className="bg-[#0E0E0E] border border-[#C9A227]/30 p-5 rounded-xl text-center">
                      <div className="font-serif text-xl sm:text-2xl font-bold text-white">2.4 SEC</div>
                      <div className="text-[9px] font-mono text-[#C9A227] uppercase tracking-widest mt-1">0-100 KM/H</div>
                    </div>
                    <div className="bg-[#0E0E0E] border border-[#C9A227]/30 p-5 rounded-xl text-center">
                      <div className="font-serif text-xl sm:text-2xl font-bold text-white">1,600 NM</div>
                      <div className="text-[9px] font-mono text-[#C9A227] uppercase tracking-widest mt-1">Peak Torque</div>
                    </div>
                  </div>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A0A0A] border border-white/10 p-3.5 rounded-xl flex justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase">Engine</span>
                      <span className="text-xs font-semibold text-white">{vehicle.engine || '8.0L W16 Quad-Turbo'}</span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 p-3.5 rounded-xl flex justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase">Transmission</span>
                      <span className="text-xs font-semibold text-white">{vehicle.transmission || '7-Speed Dual-Clutch'}</span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 p-3.5 rounded-xl flex justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase">Odometer</span>
                      <span className="text-xs font-semibold text-white">{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : '0 km'}</span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 p-3.5 rounded-xl flex justify-between">
                      <span className="text-[10px] font-mono text-white/50 uppercase">Exterior Paint</span>
                      <span className="text-xs font-semibold text-white">{vehicle.exteriorColor || 'Liquid Silver / Clear Carbon'}</span>
                    </div>
                  </div>

                  {/* Detail Photos */}
                  <div className="grid grid-cols-2 gap-4 h-48">
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <img src={engineImage} alt="Engine" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <img src={interiorImage} alt="Interior" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-mono text-white/50 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Apex Atelier Verified Presentation
                </span>
                <button
                  onClick={handlePrintPdf}
                  className="px-8 py-3 rounded-full bg-[#C9A227] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#E5C158] transition-all flex items-center gap-2 shadow-lg shadow-[#C9A227]/20"
                >
                  <Printer className="w-4 h-4" /> Save / Print PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
