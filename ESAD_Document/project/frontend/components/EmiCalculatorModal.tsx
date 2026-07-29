'use client'

import React, { useState } from 'react'
import { X, Calculator, DollarSign, Calendar, Percent } from 'lucide-react'

interface EmiCalculatorProps {
  isOpen: boolean
  onClose: () => void
  vehiclePrice?: number
}

export default function EmiCalculatorModal({ isOpen, onClose, vehiclePrice = 2450000 }: EmiCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [tenureYears, setTenureYears] = useState(5)
  const [interestRate, setInterestRate] = useState(3.49)

  if (!isOpen) return null

  const loanAmount = vehiclePrice * (1 - downPaymentPercent / 100)
  const totalMonths = tenureYears * 12
  const monthlyRate = interestRate / 100 / 12

  const emi =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-gold/40 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gold/10 border border-gold/30">
              <Calculator className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white">VIP Finance Calculator</h3>
              <span className="text-[10px] font-mono text-gold uppercase tracking-widest block">GCC Luxury Auto Loan Estimates</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gold transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between uppercase text-gray-400 mb-1">
              <span>Vehicle Price:</span>
              <span className="text-white font-bold">AED {vehiclePrice.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between uppercase text-gray-400 mb-1">
              <span>Down Payment ({downPaymentPercent}%):</span>
              <span className="text-gold font-bold">AED {(vehiclePrice * (downPaymentPercent / 100)).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-gold bg-obsidian rounded-lg cursor-pointer h-2 mt-1"
            />
          </div>

          <div>
            <div className="flex justify-between uppercase text-gray-400 mb-1">
              <span>Loan Tenure:</span>
              <span className="text-gold font-bold">{tenureYears} Years ({totalMonths} Months)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setTenureYears(y)}
                  className={`py-2 rounded-xl text-center border transition-all ${
                    tenureYears === y
                      ? 'bg-gold text-obsidian font-bold border-gold shadow-md'
                      : 'bg-obsidian border-white/10 text-gray-300 hover:border-gold'
                  }`}
                >
                  {y} Yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="p-6 rounded-2xl bg-obsidian border border-gold/30 text-center space-y-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Estimated Monthly Installment</span>
          <div className="text-3xl font-serif font-bold text-gold">
            AED {Math.round(emi).toLocaleString()} <span className="text-xs font-mono text-gray-400">/ month</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">*Subject to UAE bank approval & credit check.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-luxury-glow"
        >
          Apply for Financing
        </button>

      </div>
    </div>
  )
}
