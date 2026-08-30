'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, Package, X } from 'lucide-react'
import { Part, PartCategory } from '../../../lib/types'
import { API_BASE_URL } from '../../../lib/api'

const EMPTY_FORM = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  brandName: '',
  compatibleMakes: '',
  condition: 'NEW',
  price: '',
  currency: 'AED',
  stockQty: '0',
  imageUrl: '',
  status: 'DRAFT',
}

export default function PartsManager() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Part | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parts/admin/all?limit=200`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parts/categories`),
      ])
      if (pRes.ok) setParts((await pRes.json()).data || [])
      if (cRes.ok) setCategories((await cRes.json()).data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (part: Part) => {
    setEditing(part)
    setForm({
      name: part.name,
      sku: part.sku,
      description: part.description || '',
      categoryId: part.categoryId || '',
      brandName: part.brandName || '',
      compatibleMakes: Array.isArray(part.compatibleMakes) ? part.compatibleMakes.join(', ') : '',
      condition: part.condition,
      price: String(part.price),
      currency: part.currency || 'AED',
      stockQty: String(part.stockQty),
      imageUrl: part.imageUrl || '',
      status: part.status || 'DRAFT',
    })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description || null,
        categoryId: form.categoryId || null,
        brandName: form.brandName || null,
        compatibleMakes: form.compatibleMakes
          ? form.compatibleMakes.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        condition: form.condition,
        price: Number(form.price) || 0,
        currency: form.currency || 'AED',
        stockQty: Number(form.stockQty) || 0,
        imageUrl: form.imageUrl || null,
        status: form.status,
      }
      const res = editing
        ? await fetch(`${API_BASE_URL}/parts/${editing.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) })
        : await fetch(`${API_BASE_URL}/parts`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) })
      if (res.ok) {
        setModalOpen(false)
        fetchData()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (part: Part) => {
    if (!confirm(`Delete "${part.name}" (${part.sku})? This cannot be undone.`)) return
    const res = await fetch(`${API_BASE_URL}/parts/${part.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
    if (res.ok) fetchData()
    else alert('Delete failed — the part may not exist.')
  }

  return (
    <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
            <Package className="w-6 h-6 text-[#C9A227]" />
            Spare Parts Catalogue
          </h3>
          <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mt-1">
            {parts.length} components · staff-managed, no code changes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="h-12 px-6 rounded-full bg-[#C9A227] text-black hover:bg-white font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-[#7A7A7A] uppercase tracking-widest border-b border-white/5 text-[9px]">
              <tr>
                <th className="p-5">Part / SKU</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Status</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parts.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#7A7A7A]">No parts yet — add your first component.</td></tr>
              ) : parts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-5">
                    <div className="font-serif font-bold text-white text-sm">{p.name}</div>
                    <div className="text-[10px] text-[#7A7A7A] mt-1">{p.sku} · {p.condition}</div>
                  </td>
                  <td className="p-5 text-[#A0A0A0]">{p.category?.name || '—'}</td>
                  <td className="p-5 text-[#C9A227] font-bold">{p.currency} {Number(p.price).toLocaleString()}</td>
                  <td className="p-5 text-white">{p.stockQty}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${
                      p.status === 'PUBLISHED' ? 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30'
                      : p.status === 'ARCHIVED' ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-white/5 text-white/50 border-white/20'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0A0A0A] border border-[#C9A227]/30 p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-serif font-bold text-white">{editing ? 'Edit Part' : 'New Part'}</h4>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">{error}</div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <input required placeholder="Part name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input required placeholder="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-[#C9A227] focus:outline-none">
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input placeholder="Price (AED)" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input placeholder="Stock quantity" type="number" min="0" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input placeholder="Brand (e.g. Brembo)" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-[#C9A227] focus:outline-none">
                <option value="NEW">New</option>
                <option value="REFURBISHED">Refurbished</option>
                <option value="USED">Used</option>
              </select>
              <input placeholder="Compatible makes (comma-separated)" value={form.compatibleMakes} onChange={(e) => setForm({ ...form, compatibleMakes: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none resize-none" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-[#C9A227] focus:outline-none">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button type="submit" disabled={saving}
                className="h-12 rounded-xl bg-[#C9A227] text-black font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Part'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
