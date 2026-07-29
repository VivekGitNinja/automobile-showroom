import { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Us | The Apex Standard | Apex Luxury Automobiles Dubai',
  description: 'Dubai\'s premier ultra-luxury automobile showroom. Founded on passion for automotive excellence with over 15 years of experience delivering the finest cars.',
  openGraph: {
    title: 'About Us | The Apex Standard',
    description: 'Dubai\'s premier ultra-luxury automobile showroom.',
    images: [{ url: '/images/hero/hero-car-4.jpg' }]
  }
}

export default function AboutPage() {
  return <AboutClient />
}
