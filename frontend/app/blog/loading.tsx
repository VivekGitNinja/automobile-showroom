import React from 'react'

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-36 sm:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center space-y-4">
           <div className="h-10 w-64 bg-[#0A0A0A] border border-white/5 rounded animate-pulse"></div>
           <div className="h-4 w-80 bg-[#0A0A0A] border border-white/5 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#0A0A0A] border border-white/5 overflow-hidden animate-pulse">
              <div className="aspect-video bg-white/5 w-full"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-[#C9A227]/20 rounded w-24 mb-2"></div>
                <div className="h-8 bg-white/10 rounded w-full"></div>
                <div className="h-8 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-full mt-4"></div>
                <div className="h-4 bg-white/5 rounded w-full"></div>
                <div className="h-4 bg-white/5 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
