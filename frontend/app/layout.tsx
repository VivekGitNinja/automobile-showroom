import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FaqChatbot from '../components/chatbot/FaqChatbot'
import PageTransition from '../components/PageTransition'
import { GoogleTagManager } from '@next/third-parties/google'

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Apex Luxury Automobiles Dubai | Exclusive Supercars & Hypercars',
  description: 'Dubai premier showroom for luxury automobiles, rare supercars, and hypercars. Discover exclusive vehicles from Rolls-Royce, Bugatti, Ferrari, Lamborghini, and Porsche.',
  keywords: ['luxury cars Dubai', 'buy supercars Dubai', 'hypercars for sale', 'Rolls-Royce Dubai', 'Bugatti Dubai', 'Ferrari Dubai', 'luxury auto showroom'],
  authors: [{ name: 'Apex Luxury Automobiles' }],
  creator: 'Apex Luxury Automobiles',
  publisher: 'Apex Luxury Automobiles',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Apex Luxury Automobiles Dubai',
    description: 'Dubai premier showroom for luxury automobiles, rare supercars, and hypercars.',
    url: 'https://apex.ae',
    siteName: 'Apex Luxury',
    images: [
      {
        url: '/og-image.jpg', // Placeholder for actual OG image
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_AE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark text-gray-100 min-h-screen flex flex-col antialiased selection:bg-[#C9A227] selection:text-dark">
        <Navbar />
        <main className="flex-1">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "AutoDealer",
                "name": "Apex Luxury Automobiles",
                "description": "Dubai's Premier Ultra-Luxury Automobile Showroom",
                "url": "https://apexluxuryautomobiles.com",
                "telephone": "+971508919441",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Sheikh Zayed Road, Business Bay",
                  "addressLocality": "Dubai",
                  "addressRegion": "Dubai",
                  "postalCode": "00000",
                  "addressCountry": "AE"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 25.1972,
                  "longitude": 55.2744
                },
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                  "opens": "10:00",
                  "closes": "22:00"
                },
                "priceRange": "$$$$"
              })
            }}
          />
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <FaqChatbot />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'} />
    </html>
  )
}
