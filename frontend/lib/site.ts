/**
 * Central site configuration — every canonical URL, sitemap entry and
 * JSON-LD reference must derive from here so the whole site agrees on one
 * domain (driven by NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '')

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Apex Luxury Automobiles'

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971508919441'
