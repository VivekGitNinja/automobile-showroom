import React from 'react'

export default function BrandsLoading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-36 sm:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center space-y-4">
           <div className="h-10 w-48 bg-[#0A0A0A] border border-white/5 rounded animate-pulse"></div>
           <div className="h-4 w-64 bg-[#0A0A0A] border border-white/5 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#0A0A0A] border border-white/5 aspect-[4/3] flex flex-col items-center justify-center p-8 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-white/5 mb-6"></div>
              <div className="h-6 w-32 bg-white/10 rounded mb-3"></div>
              <div className="h-4 w-24 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
