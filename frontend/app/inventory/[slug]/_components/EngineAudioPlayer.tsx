'use client'

import React, { useState, useRef } from 'react'
import { Volume2, Play, Pause, Disc } from 'lucide-react'
import { VehicleSound } from '../../../../lib/types'

interface EngineAudioPlayerProps {
  sounds?: VehicleSound[]
  vehicleName: string
}

export default function EngineAudioPlayer({ sounds = [], vehicleName }: EngineAudioPlayerProps) {
  const activeSounds = sounds

  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)

  const stopAudio = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop()
        oscRef.current.disconnect()
      } catch {}
      oscRef.current = null
    }
    setIsPlaying(false)
  }

  const playSynthesizedEngineRumble = (trackIndex: number) => {
    stopAudio()
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current

      // Engine rumble frequencies per track
      const freqs = [65, 120, 180, 240]
      const baseFreq = freqs[trackIndex % freqs.length]

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)

      // Frequency pitch sweep to simulate engine revving
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, ctx.currentTime + 3)
      osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 6)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      oscRef.current = osc

      setActiveTrackIndex(trackIndex)
      setIsPlaying(true)

      setTimeout(() => {
        setIsPlaying(false)
      }, 6000)
    } catch {
      setActiveTrackIndex(trackIndex)
      setIsPlaying(true)
    }
  }

  const handleTogglePlay = (index: number) => {
    if (activeTrackIndex === index && isPlaying) {
      stopAudio()
    } else {
      playSynthesizedEngineRumble(index)
    }
  }

  return (
    <div className="mb-16">
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A227] block mb-2 flex items-center gap-2">
          <Disc className="w-3.5 h-3.5" /> Engine Symphony
        </span>
        <h2 className="text-3xl font-bold font-serif text-white">Acoustic Signature & Exhaust Notes</h2>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 sm:p-8">
        <div className="space-y-4">
          {activeSounds.map((track, idx) => {
            const isActive = activeTrackIndex === idx && isPlaying
            return (
              <div
                key={track.id || idx}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isActive ? 'bg-[#C9A227]/10 border-[#C9A227]/40 shadow-lg shadow-[#C9A227]/5' : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleTogglePlay(idx)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#C9A227] text-black font-bold scale-110 shadow-lg shadow-[#C9A227]/30'
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
                      {vehicleName} · Acoustic Note
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isActive && (
                    <div className="flex items-center gap-1 mr-2">
                      <span className="w-1 h-4 bg-[#C9A227] animate-pulse" />
                      <span className="w-1 h-6 bg-[#C9A227] animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1 h-3 bg-[#C9A227] animate-pulse" style={{ animationDelay: '0.4s' }} />
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
