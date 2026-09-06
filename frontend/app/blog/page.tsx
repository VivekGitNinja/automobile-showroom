import type { Metadata } from 'next'
import BlogsSection from '../../components/BlogsSection'
import { fetchJournalsFromApi } from '../../lib/api'
import { Journal } from '../../lib/types'
import { SITE_URL } from '../../lib/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'The Apex Journal — Automotive Intelligence & Supercar Heritage',
  description: 'Market intelligence, buying guides and collection news from Dubai\'s premier ultra-luxury automobile showroom.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default async function BlogListingPage() {
  let journals: Journal[] = []
  try {
    journals = await fetchJournalsFromApi()
  } catch (error) {
    console.error('Failed to fetch journals for blog listing', error)
  }

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
