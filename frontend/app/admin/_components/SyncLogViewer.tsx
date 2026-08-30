'use client'

import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../lib/api'
import { Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function SyncLogViewer() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sync/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.data || [])
      } else {
        setError('Failed to fetch sync logs.')
      }
    } catch (err) {
      setError('An error occurred while fetching sync logs.')
    } finally {
      setLoading(false)
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
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">Sync Telemetry</h3>
          <p className="text-[10px] font-mono text-[#7A7A7A] uppercase tracking-widest">
            Data Warehouse Synchronization Logs
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-10 px-6 rounded-full bg-black border border-white/10 text-white hover:border-[#C9A227] hover:text-[#C9A227] font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

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
              {logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-white">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${
                        log.status === 'success' ? 'bg-[#3DD598]/10 text-[#3DD598] border-[#3DD598]/30' :
                        log.status === 'partial' ? 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30' :
                        'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-6 text-white">{log.totalRows}</td>
                    <td className="p-6 text-[#3DD598]">{log.added}</td>
                    <td className="p-6 text-[#C9A227]">{log.updated}</td>
                    <td className="p-6 text-[#7A7A7A]">{log.skipped}</td>
                    <td className="p-6 text-red-500">{log.errors}</td>
                    <td className="p-6 text-right">
                      {log.errors > 0 && (
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-[#7A7A7A] hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && log.errorDetails && log.errorDetails.length > 0 && (
                    <tr className="bg-black/50">
                      <td colSpan={8} className="p-6">
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-2">
                          <h4 className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-3">Error Details</h4>
                          <ul className="list-disc pl-5 text-[#A0A0A0] text-[11px] space-y-1">
                            {log.errorDetails.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
