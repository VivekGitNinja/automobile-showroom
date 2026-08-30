'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Gauge, Cog, Palette, Sofa, FileText, Zap, Compass } from 'lucide-react'
import { Vehicle } from '../../../../lib/types'

interface SpecificationsGridProps {
  vehicle: Vehicle
}

interface SpecRow {
  label: string
  value: string | number | undefined | null
}

function SpecSection({
  title,
  icon: Icon,
  rows,
  index,
}: {
  title: string
  icon: React.ElementType
  rows: SpecRow[]
  index: number
}) {
  const validRows = rows.filter(r => r.value !== undefined && r.value !== null && r.value !== '')
  if (validRows.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-[#090909] border border-white/10 hover:border-[#C9A227]/40 transition-all duration-300 rounded-3xl p-8 shadow-xl group"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] font-bold">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {validRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-2.5 ${
              i < validRows.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              {row.label}
            </span>
            <span className="text-sm font-medium text-white text-right font-serif">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function SpecificationsGrid({ vehicle }: SpecificationsGridProps) {
  const specs = vehicle.specs || vehicle.specsJson || {}

  const performanceRows: SpecRow[] = [
    { label: '0–100 km/h', value: vehicle.acceleration || specs.acceleration },
    { label: '0–200 km/h', value: specs['0-200 km/h'] },
    { label: '0–300 km/h', value: specs['0-300 km/h'] },
    { label: 'Top Speed', value: vehicle.topSpeed || specs.topSpeed },
    { label: 'Power Output', value: vehicle.horsepower || specs.power },
    { label: 'Max Torque', value: vehicle.torque || specs.torque },
  ]

  const powertrainRows: SpecRow[] = [
    { label: 'Engine Architecture', value: vehicle.engine },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Drivetrain', value: vehicle.drivetrain || specs.drivetrain },
    { label: 'Fuel Octane Rating', value: vehicle.fuelType },
  ]

  const exteriorRows: SpecRow[] = [
    { label: 'Body Category', value: vehicle.bodyType },
    { label: 'Exterior Finish', value: vehicle.exteriorColor },
    { label: 'Aerodynamics', value: specs.aerodynamics },
    { label: 'Doors', value: vehicle.doors },
  ]

  const interiorRows: SpecRow[] = [
    { label: 'Cabin Upholstery', value: vehicle.interiorColor },
    { label: 'Seating Layout', value: specs.seats },
    { label: 'Roof Architecture', value: specs.roofArchitecture },
  ]

  const provenanceRows: SpecRow[] = [
    { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km' },
    {
      label: 'VIN Registration',
      value: vehicle.vin || 'Not specified',
    },
    {
      label: 'Stock Reference',
      value: vehicle.stockNumber || `APEX-${vehicle.id.slice(0, 8).toUpperCase()}`,
    },
    { label: 'Vehicle Condition', value: vehicle.mileage && Number(vehicle.mileage) === 0 ? 'Factory New' : '150-Point Certified Pre-Owned' },
    { label: 'GCC Compliance', value: 'Verified Dubai Customs Certified' },
  ]

  const sections = [
    { title: 'Performance Metrics', icon: Gauge, rows: performanceRows },
    { title: 'Powertrain & Mechanicals', icon: Cog, rows: powertrainRows },
    { title: 'Exterior & Aerodynamics', icon: Palette, rows: exteriorRows },
    { title: 'Interior & Craftsmanship', icon: Sofa, rows: interiorRows },
    { title: 'Ownership & Provenance', icon: FileText, rows: provenanceRows },
  ]

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5" /> Technical Excellence
        </span>
        <h2 className="text-3xl font-bold font-serif text-white">Full Engineering Specifications</h2>
      </div>

      {/* Top Visual Metric Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#080808] border border-[#C9A227]/30 p-6 rounded-2xl text-center shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
            Max Output
          </span>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-white">
            1,600 HP
          </div>
          <span className="text-[10px] font-mono text-white/40 block mt-1">W16 Quad-Turbo</span>
        </div>

        <div className="bg-[#080808] border border-[#C9A227]/30 p-6 rounded-2xl text-center shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
            Top Velocity
          </span>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-white">
            440 KM/H
          </div>
          <span className="text-[10px] font-mono text-white/40 block mt-1">Electronically Limited</span>
        </div>

        <div className="bg-[#080808] border border-[#C9A227]/30 p-6 rounded-2xl text-center shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
            Acceleration
          </span>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-white">
            2.4 SEC
          </div>
          <span className="text-[10px] font-mono text-white/40 block mt-1">0–100 km/h</span>
        </div>

        <div className="bg-[#080808] border border-[#C9A227]/30 p-6 rounded-2xl text-center shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-1">
            Peak Torque
          </span>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-white">
            1,600 NM
          </div>
          <span className="text-[10px] font-mono text-white/40 block mt-1">2,200–7,000 RPM</span>
        </div>
      </div>

      {/* Main Specifications 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <SpecSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            rows={section.rows}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
