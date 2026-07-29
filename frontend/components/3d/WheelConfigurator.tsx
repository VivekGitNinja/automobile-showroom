'use client'

import React, { useState } from 'react'
import { Disc, Sparkles, Check } from 'lucide-react'

export default function WheelConfigurator() {
  const wheels = [
    { id: 'diamond', name: '21" Diamond-Cut Dual-Tone Alloy', finish: 'Polished Billet', weight: '-4.2 kg per wheel', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'carbon', name: '22" Forged Carbon Fiber Weave', finish: 'Gloss Clearcoat', weight: '-8.5 kg per wheel', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'gold', name: '21" Satin Champagne Gold Lightweight', finish: 'Anodized Gold', weight: '-5.0 kg per wheel', image: '/images/dynamic/bugatti_exterior.jpg' },
    { id: 'titanium', name: '22" Dark Titanium Monobloc', finish: 'Matte Titanium', weight: '-6.8 kg per wheel', image: '/images/dynamic/bugatti_exterior.jpg' },
  ]

  const [selectedWheel, setSelectedWheel] = useState(wheels[0])

  return (
    <div className="w-full glass-panel border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-gold mb-1">
            <Disc className="w-4 h-4" />
            <span>Bespoke Wheel Configurator</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">Alloy & Carbon Wheel Rims</h3>
        </div>
        <span className="text-xs font-mono text-gray-400">Spec: {selectedWheel.finish}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Wheel Rim Preview Image */}
        <div className="lg:col-span-6 relative h-72 rounded-2xl overflow-hidden border border-gold/30 bg-dark shadow-xl">
          {/* ENGINEERING JUSTIFICATION: Dynamic CMS/CDN image URLs cannot be statically configured in next.config.js remotePatterns */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedWheel.image}
            alt={selectedWheel.name}
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-dark/90 backdrop-blur-md border border-gold/30 flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold">{selectedWheel.name}</span>
            <span className="text-gold font-bold">{selectedWheel.weight}</span>
          </div>
        </div>

        {/* Wheel Options Picker */}
        <div className="lg:col-span-6 space-y-3">
          <label className="block text-xs font-mono uppercase tracking-widest text-gold mb-2">Select Wheel Specification:</label>
          {wheels.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWheel(w)}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                selectedWheel.id === w.id
                  ? 'bg-gold/15 border-gold shadow-lg shadow-gold/20 text-white'
                  : 'bg-dark/60 border-dark-border text-gray-300 hover:border-gold/50'
              }`}
            >
              <div>
                <span className="font-serif font-bold text-sm block">{w.name}</span>
                <span className="text-[10px] font-mono text-gray-400">{w.finish} • Weight reduction: {w.weight}</span>
              </div>
              {selectedWheel.id === w.id && (
                <div className="w-6 h-6 rounded-full bg-gold text-dark flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
