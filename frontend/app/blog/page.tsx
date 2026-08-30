'use client'

import React, { useEffect, useState } from 'react'
import BlogsSection from '../../components/BlogsSection'
import { Journal } from '../../lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export default function BlogListingPage() {
  const [journals, setJournals] = useState<Journal[]>([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/journals`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setJournals(data.data)
        }
      })
      .catch(err => console.error("Error fetching journals:", err))
  }, [])

  return (
    <main className="bg-[#030303] min-h-screen text-white pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-5xl font-serif font-bold text-white mb-4">Apex <span className="gold-gradient-text">Journal</span></h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Automotive Intelligence & Supercar Heritage</p>
      </div>
      <BlogsSection journals={journals} />
    </main>
  )
}
