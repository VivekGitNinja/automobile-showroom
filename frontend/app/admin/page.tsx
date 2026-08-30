'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ShieldCheck, Plus, RefreshCw, Layers, Users, Database, LogOut, Lock, Key, CheckCircle, Loader2, UploadCloud, Image as ImageIcon, FileText, Film, Settings, Edit, Trash2, Star } from 'lucide-react'
import { API_BASE_URL } from '../../lib/api'
import { Vehicle } from '../../lib/types'
import AddVehicleModal from '../../components/AddVehicleModal'
import EditVehicleModal from '../../components/EditVehicleModal'
import SettingsManager from './_components/SettingsManager'
import LeadsViewer from './_components/LeadsViewer'
import SyncLogViewer from './_components/SyncLogViewer'
import PartsManager from './_components/PartsManager'
import JournalManager from './_components/JournalManager'
import AssetManagerModal from './_components/AssetManagerModal'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'leads' | 'parts' | 'journal' | 'dam' | 'sync' | 'settings'>('inventory')
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [selectedVehicleForAssets, setSelectedVehicleForAssets] = useState<Vehicle | null>(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null)
  
  const [syncLog, setSyncLog] = useState<string[]>([
    'System ready. Connected to PostgreSQL 15.',
    'Awaiting sync trigger.',
  ])

  // DAM State
  const [damFiles, setDamFiles] = useState<{name: string, size: number, type: string, progress: number, status: 'uploading'|'success'|'error', url?: string, error?: string}[]>([])
  const [mediaProvider, setMediaProvider] = useState<string>('local-fallback')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      const [vehiclesRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/leads`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      
      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json()
        setVehicles(vData.data || [])
      }
      if (leadsRes.ok) {
        const lData = await leadsRes.json()
        setLeads(lData.data || [])
      }
      // Real DAM storage configuration (local disk vs S3/R2)
      fetch(`${API_BASE_URL}/admin/media/status`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.provider) setMediaProvider(d.provider) })
        .catch(() => {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.accessToken) {
        localStorage.setItem('adminToken', data.accessToken)
        document.cookie = 'admin-token=' + data.accessToken + ';path=/;max-age=86400'
        setIsAuthenticated(true)
        fetchData()
      } else {
        setLoginError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError('Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    document.cookie = 'admin-token=;path=/;max-age=0'
    setIsAuthenticated(false)
  }

  const handleTriggerSync = async () => {
    setSyncing(true)
    const timestamp = new Date().toLocaleTimeString()
    setSyncLog((prev) => [`[${timestamp}] Initiated Google Sheets sync worker...`, ...prev])

    try {
      const res = await fetch(`${API_BASE_URL}/admin/sync`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } })
      const data = await res.json()
      if (res.ok) {
        setSyncLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ✅ Sync complete: ${data.data?.message || 'Updated from Google Spreadsheet.'}`,
          ...prev,
        ])
        fetchData()
      } else {
        const errorMsg = data.data?.message || data.data?.error || data.message || 'Sync failed'
        if (errorMsg.includes('not configured') || errorMsg.includes('missing')) {
           setSyncLog((prev) => [
             `[${new Date().toLocaleTimeString()}] ⚠️ Sync Configuration Required: Google Sheets credentials missing in .env`,
             ...prev,
           ])
        } else {
           throw new Error(errorMsg)
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setSyncLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ Sync failed: ${errorMessage}`,
        ...prev,
      ])
    } finally {
      setSyncing(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ isFeatured: !currentFeatured })
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDamUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        progress: 0,
        status: 'uploading' as const
      }))
      
      setDamFiles(prev => [...prev, ...newFiles])
      
      // Real upload to the DAM storage service (S3 / R2 / local fallback),
      // one XHR per file so we can report honest progress.
      newFiles.forEach((file, idx) => {
        const xhr = new XMLHttpRequest()
        const formData = new FormData()
        const blob = Array.from(e.target.files || [])[idx]
        formData.append('file', blob)
        formData.append('title', file.name)

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const p = (ev.loaded / ev.total) * 100
            setDamFiles(prev => prev.map(df => df.name === file.name ? { ...df, progress: p } : df))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let url: string | undefined
            try {
              const resData = JSON.parse(xhr.responseText)
              url = resData?.data?.url || resData?.data?.fileUrl || resData?.data?.key
            } catch {}
            setDamFiles(prev => prev.map(df => df.name === file.name ? { ...df, progress: 100, status: 'success', url } : df))
          } else {
            setDamFiles(prev => prev.map(df => df.name === file.name ? { ...df, status: 'error', error: `Upload failed (${xhr.status})` } : df))
          }
        }
        xhr.onerror = () => {
          setDamFiles(prev => prev.map(df => df.name === file.name ? { ...df, status: 'error', error: 'Upload failed (network)' } : df))
        }

        xhr.open('POST', `${API_BASE_URL}/admin/media/upload`)
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('adminToken')}`)
        xhr.send(formData)
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-10 rounded-3xl bg-[#0A0A0A] border border-[#C9A227]/30 shadow-[0_0_50px_rgba(201,162,39,0.1)] space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full border border-[#C9A227] flex items-center justify-center bg-[#C9A227]/10 mx-auto shadow-[0_0_20px_rgba(201,162,39,0.2)]">
              <Lock className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Apex CMS Core</h2>
            <p className="text-[10px] text-[#A0A0A0] font-mono uppercase tracking-[0.2em]">Enterprise Showroom Administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-xs font-mono">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-500 text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-[#7A7A7A] uppercase text-[10px] mb-2 tracking-widest">Administrator Identifier</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#7A7A7A] uppercase text-[10px] mb-2 tracking-widest">Security Credential</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-4 rounded-xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A227] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#C9A227] hover:bg-white text-black font-mono font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3 mt-4"
            >
              <Key className="w-4 h-4" />
              <span>Initialize Session</span>
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-36 sm:pt-40 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>System Authenticated • Root Level</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight">
              Enterprise <span className="italic font-light text-white/70">Command Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#0A0A0A] border border-white/10 rounded-full p-1">
               {(['inventory', 'leads', 'parts', 'journal', 'dam', 'sync', 'settings'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-2.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-colors ${activeTab === tab ? 'bg-white text-black font-bold' : 'text-[#7A7A7A] hover:text-white'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#7A7A7A] hover:text-red-500 hover:border-red-500/50 transition-colors"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">Active Masterpieces</span>
                    <Layers className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-5xl font-serif font-bold tracking-tight relative z-10">{vehicles.length}</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">Captured Prospects</span>
                    <Users className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-5xl font-serif font-bold tracking-tight relative z-10">{leads.length}</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">DAM Storage</span>
                    <Database className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-3xl font-serif font-bold tracking-tight relative z-10 block mb-1 capitalize">
                    {mediaProvider.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#3DD598] uppercase">Asset Storage Active</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-[#C9A227]/20 relative overflow-hidden group shadow-[0_0_30px_rgba(201,162,39,0.05)]">
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-[0.2em]">Google Sheets Sync</span>
                    <RefreshCw className={`w-4 h-4 text-[#C9A227] ${syncing ? 'animate-spin' : ''}`} />
                  </div>
                  <button
                    onClick={handleTriggerSync}
                    disabled={syncing}
                    className="w-full h-12 rounded-xl bg-[#C9A227] text-black hover:bg-white text-[10px] font-mono font-bold uppercase tracking-widest transition-colors relative z-10"
                  >
                    {syncing ? 'Synchronizing...' : 'Trigger Sync Worker'}
                  </button>
                </div>
              </div>

              {/* Sync Log Panel */}
              <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 mb-12">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-4">
                  Global Telemetry & Sync Logs
                </h3>
                <div className="p-6 rounded-2xl bg-black border border-white/10 text-[11px] font-mono space-y-2 h-40 overflow-y-auto">
                  {syncLog.map((log, idx) => (
                    <div key={idx} className="flex gap-4 text-[#7A7A7A]">
                      <span className="text-[#A0A0A0] shrink-0">[{new Date().toISOString()}]</span>
                      <span className={log.includes('✅') ? 'text-[#3DD598]' : log.includes('❌') ? 'text-red-500' : 'text-white'}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicles Table */}
              <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-2xl font-serif font-bold">Fleet Management</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-12 px-6 rounded-full bg-white text-black hover:bg-[#C9A227] hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Listing</span>
                  </button>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                      <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">Fetching Fleet Data...</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-black text-[#7A7A7A] uppercase tracking-[0.2em] border-b border-white/5 text-[9px]">
                        <tr>
                          <th className="p-6 font-medium">Chassis / Masterpiece</th>
                          <th className="p-6 font-medium">Model Year</th>
                          <th className="p-6 font-medium">Valuation (AED)</th>
                          <th className="p-6 font-medium">Engine/Trans</th>
                          <th className="p-6 font-medium">Global Status</th>
                          <th className="p-6 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {vehicles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-[#7A7A7A]">No records found. Sync with data warehouse.</td>
                          </tr>
                        ) : vehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-6">
                              <div className="font-serif font-bold text-white text-base">{v.make} {v.model}</div>
                              <div className="text-[10px] text-[#7A7A7A] mt-1">{v.trim || 'Standard Configuration'}</div>
                            </td>
                            <td className="p-6 text-white">{v.year}</td>
                            <td className="p-6 text-[#C9A227] font-bold tracking-widest">{v.price?.toLocaleString()}</td>
                            <td className="p-6 text-[#A0A0A0]">{v.engine || 'V8'} • {v.transmission}</td>
                            <td className="p-6">
                              <select
                                value={v.status || 'draft'}
                                onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border font-bold appearance-none cursor-pointer focus:outline-none ${
                                  v.status === 'published' ? 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30' :
                                  v.status === 'archived' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                  'bg-white/10 text-white/50 border-white/20'
                                }`}
                              >
                                <option value="published" className="bg-black text-[#3DD598]">Published</option>
                                <option value="draft" className="bg-black text-white/50">Draft</option>
                                <option value="archived" className="bg-black text-red-500">Archived</option>
                              </select>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleFeatured(v.id, v.isFeatured || false)}
                                  className={`p-1.5 rounded-full border transition-colors ${
                                    v.isFeatured 
                                      ? 'bg-gold/10 text-gold border-gold/30 hover:bg-gold/20' 
                                      : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10 hover:text-white/70'
                                  }`}
                                  title={v.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${v.isFeatured ? 'fill-gold' : ''}`} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVehicleForAssets(v)
                                    setIsAssetModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30 text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1"
                                >
                                  <UploadCloud className="w-3 h-3" /> Assets
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVehicleForEdit(v)
                                    setIsEditModalOpen(true)
                                  }}
                                  className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                                  title="Edit Vehicle"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                                  title="Delete Vehicle"
                                >
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
              </div>
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div key="leads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <LeadsViewer />
            </motion.div>
          )}

          {activeTab === 'parts' && (
            <motion.div key="parts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PartsManager />
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <JournalManager />
            </motion.div>
          )}

          {/* DAM Module */}
          {activeTab === 'dam' && (
             <motion.div key="dam" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
                         <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-serif font-bold">Enterprise Asset Pipeline</h3>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-[#7A7A7A]">
                               <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#3DD598]" /> {mediaProvider.replace(/-/g, ' ').toUpperCase()} ACTIVE</span>
                            </div>
                         </div>
                         
                         {/* Drag and Drop Zone */}
                         <div 
                           className="border-2 border-dashed border-white/10 rounded-2xl bg-black p-16 flex flex-col items-center justify-center text-center hover:border-[#C9A227]/50 hover:bg-[#C9A227]/5 transition-colors cursor-pointer group"
                           onClick={() => fileInputRef.current?.click()}
                         >
                            <input 
                              type="file" 
                              multiple 
                              className="hidden" 
                              ref={fileInputRef} 
                              onChange={handleDamUpload}
                              accept="image/*,video/*,application/pdf"
                            />
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#C9A227]/20 group-hover:scale-110 transition-all duration-300">
                               <UploadCloud className="w-8 h-8 text-[#A0A0A0] group-hover:text-[#C9A227]" />
                            </div>
                            <h4 className="text-xl font-serif font-bold text-white mb-2">Drag & Drop Masterpiece Assets</h4>
                            <p className="text-[11px] font-mono text-[#7A7A7A] max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                               Supports RAW, TIFF, PNG, MP4, 360° ZIP, and PDF Inspection Reports. Max batch size: 50GB.
                            </p>
                         </div>

                         {/* Upload Queue */}
                         {damFiles.length > 0 && (
                           <div className="mt-8 space-y-3">
                              <h5 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A227] mb-4">Ingestion Queue ({damFiles.length})</h5>
                              {damFiles.map((file, i) => (
                                <div key={i} className="flex items-center justify-between bg-black p-4 rounded-xl border border-white/5">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                         {file.type.includes('image') ? <ImageIcon className="w-4 h-4 text-[#A0A0A0]"/> : 
                                          file.type.includes('video') ? <Film className="w-4 h-4 text-[#A0A0A0]"/> : 
                                          <FileText className="w-4 h-4 text-[#A0A0A0]"/>}
                                      </div>
                                      <div>
                                         <div className="text-[11px] font-mono text-white mb-1">{file.name}</div>
                                         <div className="text-[9px] font-mono text-[#7A7A7A] uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Auto-Categorize</div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4 w-48">
                                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                         <motion.div 
                                           initial={{ width: 0 }} 
                                           animate={{ width: `${file.progress}%` }} 
                                           className={`h-full ${file.status === 'success' ? 'bg-[#3DD598]' : 'bg-[#C9A227]'}`} 
                                         />
                                      </div>
                                      <span className="text-[9px] font-mono text-white w-8 text-right">{Math.round(file.progress)}%</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="lg:col-span-1 space-y-6">
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
                         <h3 className="text-sm font-serif font-bold text-white mb-6 border-b border-white/10 pb-4">Ingested Asset Links</h3>
                         {damFiles.filter(f => f.status === 'success' && f.url).length === 0 ? (
                            <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest leading-relaxed">
                              Uploaded assets appear here with their storage links. Attach them to a vehicle from the Assets menu in Fleet Management.
                            </p>
                         ) : (
                            <div className="space-y-3 text-[10px] font-mono">
                              {damFiles.filter(f => f.status === 'success' && f.url).map((f, i) => (
                                <div key={i} className="bg-black p-4 rounded-xl border border-white/5">
                                  <div className="text-white mb-1 truncate">{f.name}</div>
                                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#C9A227] break-all hover:underline">{f.url}</a>
                                </div>
                              ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

           {activeTab === 'sync' && (
             <motion.div key="sync" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <SyncLogViewer />
             </motion.div>
           )}

          {activeTab === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SettingsManager />
             </motion.div>
          )}
        </AnimatePresence>
      </div>

        <AddVehicleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={fetchData} 
        />
        
        <EditVehicleModal 
          vehicle={selectedVehicleForEdit}
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedVehicleForEdit(null)
          }} 
          onSuccess={fetchData} 
        />

        <AssetManagerModal
          isOpen={isAssetModalOpen}
          vehicle={selectedVehicleForAssets}
          onClose={() => setIsAssetModalOpen(false)}
          onSuccess={fetchData}
        />
      </div>
  )
}
