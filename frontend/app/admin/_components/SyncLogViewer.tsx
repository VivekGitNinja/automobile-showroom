'use client'

import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../lib/api'
import { Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { adminFetch } from '../../../lib/adminFetch'

interface SyncLog {
  id: string
  timestamp: string
  status: 'success' | 'partial' | 'failed'
  totalRows: number
  added: number
  updated: number
  skipped: number
  errors: number
  errorDetails?: string[]
}

interface SyncStatus {
  configured: boolean
  spreadsheetConfigured: boolean
  serviceAccountJsonConfigured: boolean
  serviceAccountPairConfigured: boolean
  sheetName: string
}

export default function SyncLogViewer() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const [syncing, setSyncing] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const [logsRes, statusRes] = await Promise.all([
        adminFetch(`${API_BASE_URL}/admin/sync/logs`),
        adminFetch(`${API_BASE_URL}/admin/sync/status`).catch(() => null),
      ])

      if (logsRes.ok) {
        const data = await logsRes.json()
        setLogs(data.data || [])
      } else {
        setError('Failed to fetch sync logs.')
      }

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json()
        setSyncStatus(statusData)
      }
    } catch (err) {
      setError('An error occurred while fetching sync logs.')
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async () => {
    setSyncing(true)
    try {
      await adminFetch(`${API_BASE_URL}/admin/sync`, { method: 'POST' })
      await fetchLogs()
    } catch {
      setError('Sync trigger failed.')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">Sync Telemetry</h3>
          <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest">
            Data Warehouse Synchronization Logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="h-10 px-5 rounded-full bg-[#C9A227] text-black hover:bg-white font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Trigger Sync'}</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="h-10 px-5 rounded-full bg-black border border-white/10 text-white hover:border-[#C9A227] hover:text-[#C9A227] font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {syncStatus && !syncStatus.configured && (
        <div className="p-6 m-6 bg-[#C9A227]/5 border border-[#C9A227]/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Google Sheets Integration Not Configured (Safe Standby Mode)</h4>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Automated Google Sheets synchronization links this showroom database with an external Google Spreadsheet. The engine is currently in safe standby mode with complete local CMS autonomy — all current vehicle inventory, pricing, and uploaded media are 100% active and protected.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-[#7A7A7A] uppercase font-mono block">Spreadsheet ID (GOOGLE_SHEET_ID)</span>
                  <span className={syncStatus.spreadsheetConfigured ? 'text-[#3DD598] font-bold' : 'text-[#C9A227]'}>
                    {syncStatus.spreadsheetConfigured ? 'Configured' : 'Standby'}
                  </span>
                </div>
                <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-[#7A7A7A] uppercase font-mono block">Service Account</span>
                  <span className={(syncStatus.serviceAccountJsonConfigured || syncStatus.serviceAccountPairConfigured) ? 'text-[#3DD598] font-bold' : 'text-[#C9A227]'}>
                    {(syncStatus.serviceAccountJsonConfigured || syncStatus.serviceAccountPairConfigured) ? 'Configured' : 'Standby'}
                  </span>
                </div>
                <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-[#7A7A7A] uppercase font-mono block">Target Tab</span>
                  <span className="text-white font-mono">{syncStatus.sheetName || 'Inventory'}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#7A7A7A] pt-1 font-mono">
                To activate bi-directional sync, configure your Google Cloud Service Account credentials in the server environment (.env) or test via scripts/test-sync.ts.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A]">Loading Telemetry...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-500">{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[#7A7A7A]">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">No sync logs found.</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-[#7A7A7A] uppercase tracking-[0.2em] border-b border-white/5 text-[9px]">
              <tr>
                <th className="p-6 font-medium">Timestamp</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Total Rows</th>
                <th className="p-6 font-medium text-[#3DD598]">Added</th>
                <th className="p-6 font-medium text-[#C9A227]">Updated</th>
                <th className="p-6 font-medium text-[#7A7A7A]">Skipped</th>
                <th className="p-6 font-medium text-red-500">Errors</th>
                <th className="p-6 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map(log => {
                const ts = log.timestamp || (log as any).startedAt
                const dateStr = ts ? new Date(ts).toLocaleString() : 'N/A'
                const total = log.totalRows ?? (log as any).rowsProcessed ?? 0
                const added = log.added ?? (log as any).rowsInserted ?? 0
                const updated = log.updated ?? (log as any).rowsUpdated ?? 0
                const skipped = log.skipped ?? 0
                let errorDetails: string[] = log.errorDetails || []
                if (!errorDetails.length && (log as any).errorsJson) {
                  try {
                    const parsed = typeof (log as any).errorsJson === 'string' ? JSON.parse((log as any).errorsJson) : (log as any).errorsJson
                    errorDetails = Array.isArray(parsed) ? parsed : [String(parsed)]
                  } catch {
                    errorDetails = [String((log as any).errorsJson)]
                  }
                }
                const errorCount = log.errors ?? errorDetails.length

                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 text-white">{dateStr}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${
                          log.status === 'success' ? 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30' :
                          log.status === 'partial' ? 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30' :
                          'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-6 text-white">{total}</td>
                      <td className="p-6 text-[#3DD598]">{added}</td>
                      <td className="p-6 text-[#C9A227]">{updated}</td>
                      <td className="p-6 text-[#7A7A7A]">{skipped}</td>
                      <td className="p-6 text-red-500">{errorCount}</td>
                      <td className="p-6 text-right">
                        {errorCount > 0 && (
                          <button
                            onClick={() => toggleRow(log.id)}
                            className="text-[#7A7A7A] hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                          >
                            {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRows.has(log.id) && errorDetails.length > 0 && (
                      <tr className="bg-black/50">
                        <td colSpan={8} className="p-6">
                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-2">
                            <h4 className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-3">Error Details</h4>
                            <ul className="list-disc pl-5 text-[#A0A0A0] text-[11px] space-y-1">
                              {errorDetails.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
