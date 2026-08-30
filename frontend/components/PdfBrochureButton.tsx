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
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

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
      flex-col;
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

    .cert-badge {
      border: 1px solid #C9A227;
      padding: 6px 16px;
      border-radius: 100px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #C9A227;
      letter-spacing: 2px;
      text-transform: uppercase;
      background: rgba(201, 162, 39, 0.05);
    }

    .hero-container {
      position: relative;
      height: 105mm;
      margin-top: 8mm;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #060606 0%, transparent 70%);
    }

    .cover-title-area {
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .title-main {
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 700;
      color: #FFF;
      line-height: 1.1;
    }

    .price-main {
      font-family: 'JetBrains Mono', monospace;
      font-size: 30px;
      font-weight: 700;
      color: #C9A227;
    }

    /* Page 2: Specs & Metrics */
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 700;
      color: #C9A227;
      letter-spacing: 2px;
      margin-bottom: 6mm;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 8mm;
    }

    .metric-card {
      background: #0E0E0E;
      border: 1px solid rgba(201, 162, 39, 0.3);
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 700;
      color: #FFF;
    }

    .metric-lbl {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #C9A227;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 4px;
    }

    .specs-table {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .spec-row {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 18px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .spec-lbl {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .spec-val {
      font-size: 12px;
      font-weight: 600;
      color: #FFF;
    }

    .two-col-images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      height: 75mm;
      margin-top: 6mm;
    }

    .detail-img-box {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }

    .detail-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(201, 162, 39, 0.2);
      padding-top: 4mm;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #666;
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
        <div class="sub-mark">Dubai · Sheikh Zayed Road Flagship Atelier</div>
      </div>
      <div class="cert-badge">Official Certificate of Provenance</div>
    </div>

    <div class="hero-container">
      <img src="${heroImage}" class="hero-img" alt="${vehicle.make} ${vehicle.model}">
      <div class="hero-overlay"></div>
    </div>

    <div class="cover-title-area">
      <div>
        <div class="sub-mark" style="color: #C9A227; margin-bottom: 6px;">Bespoke Specification Document</div>
        <div class="title-main">${vehicle.year} ${vehicle.make}<br>${vehicle.model}</div>
        <div class="sub-mark" style="margin-top: 8px;">VIN: ${vehicle.vin || 'Not specified'} · GCC CERTIFIED</div>
      </div>
      <div style="text-align: right;">
        <div class="sub-mark" style="margin-bottom: 4px;">Asking Showroom Price</div>
        <div class="price-main">${formattedPrice}</div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Apex Concierge Desk: +971 50 891 9441 · concierge@apexluxuryautomobiles.com</div>
      <div>Document Ref: APEX-SPEC-${Date.now().toString().slice(-6)}</div>
    </div>
  </div>

  <!-- PAGE 2: ENGINEERING & SPECIFICATIONS -->
  <div class="page">
    <div class="gold-border-frame"></div>
    <div class="header-logo">
      <div class="brand-mark" style="font-size: 18px;">APEX AUTOMOBILI</div>
      <div class="sub-mark">Technical Specification Matrix</div>
    </div>

    <div style="margin-top: 4mm;">
      <div class="section-title">Engineering & Performance Metric</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-val">1,600 HP</div>
          <div class="metric-lbl">Powertrain</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">440 KM/H</div>
          <div class="metric-lbl">Top Speed</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">2.4 SEC</div>
          <div class="metric-lbl">0-100 KM/H</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">1,600 NM</div>
          <div class="metric-lbl">Peak Torque</div>
        </div>
      </div>

      <div class="section-title" style="margin-top: 4mm;">Vehicle Configuration</div>
      <div class="specs-table">
        <div class="spec-row"><span class="spec-lbl">Engine Architecture</span><span class="spec-val">${vehicle.engine || '8.0L W16 Quad-Turbo'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Transmission</span><span class="spec-val">${vehicle.transmission || '7-Speed Dual-Clutch'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Current Odometer</span><span class="spec-val">${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : '0 km'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Fuel Type</span><span class="spec-val">${vehicle.fuelType || 'High-Octane Super 98'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Exterior Paint</span><span class="spec-val">${vehicle.exteriorColor || 'Liquid Silver / Clear Carbon'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Interior Upholstery</span><span class="spec-val">${vehicle.interiorColor || 'Beluga Black Alcantara & Gold'}</span></div>
        <div class="spec-row"><span class="spec-lbl">Chassis Type</span><span class="spec-val">Carbon Monocoque (50,000 Nm/deg)</span></div>
        <div class="spec-row"><span class="spec-lbl">Brake System</span><span class="spec-val">420mm Carbon-Ceramic Discs</span></div>
      </div>

      <div class="two-col-images">
        <div class="detail-img-box"><img src="${engineImage}" alt="Engine"></div>
        <div class="detail-img-box"><img src="${interiorImage}" alt="Interior"></div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Verified by Apex Atelier Inspection Protocol · 150-Point Factory Guarantee</div>
      <div>Page 2 of 2</div>
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

    printWindow.document.write(htmlContent)
    printWindow.document.close()
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
