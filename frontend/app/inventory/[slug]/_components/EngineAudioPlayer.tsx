'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Volume2, Play, Pause, Disc, Sparkles } from 'lucide-react'
import { VehicleSound } from '../../../../lib/types'

interface EngineAudioPlayerProps {
  sounds?: VehicleSound[]
  vehicleName: string
}

function getDefaultAudioUrl(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('porsche') || lower.includes('911') || lower.includes('gt3')) {
    return '/sounds/porsche_engine_start.mp3'
  }
  if (lower.includes('ferrari') || lower.includes('sf90') || lower.includes('roma') || lower.includes('f8') || lower.includes('296')) {
    return '/sounds/ferrari_engine_start.mp3'
  }
  if (lower.includes('lamborghini') || lower.includes('aventador') || lower.includes('huracan') || lower.includes('urus')) {
    return '/sounds/lamborghini_engine_start.mp3'
  }
  if (lower.includes('mercedes') || lower.includes('g-class') || lower.includes('amg')) {
    return '/sounds/mercedes_engine_start.mp3'
  }
  if (lower.includes('aston') || lower.includes('dbs') || lower.includes('vantage')) {
    return '/sounds/astonmartin_engine_start.mp3'
  }
  if (lower.includes('rolls') || lower.includes('phantom') || lower.includes('cullinan') || lower.includes('ghost')) {
    return '/sounds/rollsroyce_engine_start.mp3'
  }
  if (lower.includes('mclaren') || lower.includes('720s') || lower.includes('750s')) {
    return '/sounds/mclaren_engine_start.mp3'
  }
  if (lower.includes('bugatti') || lower.includes('chiron') || lower.includes('w16')) {
    return '/sounds/bugatti_engine_start.mp3'
  }
  return '/sounds/ferrari_engine_start.mp3'
}

export default function EngineAudioPlayer({ sounds = [], vehicleName }: EngineAudioPlayerProps) {
  const defaultAudio = getDefaultAudioUrl(vehicleName)

  // Ensure there are always authentic acoustic tracks to audition
  const activeSounds = sounds.length > 0
    ? sounds
    : [
        {
          id: 'def-1',
          vehicleId: '',
          soundType: 'Cold Start & Idle Exhaust Note',
          audioUrl: defaultAudio,
          createdAt: new Date().toISOString()
        },
        {
          id: 'def-2',
          vehicleId: '',
          soundType: 'High-RPM Dynamic Throttle Rev',
          audioUrl: defaultAudio,
          createdAt: new Date().toISOString()
        },
        {
          id: 'def-3',
          vehicleId: '',
          soundType: 'Sport+ Track Mode Exhaust Symphony',
          audioUrl: defaultAudio,
          createdAt: new Date().toISOString()
        },
      ]

  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopAudio = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      } catch {}
      currentAudioRef.current = null
    }
    setIsPlaying(false)
    setActiveTrackIndex(null)
  }

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const handleTogglePlay = (index: number) => {
    if (activeTrackIndex === index && isPlaying) {
      stopAudio()
      return
    }

    stopAudio()

    const track = activeSounds[index]
    const audioUrl = track.audioUrl || defaultAudio

    try {
      const audio = new Audio(audioUrl)
      audio.volume = 0.9
      currentAudioRef.current = audio
      setActiveTrackIndex(index)
      setIsPlaying(true)

      audio.onended = () => {
        setIsPlaying(false)
        setActiveTrackIndex(null)
        currentAudioRef.current = null
      }

      audio.onerror = () => {
        stopAudio()
      }

      const p = audio.play()
      if (p !== undefined) {
        p.catch(() => {
          stopAudio()
        })
      }

      // Cap preview at 15 seconds with smooth stop
      timerRef.current = setTimeout(() => {
        if (currentAudioRef.current === audio) {
          stopAudio()
        }
      }, 15000)

    } catch {
      stopAudio()
    }
  }

  return (
    <div className="mb-16">
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] mb-2 flex items-center gap-2">
          <Disc className="w-3.5 h-3.5" /> Engine Symphony
        </span>
        <h2 className="text-3xl font-bold font-serif text-white">Acoustic Signature & Exhaust Notes</h2>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <div className="space-y-4">
          {activeSounds.map((track, idx) => {
            const isActive = activeTrackIndex === idx && isPlaying
            return (
              <div
                key={track.id || idx}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isActive
                    ? 'bg-[#C9A227]/10 border-[#C9A227]/50 shadow-lg shadow-[#C9A227]/10'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleTogglePlay(idx)}
                    aria-label={`Play ${track.soundType}`}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#C9A227] text-black font-bold scale-110 shadow-[0_0_20px_rgba(201,162,39,0.5)]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isActive ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <div>
                    <h4 className={`font-mono text-sm tracking-wide ${isActive ? 'text-[#C9A227] font-bold' : 'text-white'}`}>
                      {track.soundType}
                    </h4>
                    <span className="text-xs text-white/40 font-serif italic">
                      {vehicleName} · Authentic Exhaust Note
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isActive && (
                    <div className="flex items-center gap-1 mr-2">
                      <span className="w-1 h-3.5 bg-[#C9A227] rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                      <span className="w-1 h-6 bg-[#C9A227] rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                      <span className="w-1 h-4 bg-[#C9A227] rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.3s' }} />
                      <span className="w-1 h-7 bg-[#C9A227] rounded-full animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }} />
                      <span className="w-1 h-3 bg-[#C9A227] rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.4s' }} />
                    </div>
                  )}
                  <Volume2 className={`w-4 h-4 ${isActive ? 'text-[#C9A227]' : 'text-white/30'}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
