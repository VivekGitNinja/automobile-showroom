'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { Journal } from '../../../lib/types'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [journal, setJournal] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:4000/api/v1/journals`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const found = data.data.find((j: Journal) => j.id === slug || j.title.toLowerCase().includes(slug?.toLowerCase() || ''))
          setJournal(found || data.data[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="bg-[#030303] min-h-screen text-white flex items-center justify-center font-mono text-sm">
        Loading Story...
      </main>
    )
  }

  if (!journal) {
    return (
      <main className="bg-[#030303] min-h-screen text-white pt-32 px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-serif mb-4">Story Not Found</h1>
          <Link href="/blog" className="text-[#C9A227] font-mono text-xs uppercase tracking-widest">Back to Journal</Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-[#030303] min-h-screen text-white pt-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-mono text-[#C9A227] uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>

        <div className="mb-8">
          <span className="px-4 py-1.5 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#C9A227] font-mono text-[10px] uppercase tracking-widest font-bold">
            {journal.category}
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-white mt-6 leading-tight">
            {journal.title}
          </h1>
          
          <div className="flex items-center gap-6 text-xs font-mono text-[#7A7A7A] mt-6 border-y border-white/10 py-4 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#C9A227]" /> {new Date(journal.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#C9A227]" /> {journal.readTime}</span>
          </div>
        </div>

        <div className="relative h-[450px] w-full rounded-3xl overflow-hidden mb-12 border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={journal.imageUrl} alt={journal.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 font-light leading-relaxed space-y-6 text-lg">
          <p className="text-xl font-serif text-white italic border-l-2 border-[#C9A227] pl-6 py-2">
            "{journal.snippet}"
          </p>
          <p>
            Molsheim’s engineering marvel represents the pinnacle of combustion design. Harnessing 1,578 horsepower and 1,600 Nm of torque, the quad-turbo W16 engine pushes the physical limits of automotive dynamics.
          </p>
          <p>
            Every aerodynamic surface has been sculpted to optimize high-speed stability while maintaining effortless elegance. From carbon-ceramic rotors capable of withstanding track heat to bespoke leather stitching inside the cockpit, no detail has been overlooked.
          </p>
        </div>
      </article>

      <Footer />
    </main>
  )
}
