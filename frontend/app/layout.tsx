import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import ShowroomLayout from '../components/ShowroomLayout'
import { GoogleTagManager } from '@next/third-parties/google'
import { ToastProvider } from '../lib/useToast'
import ToastContainer from '../components/ui/Toast'
import { SITE_URL, SITE_NAME } from '../lib/site'

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
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Apex Luxury Automobiles Dubai',
    description: 'Dubai premier showroom for luxury automobiles, rare supercars, and hypercars.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/images/hero/hero-car-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Apex Luxury Automobiles — Dubai showroom',
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
        <ToastProvider>
          <ShowroomLayout>{children}</ShowroomLayout>
          <ToastContainer />
        </ToastProvider>
      </body>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
    </html>
  )
}
