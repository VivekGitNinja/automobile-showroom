'use client'

import { useEffect, useState } from 'react'
import { API_BASE_URL } from './api'

const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971508919441'

/**
 * Reads the sales-team contact details from Site Settings (admin-editable)
 * with an env/local fallback so buttons always work, even offline.
 */
export function useSettings() {
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP)
  const [phone, setPhone] = useState(FALLBACK_WHATSAPP)

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => res.json())
      .then((res) => {
        const data = res?.data || res || {}
        if (typeof data.whatsappNumber === 'string' && data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber)
        }
        if (typeof data.phone === 'string' && data.phone) {
          setPhone(data.phone)
        }
      })
      .catch(() => {})
  }, [])

  const waLink = (text?: string) => {
    const normalized = whatsappNumber.replace(/[^0-9]/g, '')
    const query = text ? `?text=${encodeURIComponent(text)}` : ''
    return `https://wa.me/${normalized}${query}`
  }

  return { whatsappNumber, phone, waLink }
}
