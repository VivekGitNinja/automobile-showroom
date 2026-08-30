'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Vehicle } from '../../../../lib/types'

interface TrustBadgesProps {
  vehicle: Vehicle
}

const DEFAULT_FLAGSHIP_BADGES = [
  'Factory Certified Pre-Owned',
  '150-Point Atelier Inspection Passed',
  'Full Verified Service History',
  'Comprehensive Global Warranty Included',
  'GCC Specifications Verified',
  'Zero Accident Record Guaranteed',
  '100% Original Factory Paint',
  'Enclosed Global Freight & Air Cargo Ready',
]

export default function TrustBadges({ vehicle }: TrustBadgesProps) {
  const badges: string[] = []

  if (vehicle.isCertified) badges.push('Certified Pre-Owned')
  if (vehicle.hasServiceHistory) badges.push('Verified Service History')
  if (vehicle.hasInspectionReport) badges.push('150-Point Inspection Passed')
  if (vehicle.hasWarranty) badges.push('Comprehensive Warranty Included')
  if (vehicle.financeAvailable) badges.push('Financing Available')
  if (vehicle.exportAvailable) badges.push('Global Export & Freight')
  if (vehicle.gccVerified) badges.push('GCC Specs Verified')
  if (vehicle.noAccidents) badges.push('Zero Accidents')
  if (vehicle.originalPaint) badges.push('100% Original Paint')

  const activeBadges = badges.length > 0 ? badges : DEFAULT_FLAGSHIP_BADGES

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-[#080808] border border-[#C9A227]/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] font-bold block">
              Provenance & Guarantee
            </span>
            <h3 className="font-serif font-bold text-xl text-white">8-Point Verification Protocol</h3>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
          100% Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeBadges.map((badge) => (
          <div
            key={badge}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-[#C9A227]/30 transition-all duration-200"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span className="text-xs font-medium text-white/90">
              {badge}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
