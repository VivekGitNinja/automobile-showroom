'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Users, Search, Filter, Phone, Mail, Clock, CheckCircle, XCircle, ArrowRight, Download } from 'lucide-react'
import { API_BASE_URL } from '../../../lib/api'

export default function LeadsViewer() {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchLeads()
  }, [filterType])

  const fetchLeads = async () => {
    setLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      const url = filterType === 'all' 
        ? `${API_BASE_URL}/admin/leads` 
        : `${API_BASE_URL}/admin/leads?leadType=${filterType}`
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setLeads(data.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leads/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchLeads()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'contacted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'qualified': return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'converted': return 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30'
      case 'lost': return 'bg-red-500/10 text-red-500 border-red-500/30'
      default: return 'bg-white/5 text-white/50 border-white/10'
    }
  }

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Vehicle', 'Message', 'Date']
    const rows = leads.map(lead => [
      lead.fullName,
      lead.email,
      `${lead.countryCode || ''} ${lead.phone || ''}`.trim(),
      lead.leadType,
      lead.status,
      lead.vehicle ? `${lead.vehicle.make} ${lead.vehicle.model}` : '',
      lead.message || '',
      new Date(lead.createdAt).toLocaleDateString()
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `leads_export_${dateStr}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-[#C9A227]" />
              Captured Prospects
            </h3>
            <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest mt-1">Manage Sales Pipeline & Enquiries</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-black border border-white/10 rounded-full p-1">
              {['all', 'enquiry', 'booking', 'sell_car'].map(type => (
                <button 
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${filterType === type ? 'bg-[#C9A227] text-black font-bold' : 'text-[#7A7A7A] hover:text-white'}`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[#7A7A7A] hover:text-white transition-colors text-[9px] font-mono uppercase tracking-[0.2em]"
            >
              <Download className="w-3 h-3" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">Loading Pipeline Data...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-[#7A7A7A] uppercase tracking-[0.2em] border-b border-white/5 text-[9px]">
                <tr>
                  <th className="p-6 font-medium">Prospect Details</th>
                  <th className="p-6 font-medium">Context / Vehicle</th>
                  <th className="p-6 font-medium">Lifecycle Status</th>
                  <th className="p-6 font-medium">Timestamp</th>
                  <th className="p-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#7A7A7A]">No prospects found in this category.</td>
                  </tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-white text-sm mb-1">{lead.fullName}</div>
                      <div className="flex items-center gap-3 text-[10px] text-[#7A7A7A]">
                        <span className="flex items-center gap-1 hover:text-white transition cursor-pointer"><Mail className="w-3 h-3" /> {lead.email}</span>
                        <span className="flex items-center gap-1 hover:text-white transition cursor-pointer"><Phone className="w-3 h-3" /> {lead.countryCode} {lead.phone}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="inline-block px-2 py-1 bg-white/5 text-white/80 rounded uppercase tracking-wider text-[9px] mb-2">
                        {lead.leadType.replace('_', ' ')}
                      </span>
                      {lead.vehicle && (
                        <div className="text-[11px] text-[#C9A227]">{lead.vehicle.make} {lead.vehicle.model}</div>
                      )}
                      {lead.message && (
                        <div className="text-[10px] text-[#7A7A7A] truncate max-w-[200px] mt-1" title={lead.message}>"{lead.message}"</div>
                      )}
                    </td>
                    <td className="p-6">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest border font-bold focus:outline-none appearance-none cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-6 text-[10px] text-[#A0A0A0]">
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleDateString()}</div>
                      <div className="mt-1">{new Date(lead.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-6 text-right">
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white hover:bg-[#C9A227] hover:text-black transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
