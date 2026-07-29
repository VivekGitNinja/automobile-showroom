'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash, MessageSquare, Loader2, X } from 'lucide-react'
import { FaqCategory, FaqItem } from '../../../lib/types'
import { API_BASE_URL } from '../../../lib/api'

export default function FAQAdminPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null)
  const [editingFaq, setEditingFaq] = useState<{ item: FaqItem, categoryId: string } | null>(null)
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')

  // Form states
  const [categoryForm, setCategoryForm] = useState({ label: '', slug: '', displayOrder: 0 })
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', displayOrder: 0 })

  const getToken = () => localStorage.getItem('adminToken') || ''

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/faqs`)
      const data = await res.json()
      if (data.data) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error(err)
      showFeedback('Failed to fetch FAQs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCategory 
        ? `${API_BASE_URL}/faq-categories/${editingCategory.id}`
        : `${API_BASE_URL}/faq-categories`
      const method = editingCategory ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(categoryForm)
      })

      if (!res.ok) throw new Error('API failed')
      
      showFeedback(`Category ${editingCategory ? 'updated' : 'created'} successfully`, 'success')
      setIsCategoryModalOpen(false)
      fetchFaqs()
    } catch (err) {
      showFeedback('Operation failed. Check auth token.', 'error')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All related FAQs will be lost.')) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/faq-categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (!res.ok) throw new Error('API failed')
      
      showFeedback('Category deleted successfully', 'success')
      fetchFaqs()
    } catch (err) {
      showFeedback('Failed to delete category', 'error')
    }
  }

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingFaq 
        ? `${API_BASE_URL}/faqs/${editingFaq.item.id}`
        : `${API_BASE_URL}/faqs`
      const method = editingFaq ? 'PUT' : 'POST'
      
      const payload = {
        ...faqForm,
        categoryId: editingFaq ? editingFaq.categoryId : targetCategoryId
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('API failed')
      
      showFeedback(`FAQ ${editingFaq ? 'updated' : 'created'} successfully`, 'success')
      setIsFaqModalOpen(false)
      fetchFaqs()
    } catch (err) {
      showFeedback('Operation failed', 'error')
    }
  }

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (!res.ok) throw new Error('API failed')
      
      showFeedback('FAQ deleted successfully', 'success')
      fetchFaqs()
    } catch (err) {
      showFeedback('Failed to delete FAQ', 'error')
    }
  }

  const openAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({ label: '', slug: '', displayOrder: 0 })
    setIsCategoryModalOpen(true)
  }

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat)
    setCategoryForm({ label: cat.label, slug: cat.slug || '', displayOrder: cat.displayOrder || 0 })
    setIsCategoryModalOpen(true)
  }

  const openAddFaq = (categoryId: string) => {
    setEditingFaq(null)
    setTargetCategoryId(categoryId)
    setFaqForm({ question: '', answer: '', displayOrder: 0 })
    setIsFaqModalOpen(true)
  }

  const openEditFaq = (faq: any, categoryId: string) => {
    setEditingFaq({ item: faq, categoryId })
    setTargetCategoryId(categoryId)
    setFaqForm({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder || 0 })
    setIsFaqModalOpen(true)
  }

  return (
    <div className="pt-36 sm:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {feedback && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-mono z-50 shadow-2xl ${
          feedback.type === 'success' ? 'bg-[#3DD598]/20 text-[#3DD598] border border-[#3DD598]/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A227] block mb-1">
            Showroom CMS Admin Panel
          </span>
          <h1 className="text-3xl font-serif font-bold text-white">FAQ Chatbot Content</h1>
        </div>
        <button onClick={openAddCategory} className="px-5 py-2.5 rounded-full bg-[#C9A227] text-[#0A0A0A] hover:bg-[#D4AF37] text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-gold-glow">
          <Plus className="w-4 h-4" />
          <span>Add FAQ Category</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat: any) => (
            <div key={cat.id} className="glass-panel rounded-3xl border border-[#2A2A2A] overflow-hidden shadow-2xl">
              <div className="p-4 bg-[#0E0E0E] border-b border-[#2A2A2A] flex justify-between items-center">
                <h2 className="text-lg font-serif font-bold text-white">{cat.label}</h2>
                <div className="flex gap-2 text-[#A0A0A0]">
                  <button onClick={() => openEditCategory(cat)} className="p-2 hover:text-[#C9A227] transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:text-red-500 transition"><Trash className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4 bg-[#050505]">
                {cat.faqs?.map((faq: any) => (
                  <div key={faq.id} className="mb-4 border border-[rgba(255,255,255,0.05)] rounded-xl p-4 bg-[#111111]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white font-serif">{faq.question}</h4>
                      <div className="flex gap-2 text-[#A0A0A0]">
                        <button onClick={() => openEditFaq(faq, cat.id)} className="p-1 hover:text-[#C9A227] transition"><Edit className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteFaq(faq.id)} className="p-1 hover:text-red-500 transition"><Trash className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
                <button onClick={() => openAddFaq(cat.id)} className="w-full py-3 rounded-xl border border-dashed border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A227] hover:text-[#C9A227] transition flex items-center justify-center gap-2 text-xs font-mono uppercase">
                  <Plus className="w-3 h-3" />
                  <span>Add FAQ to {cat.label}</span>
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center p-12 text-[#7A7A7A] font-mono text-sm border border-dashed border-[#2A2A2A] rounded-3xl">
              No FAQ categories found. Add one to get started.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 w-full max-w-md relative">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 text-[#7A7A7A] hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-serif font-bold text-white mb-6">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Label</label>
                <input required value={categoryForm.label} onChange={e => setCategoryForm({...categoryForm, label: e.target.value})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Slug</label>
                <input required value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Display Order</label>
                <input type="number" value={categoryForm.displayOrder} onChange={e => setCategoryForm({...categoryForm, displayOrder: parseInt(e.target.value) || 0})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#C9A227] text-black font-mono font-bold uppercase text-xs mt-4">Save Category</button>
            </form>
          </div>
        </div>
      )}

      {isFaqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 w-full max-w-lg relative">
            <button onClick={() => setIsFaqModalOpen(false)} className="absolute top-4 right-4 text-[#7A7A7A] hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-serif font-bold text-white mb-6">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Question</label>
                <input required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Answer</label>
                <textarea required rows={4} value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#7A7A7A] mb-1">Display Order</label>
                <input type="number" value={faqForm.displayOrder} onChange={e => setFaqForm({...faqForm, displayOrder: parseInt(e.target.value) || 0})} className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A227]" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#C9A227] text-black font-mono font-bold uppercase text-xs mt-4">Save FAQ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
