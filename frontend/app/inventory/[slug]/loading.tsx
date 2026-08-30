import React from 'react'

export default function VehicleDetailLoading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-36 sm:pt-40 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Skeleton */}
          <div className="w-full lg:w-2/3 space-y-8">
            <div className="aspect-video w-full bg-[#0A0A0A] border border-white/5 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="aspect-video bg-[#0A0A0A] border border-white/5 rounded-xl animate-pulse"></div>
               ))}
            </div>
          </div>

          {/* Sidebar / Specs Skeleton */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="rounded-2xl bg-[#0A0A0A] border border-white/5 p-8 animate-pulse">
              <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-white/10 rounded w-1/2 mb-8"></div>
              
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <div className="h-4 bg-white/5 rounded w-1/3"></div>
                    <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 h-14 bg-white/5 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
