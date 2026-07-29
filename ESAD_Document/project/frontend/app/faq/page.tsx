import React from 'react'

export default function FaqPage() {
  const faqs = [
    {
      q: 'Are all vehicles in your Dubai showroom physically available?',
      a: 'Yes, 100% of the motorcars listed in our catalog are physically stored and present in our temperature-controlled showroom in Dubai, UAE.',
    },
    {
      q: 'Do you arrange international air freight and maritime export?',
      a: 'Absolutely. We provide door-to-door, fully insured air freight and ocean container transport to Europe, North America, Asia-Pacific, and GCC nations.',
    },
    {
      q: 'What payment methods are supported for luxury vehicle acquisition?',
      a: 'We accept wire transfers in AED, USD, EUR, GBP, certified bank cashier checks, and approved cryptocurrency settlements.',
    },
    {
      q: 'Can I request a private viewing or test drive appointment?',
      a: 'Yes. Private viewings are conducted by appointment only with our dedicated VIP Sales Concierge to ensure complete discretion.',
    },
  ]

  return (
    <div className="pt-36 sm:pt-40 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold block mb-2">
          Help & Information
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-dark-card border border-gold/20">
            <h3 className="text-lg font-serif font-bold text-white mb-2">
              {faq.q}
            </h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
