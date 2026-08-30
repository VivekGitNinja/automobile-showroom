import React from 'react'
import { Metadata } from 'next'
import { SITE_URL } from '../../lib/site'
import { API_BASE_URL } from '../../lib/api'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Apex Luxury Automobiles',
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
}

interface FaqItem {
  id: string
  question: string
  answer: string
}

interface FaqCategory {
  id: string
  label: string
  slug: string
  faqs: FaqItem[]
}

async function getFaqCategories(): Promise<FaqCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map((cat: any) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,
      faqs: (cat.faqs || []).map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
    }))
  } catch {
    return []
  }
}

export default async function FaqPage() {
  const categories = await getFaqCategories()
  const faqs: FaqItem[] = categories.flatMap((c) => c.faqs)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="pt-36 sm:pt-40 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold block mb-2">
            Help & Information
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
        </div>

        {faqs.length === 0 ? (
          <p className="text-center text-gray-400">
            Our FAQ collection is being curated. For any question, our concierge team is one
            message away — via the chat assistant, WhatsApp, or the <a className="text-gold underline" href="/contact">contact form</a>.
          </p>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat.id}>
                {cat.label && (
                  <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-gold mb-4">
                    {cat.label}
                  </h2>
                )}
                <div className="space-y-6">
                  {cat.faqs.map((faq) => (
                    <div key={faq.id} className="p-6 rounded-2xl bg-dark-card border border-gold/20">
                      <h3 className="text-lg font-serif font-bold text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-xs text-gray-300 font-light leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
