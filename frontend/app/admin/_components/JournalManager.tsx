'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, BookOpen, X } from 'lucide-react'
import { Journal } from '../../../lib/types'
import { API_BASE_URL } from '../../../lib/api'

const EMPTY_FORM = {
  title: '',
  category: '',
  snippet: '',
  content: '',
  imageUrl: '',
  readTime: '5 min read',
  status: 'DRAFT',
}

export default function JournalManager() {
  const [posts, setPosts] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Journal | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  })

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journals`, { headers: authHeaders() })
      if (res.ok) setPosts((await res.json()).data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (post: Journal) => {
    setEditing(post)
    setForm({
      title: post.title,
      category: post.category,
      snippet: post.snippet,
      content: post.content || '',
      imageUrl: post.imageUrl,
      readTime: post.readTime,
      status: post.status || 'DRAFT',
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
        title: form.title,
        category: form.category,
        snippet: form.snippet,
        content: form.content || undefined,
        imageUrl: form.imageUrl,
        readTime: form.readTime || '5 min read',
        status: form.status,
      }
      const res = editing
        ? await fetch(`${API_BASE_URL}/admin/journals/${editing.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) })
        : await fetch(`${API_BASE_URL}/admin/journals`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) })
      if (res.ok) {
        setModalOpen(false)
        fetchPosts()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: Journal) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    const res = await fetch(`${API_BASE_URL}/admin/journals/${post.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    })
    if (res.ok) fetchPosts()
    else alert('Delete failed.')
  }

  return (
    <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#C9A227]" />
            Journal Articles
          </h3>
          <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mt-1">
            {posts.length} posts · published instantly to the public journal
          </p>
        </div>
        <button
          onClick={openCreate}
          className="h-12 px-6 rounded-full bg-[#C9A227] text-black hover:bg-white font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
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
                <th className="p-5">Article</th>
                <th className="p-5">Category</th>
                <th className="p-5">Status</th>
                <th className="p-5">Published</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#7A7A7A]">No articles yet — write your first story.</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02]">
                  <td className="p-5">
                    <div className="font-serif font-bold text-white text-sm">{post.title}</div>
                    <div className="text-[10px] text-[#7A7A7A] mt-1">/blog/{post.slug}</div>
                  </td>
                  <td className="p-5 text-[#A0A0A0]">{post.category}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${
                      post.status === 'PUBLISHED' ? 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30' : 'bg-white/5 text-white/50 border-white/20'
                    }`}>{post.status}</span>
                  </td>
                  <td className="p-5 text-[#A0A0A0]">{new Date(post.publishedAt).toLocaleDateString()}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(post)} className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30" title="Delete">
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
              <h4 className="text-xl font-serif font-bold text-white">{editing ? 'Edit Article' : 'New Article'}</h4>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">{error}</div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input required placeholder="Category (e.g. Intelligence)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input placeholder="Read time (e.g. 5 min read)" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <input required placeholder="Hero image URL *" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none" />
              <textarea required rows={2} placeholder="Teaser snippet * (shown on cards & meta descriptions)" value={form.snippet} onChange={(e) => setForm({ ...form, snippet: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none resize-none" />
              <textarea rows={7} placeholder="Full article body (blank lines separate paragraphs)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:border-[#C9A227] focus:outline-none resize-none" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-[#C9A227] focus:outline-none">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <button type="submit" disabled={saving}
                className="h-12 rounded-xl bg-[#C9A227] text-black font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
