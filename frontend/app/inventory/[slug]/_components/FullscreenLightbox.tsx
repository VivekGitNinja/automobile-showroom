'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface FullscreenLightboxProps {
  images: { urlOriginal: string; title?: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function FullscreenLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: FullscreenLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [isOpen, initialIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || images.length === 0) return
    const preload = (idx: number) => {
      if (idx >= 0 && idx < images.length) {
        const img = new Image()
        img.src = images[idx].urlOriginal
      }
    }
    preload(currentIndex - 1)
    preload(currentIndex + 1)
  }, [currentIndex, isOpen, images])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsZoomed(false)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [currentIndex, images.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsZoomed(false)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [currentIndex])

  const handleClose = useCallback(() => {
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, handleClose])

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isZoomed && e.buttons === 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isZoomed) {
      const dx = e.clientX - dragStart.x
      if (dx > 50) handlePrev()
      else if (dx < -50) handleNext()
    }
  }

  const toggleZoom = () => {
    setIsZoomed(prev => !prev)
    if (isZoomed) setPanOffset({ x: 0, y: 0 })
  }

  if (!isOpen || images.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#050505]/98 backdrop-blur-3xl touch-none"
        >
          {/* Close */}
          <div className="absolute top-0 right-0 z-10 p-6">
            <button
              onClick={handleClose}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/5 text-white transition-colors hover:bg-white hover:text-black"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {currentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
              onClick={toggleZoom}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: isZoomed ? 2 : 1,
                    x: panOffset.x,
                    y: panOffset.y,
                  }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  // eslint-disable-next-line @next/next/no-img-element
                  src={images[currentIndex].urlOriginal}
                  alt={images[currentIndex].title || `Image ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {currentIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}
          </div>

          {/* Footer & Thumbnails */}
          <div className="relative z-10 flex flex-col items-center pb-8 pt-4">
            <div className="mb-4 text-center">
              <div className="font-mono text-sm text-white/70">
                {currentIndex + 1} / {images.length}
              </div>
              {images[currentIndex].title && (
                <div className="mt-1 text-sm font-medium text-white">
                  {images[currentIndex].title}
                </div>
              )}
            </div>

            <div className="flex max-w-full gap-2 overflow-x-auto px-6 pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setIsZoomed(false)
                    setPanOffset({ x: 0, y: 0 })
                  }}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-[#C9A227] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.urlOriginal}
                    alt={img.title || `Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
