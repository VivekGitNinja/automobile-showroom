import type { Metadata } from 'next'
import { API_BASE_URL } from '../../../lib/api'
import { SITE_URL } from '../../../lib/site'
import { Journal } from '../../../lib/types'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 300

async function getJournal(slug: string): Promise<Journal | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/journals/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.data || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const journal = await getJournal(params.slug)
  if (!journal) return { title: 'Story Not Found | Apex Luxury Automobiles' }
  return {
    title: `${journal.title} | Apex Luxury Automobiles`,
    description: journal.snippet,
    alternates: { canonical: `${SITE_URL}/blog/${journal.slug}` },
    openGraph: {
      title: journal.title,
      description: journal.snippet,
      images: [{ url: journal.imageUrl }],
      type: 'article',
    },
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const journal = await getJournal(params.slug)

  if (!journal) {
    return (
      <main className="bg-[#030303] min-h-screen text-white pt-32 px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-serif mb-4">Story Not Found</h1>
          <Link href="/blog" className="text-[#C9A227] font-mono text-xs uppercase tracking-widest">Back to Journal</Link>
        </div>
      </main>
    )
  }

  const paragraphs = (journal.content || journal.snippet)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

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
            &ldquo;{journal.snippet}&rdquo;
          </p>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </main>
  )
}
