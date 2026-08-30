'use client'

import React, { useState } from 'react'
import { Lock, Key } from 'lucide-react'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../../lib/api'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

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
        // Hard navigation: the client router may hold a pre-login redirect
        // for /admin in its cache, which would swallow router.push.
        window.location.assign('/admin')
      } else {
        setLoginError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError('Login failed')
    }
  }

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
