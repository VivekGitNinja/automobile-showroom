'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VehicleCard from '../../components/VehicleCard'
import { Vehicle } from '../../lib/types'
import { fetchVehiclesFromApi } from '../../lib/api'
import { Search, SlidersHorizontal, RotateCcw, Loader2, ChevronLeft, ChevronRight, ArrowDownUp } from 'lucide-react'
import { useDebounce } from '../../lib/hooks'
import { API_BASE_URL } from '../../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonWidget from '../../components/ComparisonWidget'

function InventoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialMake = searchParams.get('make') || 'All'
  const initialBrand = searchParams.get('brand') || ''
  const initialSearch = searchParams.get('search') || ''
  const initialMaxPrice = Number(searchParams.get('maxPrice')) || 20000000
  const initialFuel = searchParams.get('fuel') || 'All'
  const initialTrans = searchParams.get('transmission') || 'All'
  const initialMinYear = Number(searchParams.get('minYear')) || 0
  const initialSort = searchParams.get('sort') || '-createdAt'
  const initialPage = Number(searchParams.get('page')) || 1

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState<number>(initialPage)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalVehicles, setTotalVehicles] = useState<number>(0)

  const [selectedMake, setSelectedMake] = useState<string>(initialMake)
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch)
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice)
  const [selectedFuel, setSelectedFuel] = useState<string>(initialFuel)
  const [selectedTransmission, setSelectedTransmission] = useState<string>(initialTrans)
  const [selectedMinYear, setSelectedMinYear] = useState<number>(initialMinYear)
  const [selectedSort, setSelectedSort] = useState<string>(initialSort)

  const debouncedSearch = useDebounce(searchQuery, 400)
  const debouncedMaxPrice = useDebounce(maxPrice, 400)

  // Marque buttons are driven by the live inventory, not a hardcoded list
  const [makes, setMakes] = useState<string[]>(['All'])

  useEffect(() => {
    fetch(`${API_BASE_URL}/vehicles/brands`)
      .then((res) => res.json())
      .then((res) => {
        const names = (res?.data || []).map((b: any) => b.name).filter(Boolean)
        if (names.length > 0) setMakes(['All', ...names])
      })
      .catch(() => {})
  }, [])

  const updateUrlParams = useCallback((newParams: Record<string, string | number>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    Object.entries(newParams).forEach(([key, val]) => {
      if (!val || val === 'All' || val === '' || (key === 'maxPrice' && Number(val) === 20000000) || (key === 'page' && Number(val) === 1)) {
        current.delete(key)
      } else {
        current.set(key, String(val))
      }
    })

    const search = current.toString()
    const queryStr = search ? `?${search}` : ''
    router.replace(`/inventory${queryStr}`, { scroll: false })
  }, [searchParams, router])

  useEffect(() => {
    setPage(1)
    updateUrlParams({ page: 1 })
  }, [selectedMake, selectedBrand, debouncedSearch, debouncedMaxPrice, selectedFuel, selectedTransmission, selectedMinYear, selectedSort, updateUrlParams])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchVehiclesFromApi({
      make: selectedBrand ? undefined : selectedMake,
      brand: selectedBrand || undefined,
      maxPrice: debouncedMaxPrice,
      fuelType: selectedFuel,
      transmission: selectedTransmission,
      minYear: selectedMinYear || undefined,
      search: debouncedSearch,
      sort: selectedSort,
      page: page,
      limit: 12
    })
      .then((response) => {
        if (isMounted) {
          setVehicles(response.data)
          setTotalPages(response.totalPages)
          setTotalVehicles(response.total)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to fetch vehicle inventory.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedMake, selectedBrand, debouncedMaxPrice, selectedFuel, selectedTransmission, selectedMinYear, debouncedSearch, selectedSort, page])

  const handleResetFilters = () => {
    setSelectedMake('All')
    setSelectedBrand('')
    setSearchQuery('')
    setMaxPrice(20000000)
    setSelectedFuel('All')
    setSelectedTransmission('All')
    setSelectedMinYear(0)
    setSelectedSort('-createdAt')
    setPage(1)
    router.replace('/inventory', { scroll: false })
  }

  return (
    <div className="pt-36 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Cinematic Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-4">
          The Pinnacle Collection
        </span>
        <h1 className="text-5xl sm:text-7xl font-serif font-extrabold text-white mb-6 tracking-tight">
          Exclusive <span className="italic font-light text-white/70">Inventory</span>
        </h1>
        <p className="text-sm text-[#A0A0A0] max-w-2xl mx-auto font-light leading-relaxed">
          Curating Dubai's finest hypercars and bespoke luxury motorcars. Use our enterprise search to find your next masterpiece.
        </p>
      </motion.div>

      {/* Advanced Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3 text-xs font-mono uppercase text-white font-bold tracking-widest">
            <SlidersHorizontal className="w-5 h-5 text-[#C9A227]" />
            <span>Enterprise Search & Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-mono uppercase text-[#A0A0A0] hover:text-[#C9A227] flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Active Brand Filter Chip */}
        {selectedBrand && (
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#C9A227] text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              Brand: {selectedBrand.replace(/-/g, ' ')}
              <button
                onClick={() => {
                  setSelectedBrand('')
                  updateUrlParams({ brand: '' })
                }}
                className="text-white/60 hover:text-white transition"
                aria-label="Clear brand filter"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Marque Quick Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-2 scrollbar-none snap-x">
          {makes.map((make) => (
            <button
              key={make}
              onClick={() => {
                setSelectedMake(make)
                setSelectedBrand('')
                updateUrlParams({ make, brand: '' })
              }}
              className={`snap-center px-6 py-3 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all duration-300 whitespace-nowrap border hover:-translate-y-1 ${
                selectedMake === make
                  ? 'bg-gradient-to-r from-[#C9A227]/20 to-black text-[#C9A227] border-[#C9A227] shadow-[0_0_20px_rgba(201,162,39,0.2)] font-bold'
                  : 'bg-black text-[#A0A0A0] hover:text-white border-white/10 hover:border-white/30'
              }`}
            >
              {make}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 text-[10px] font-mono tracking-widest">
          {/* Keyword Search */}
          <div className="lg:col-span-2">
            <label className="block uppercase text-[#7A7A7A] mb-2">Search Query</label>
            <div className="relative group">
              <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#C9A227] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  updateUrlParams({ search: e.target.value })
                }}
                placeholder="Make, model, or feature..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              />
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex justify-between uppercase text-[#7A7A7A] mb-2">
              <span>Max Price</span>
              <span className="text-[#C9A227] font-bold">AED {(maxPrice / 1000000).toFixed(1)}M</span>
            </div>
            <div className="relative pt-3">
              <input
                type="range"
                min={1000000}
                max={20000000}
                step={500000}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setMaxPrice(val)
                  updateUrlParams({ maxPrice: val })
                }}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none slider-thumb-premium"
                style={{
                  background: `linear-gradient(to right, #C9A227 ${((maxPrice - 1000000) / 19000000) * 100}%, rgba(255,255,255,0.1) ${((maxPrice - 1000000) / 19000000) * 100}%)`
                }}
              />
              <style jsx>{`
                .slider-thumb-premium::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #C9A227;
                  cursor: pointer;
                  box-shadow: 0 0 10px rgba(201,162,39,0.5);
                  transition: transform 0.2s;
                }
                .slider-thumb-premium::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                }
              `}</style>
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block uppercase text-[#7A7A7A] mb-2">Fuel Type</label>
            <div className="relative">
              <select
                value={selectedFuel}
                onChange={(e) => {
                  setSelectedFuel(e.target.value)
                  updateUrlParams({ fuel: e.target.value })
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="petrol">Petrol (V8/V12/W16)</option>
                <option value="hybrid">PHEV / Hybrid</option>
                <option value="electric">Electric (EV)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block uppercase text-[#7A7A7A] mb-2">Transmission</label>
            <div className="relative">
              <select
                value={selectedTransmission}
                onChange={(e) => {
                  setSelectedTransmission(e.target.value)
                  updateUrlParams({ transmission: e.target.value })
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Transmissions</option>
                <option value="automatic">Automatic</option>
                <option value="dual-clutch">Dual-Clutch / F1</option>
                <option value="manual">Manual (Collector)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
            </div>
          </div>
          
          {/* Year (Min) */}
          <div>
            <label className="block uppercase text-[#7A7A7A] mb-2">Year From</label>
            <div className="relative">
              <select
                value={selectedMinYear || 'All'}
                onChange={(e) => {
                  const val = e.target.value === 'All' ? 0 : Number(e.target.value)
                  setSelectedMinYear(val)
                  updateUrlParams({ minYear: val })
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all appearance-none cursor-pointer"
              >
                <option value="All">Any Year</option>
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                  <option key={y} value={y}>{y} or newer</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block uppercase text-[#7A7A7A] mb-2">Sort By</label>
            <div className="relative">
              <ArrowDownUp className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value)
                  updateUrlParams({ sort: e.target.value })
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all appearance-none cursor-pointer"
              >
                <option value="-createdAt">Newest Added</option>
                <option value="-price">Price: High to Low</option>
                <option value="price">Price: Low to High</option>
                <option value="-year">Year: Newest</option>
                <option value="year">Year: Oldest</option>
                <option value="mileage">Mileage: Lowest</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading / Error / Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-[#0A0A0A]/50 border border-white/5 overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-sweep z-10" />
                  <div className="w-full h-[300px] bg-white/5" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-3 w-1/3 bg-white/10 rounded" />
                      <div className="h-3 w-1/4 bg-white/10 rounded" />
                    </div>
                    <div className="h-6 w-2/3 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-[#C9A227]/20 rounded" />
                    <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                      <div className="h-8 bg-white/5 rounded-xl" />
                      <div className="h-8 bg-white/5 rounded-xl" />
                      <div className="h-8 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <style jsx>{`
              @keyframes sweep {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .skeleton-sweep {
                animation: sweep 2s infinite linear;
              }
            `}</style>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-32 space-y-6"
          >
            <p className="text-2xl font-serif text-red-500">{error}</p>
            <button
              onClick={handleResetFilters}
              className="px-8 py-3 rounded-full bg-white text-black font-mono font-bold text-[10px] uppercase tracking-widest"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : vehicles.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-[0.2em]">
                Displaying <span className="text-white font-bold">{vehicles.length}</span> of <span className="text-white font-bold">{totalVehicles}</span> Masterpieces
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {vehicles.map((vehicle, i) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-16 pt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const newPage = page - 1
                    setPage(newPage)
                    updateUrlParams({ page: newPage })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white transition-colors duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">
                  Page <span className="text-white font-bold text-sm mx-1">{page}</span> of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    const newPage = page + 1
                    setPage(newPage)
                    updateUrlParams({ page: newPage })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white transition-colors duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center py-40 glass-panel rounded-3xl border border-white/10"
          >
            <Search className="w-12 h-12 text-[#C9A227] mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-serif text-white mb-4">No Masterpieces Found</h3>
            <p className="text-sm text-[#A0A0A0] mb-8 font-light max-w-md mx-auto">
              Our collection is highly curated. Try broadening your search parameters or explore our entire inventory.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-8 py-3.5 rounded-full bg-white text-black font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-[#C9A227] transition-colors duration-300"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <ComparisonWidget />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] space-y-6">
        <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#7A7A7A]">
          Initializing Showroom...
        </span>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  )
}
