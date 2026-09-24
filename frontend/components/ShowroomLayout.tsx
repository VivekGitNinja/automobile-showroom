'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import FaqChatbot from './chatbot/FaqChatbot'
import PageTransition from './PageTransition'
import { SITE_URL } from '../lib/site'

interface ShowroomLayoutProps {
  children: React.ReactNode
}

export default function ShowroomLayout({ children }: ShowroomLayoutProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  // When on any admin route (/admin, /admin/login, /admin/faqs),
  // completely isolate the canvas: DO NOT mount customer navbar, footer,
  // chatbot, WhatsApp widget, or public AutoDealer schema.
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        {children}
      </div>
    )
  }

  // Public customer showroom experience
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoDealer',
              'name': 'Apex Luxury Automobiles',
              'description': "Dubai's Premier Ultra-Luxury Automobile Showroom",
              'url': SITE_URL,
              'telephone': '+971508919441',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Sheikh Zayed Road, Business Bay',
                'addressLocality': 'Dubai',
                'addressRegion': 'Dubai',
                'postalCode': '00000',
                'addressCountry': 'AE',
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 25.1972,
                'longitude': 55.2744,
              },
              'openingHoursSpecification': {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'opens': '10:00',
                'closes': '22:00',
              },
              'priceRange': '$$$$',
            }),
          }}
        />
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FaqChatbot />
    </>
  )
}
