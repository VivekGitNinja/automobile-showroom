'use client'

import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { Language } from '../lib/translations'

export default function LanguageToggle() {
  const [lang, setLang] = useState<Language>('en')

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en'
    setLang(nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-white hover:border-white transition-all flex items-center gap-1.5"
    >
      <Globe className="w-3.5 h-3.5 text-white" />
      <span>{lang === 'en' ? 'English' : 'العربية'}</span>
    </button>
  )
}
