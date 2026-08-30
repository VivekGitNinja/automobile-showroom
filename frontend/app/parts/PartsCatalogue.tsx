'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, Package, ChevronLeft, ChevronRight, Wrench, ArrowDownUp } from 'lucide-react'
import { Part, PartCategory } from '../../lib/types'
import { fetchPartsFromApi } from '../../lib/api'
import { useDebounce } from '../../lib/hooks'

export default function PartsCatalogue({ categories }: { categories: PartCategory[] }) {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('displayOrder')
  const [condition, setCondition] = useState('all')

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setPage(1)
  }, [category, debouncedSearch, sort, condition])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchPartsFromApi({
      category,
      search: debouncedSearch,
      sort,
      condition,
      page,
      limit: 12,
    })
      .then((res) => {
        if (isMounted) {
          setParts(res.data)
          setTotalPages(res.totalPages)
          setTotal(res.total)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [category, debouncedSearch, sort, condition, page])

  return (
    <>
      {/* Category chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => setCategory('all')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap border hover:-translate-y-0.5 ${
            category === 'all'
              ? 'bg-gradient-to-r from-[#C9A227]/20 to-black text-[#C9A227] border-[#C9A227] font-bold'
              : 'bg-black text-[#A0A0A0] hover:text-white border-white/10'
          }`}
        >
          All Parts
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap border hover:-translate-y-0.5 ${
              category === c.slug
                ? 'bg-gradient-to-r from-[#C9A227]/20 to-black text-[#C9A227] border-[#C9A227] font-bold'
                : 'bg-black text-[#A0A0A0] hover:text-white border-white/10'
            }`}
          >
            {c.name} {typeof c.count === 'number' ? `(${c.count})` : ''}
          </button>
        ))}
      </div>

      {/* Search + sort bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-[10px] font-mono tracking-widest">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part name, SKU or brand…"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] appearance-none cursor-pointer"
          >
            <option value="all">All Condition</option>
            <option value="NEW">New</option>
            <option value="REFURBISHED">Refurbished</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C9A227] appearance-none cursor-pointer"
          >
            <option value="displayOrder">Curated</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <div className="mb-8 border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-[0.2em]">
          <span className="text-white font-bold">{total}</span> Components Available
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#7A7A7A]">Loading Components…</span>
        </div>
      ) : parts.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-white/10 bg-[#0A0A0A]/60">
          <Package className="w-10 h-10 text-[#C9A227]/50 mx-auto mb-6" />
          <h3 className="text-xl font-serif text-white mb-3">No parts match your search</h3>
          <p className="text-xs text-[#7A7A7A] font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Our parts desk can special-order components directly from factory channels — ask the concierge on WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {parts.map((part) => (
            <Link
              key={part.id}
              href={`/parts/${part.slug}`}
              className="group rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#C9A227]/50 overflow-hidden transition-all hover:-translate-y-1"
            >
              <div className="relative h-52 bg-[#060606] border-b border-white/5 overflow-hidden">
                {part.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A227]/40 group-hover:text-[#C9A227]/70 transition-colors">
                    <Wrench className="w-12 h-12 mb-3" strokeWidth={1} />
                    <span className="text-[8px] font-mono uppercase tracking-[0.3em]">Imagery on request</span>
                  </div>
                )}
                <span className={`absolute top-4 right-4 text-[8px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md ${
                  part.condition === 'NEW'
                    ? 'text-[#3DD598] border-[#3DD598]/30 bg-[#3DD598]/10'
                    : 'text-[#C9A227] border-[#C9A227]/30 bg-[#C9A227]/10'
                }`}>
                  {part.condition}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-[#7A7A7A] uppercase tracking-widest">{part.sku}</span>
                  {part.category && (
                    <span className="text-[9px] font-mono text-[#7A7A7A] uppercase tracking-widest">{part.category.name}</span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#C9A227] transition-colors leading-snug mb-2">
                  {part.name}
                </h3>
                {part.brandName && (
                  <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mb-4">by {part.brandName}</p>
                )}
                <div className="flex items-end justify-between pt-4 border-t border-white/5">
                  <span className="text-[#C9A227] font-mono font-bold text-lg">
                    {part.currency} {Number(part.price).toLocaleString()}
                  </span>
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${part.stockQty > 0 ? 'text-[#3DD598]' : 'text-[#7A7A7A]'}`}>
                    {part.stockQty > 0 ? `In stock (${part.stockQty})` : 'Made to order'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8">
          <button
            disabled={page <= 1}
            onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">
            Page <span className="text-white font-bold text-sm mx-1">{page}</span> of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  )
}
