import React from 'react'

export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-36 sm:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="w-64 h-10 bg-[#0A0A0A] border border-white/5 rounded animate-pulse"></div>
          <div className="flex gap-4">
            <div className="w-32 h-10 bg-[#0A0A0A] border border-white/5 rounded-full animate-pulse"></div>
            <div className="w-32 h-10 bg-[#0A0A0A] border border-white/5 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#0A0A0A] border border-white/5 overflow-hidden animate-pulse">
              <div className="h-64 bg-white/5 w-full"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="h-4 bg-white/5 rounded"></div>
                  <div className="h-4 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
