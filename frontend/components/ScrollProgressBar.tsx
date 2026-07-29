'use client'

import React, { useState, useEffect } from 'react'

export default function ScrollProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const totalScroll = documentHeight - windowHeight

      if (totalScroll > 0) {
        setScrollPercentage((scrollTop / totalScroll) * 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="scroll-progress-bar shadow-luxury-glow"
      style={{ width: `${scrollPercentage}%` }}
    />
  )
}
