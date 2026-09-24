'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Plus, RefreshCw, Layers, Users, Database, LogOut, Lock, Key, CheckCircle, 
  Loader2, UploadCloud, Image as ImageIcon, FileText, Film, Settings, Edit, Trash2, Star,
  CarFront, Package, BookOpen, ExternalLink, HelpCircle, ChevronRight
} from 'lucide-react'
import { API_BASE_URL } from '../../lib/api'
import { Vehicle } from '../../lib/types'
import AddVehicleModal from '../../components/AddVehicleModal'
import EditVehicleModal from '../../components/EditVehicleModal'
import SettingsManager from './_components/SettingsManager'
import LeadsViewer from './_components/LeadsViewer'
import SyncLogViewer from './_components/SyncLogViewer'
import PartsManager from './_components/PartsManager'
import JournalManager from './_components/JournalManager'
import SellCarInbox from './_components/SellCarInbox'
import AssetManagerModal from './_components/AssetManagerModal'
import { motion, AnimatePresence } from 'framer-motion'
import { adminFetch, startSessionKeeper, clearAdminSession, setAdminSession } from '../../lib/adminFetch'

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
  const [activeTab, setActiveTab] = useState<'inventory' | 'leads' | 'acquisition' | 'parts' | 'journal' | 'dam' | 'sync' | 'settings'>('inventory')
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [selectedVehicleForAssets, setSelectedVehicleForAssets] = useState<Vehicle | null>(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null)
  
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null)

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
    // Proactively rotate the access token so staff are never logged out
    // mid-session (access tokens live 15 minutes).
    return startSessionKeeper()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      const [vehiclesRes, leadsRes] = await Promise.all([
        adminFetch(`${API_BASE_URL}/admin/vehicles`),
        adminFetch(`${API_BASE_URL}/admin/leads`)
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
      adminFetch(`${API_BASE_URL}/admin/media/status`)
        .then((r: Response) => (r.ok ? r.json() : null))
        .then((d: any) => { if (d?.provider) setMediaProvider(d.provider) })
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
      const res = await adminFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.accessToken) {
        setAdminSession(data.accessToken, data.refreshToken)
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
    clearAdminSession()
    setIsAuthenticated(false)
  }

  const handleTriggerSync = async () => {
    setSyncing(true)
    setSyncStatusMsg(null)

    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/sync`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSyncStatusMsg({
          type: 'success',
          text: data.data?.message || 'Inventory synchronized successfully with Google Sheets.'
        })
        fetchData()
      } else {
        const errorMsg = data.data?.message || data.data?.error || data.message || 'Sync failed'
        if (errorMsg.includes('not configured') || errorMsg.includes('missing')) {
          setSyncStatusMsg({
            type: 'info',
            text: 'Google Sheets sync is in safe standby mode. Local showroom inventory and uploads are 100% active and preserved.'
          })
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: errorMsg
          })
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setSyncStatusMsg({
        type: 'error',
        text: `Sync error: ${errorMessage}`
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
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
      const res = await adminFetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: {}
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

  interface SidebarNavItem {
    id: 'inventory' | 'leads' | 'acquisition' | 'parts' | 'journal' | 'dam' | 'sync' | 'settings'
    label: string
    icon: React.ElementType
    badge?: number
  }

  const sidebarNavItems: SidebarNavItem[] = [
    { id: 'inventory', label: 'Fleet Inventory', icon: Layers, badge: vehicles.length },
    { id: 'leads', label: 'Captured Prospects', icon: Users, badge: leads.length },
    { id: 'acquisition', label: 'Sell-Car Inbox', icon: CarFront },
    { id: 'parts', label: 'Spare Parts', icon: Package },
    { id: 'journal', label: 'Editorial Journal', icon: BookOpen },
    { id: 'dam', label: 'Asset Pipeline', icon: Database },
    { id: 'sync', label: 'Warehouse Sync', icon: RefreshCw },
    { id: 'settings', label: 'Showroom Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row antialiased">
      {/* ─── DESKTOP ENTERPRISE SIDEBAR ─── */}
      <aside className="w-72 hidden lg:flex flex-col shrink-0 min-h-screen bg-[#080808] border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
        {/* Brand & Root Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Apex CMS Core</h2>
              <span className="text-[9px] font-mono text-[#C9A227] uppercase tracking-[0.2em] block">Root Command Center</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-[#3DD598] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DD598] animate-pulse"></span>
              Live Gateway
            </span>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[9px] font-mono text-[#A0A0A0] hover:text-[#C9A227] transition-colors flex items-center gap-1 uppercase tracking-widest"
              title="Open public showroom in new tab"
            >
              <span>Showroom</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-6 px-4 space-y-6">
          <div>
            <span className="px-3 text-[9px] font-mono text-[#7A7A7A] uppercase tracking-[0.25em] block mb-2 font-bold">
              Showroom Operations
            </span>
            <nav className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left group ${
                      isActive 
                        ? 'bg-[#C9A227] text-black font-bold shadow-[0_0_20px_rgba(201,162,39,0.25)]' 
                        : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-black' : 'text-[#7A7A7A] group-hover:text-[#C9A227]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${
                        isActive ? 'bg-black text-[#C9A227]' : 'bg-white/10 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div>
            <span className="px-3 text-[9px] font-mono text-[#7A7A7A] uppercase tracking-[0.25em] block mb-2 font-bold">
              Knowledgebase & AI
            </span>
            <Link
              href="/admin/faqs"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-[#7A7A7A] group-hover:text-[#C9A227] transition-colors" />
                <span>FAQ Chatbot CMS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#555] group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* Administrator Profile & Terminate Session */}
        <div className="p-4 border-t border-white/5 bg-[#050505]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[10px] font-mono font-bold text-[#C9A227] shrink-0">
                A
              </div>
              <div className="truncate">
                <p className="text-[11px] font-mono font-bold text-white truncate">Apex Admin</p>
                <p className="text-[9px] font-mono text-[#7A7A7A] truncate">admin@apex.ae</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/20 text-red-400 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            title="Terminate Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN WORKSPACE CANVAS ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#050505]">
        {/* Top Control Bar with Breadcrumbs & Telemetry Status */}
        <header className="h-16 px-6 sm:px-8 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest">Portal</span>
            <span className="text-white/30">/</span>
            <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-widest capitalize font-bold">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud API Online
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 text-[#C9A227]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                Showroom Database Active
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-lg border border-white/10 text-[#7A7A7A] hover:text-red-500 transition-colors"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-10 flex-1">
          {/* Header Title & Pill Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>System Authenticated • Root Level</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight">
                Enterprise <span className="italic font-light text-white/70">Command Center</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-[#0A0A0A] border border-white/10 rounded-full p-1 overflow-x-auto max-w-full">
                {(['inventory', 'leads', 'acquisition', 'parts', 'journal', 'dam', 'sync', 'settings'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                      activeTab === tab ? 'bg-white text-black font-bold' : 'text-[#7A7A7A] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">Active Masterpieces</span>
                    <Layers className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-5xl font-serif font-bold tracking-tight relative z-10">{vehicles.length}</span>
                  <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest block mt-2">Live Showroom Fleet</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">Captured Prospects</span>
                    <Users className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-5xl font-serif font-bold tracking-tight relative z-10">{leads.length}</span>
                  <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest block mt-2">Inbound VIP Enquiries</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-[0.2em]">Fleet Valuation</span>
                    <CarFront className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <span className="text-3xl font-serif font-bold tracking-tight relative z-10 block mb-1 text-[#C9A227]">
                    AED {(vehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0) / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest">Total Portfolio Value</span>
                </div>

                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-[#C9A227]/20 relative overflow-hidden group shadow-[0_0_30px_rgba(201,162,39,0.05)]">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-[0.2em]">Warehouse Sync</span>
                    <RefreshCw className={`w-4 h-4 text-[#C9A227] ${syncing ? 'animate-spin' : ''}`} />
                  </div>
                  <button
                    onClick={handleTriggerSync}
                    disabled={syncing}
                    className="w-full h-11 rounded-xl bg-[#C9A227] text-black hover:bg-white text-[10px] font-mono font-bold uppercase tracking-widest transition-colors relative z-10 mb-2"
                  >
                    {syncing ? 'Synchronizing...' : 'Trigger Sync Worker'}
                  </button>
                  <span className="text-[9px] font-mono text-[#3DD598] uppercase tracking-widest block text-center">
                    Standby • Local CMS Active
                  </span>
                </div>
              </div>

              {/* Sync Status Banner */}
              {syncStatusMsg && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center justify-between text-xs font-mono border transition-all ${
                  syncStatusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  syncStatusMsg.type === 'info' ? 'bg-[#C9A227]/10 border-[#C9A227]/30 text-[#C9A227]' :
                  'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>{syncStatusMsg.text}</span>
                  </div>
                  <button onClick={() => setSyncStatusMsg(null)} className="text-white/40 hover:text-white px-2">✕</button>
                </div>
              )}

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

          {activeTab === 'acquisition' && (
            <motion.div key="acquisition" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SellCarInbox />
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
      </main>
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
