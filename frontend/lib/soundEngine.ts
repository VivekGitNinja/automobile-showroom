import { Vehicle } from './types'

export interface EngineAudioProfile {
  baseFreq: number
  peakFreq: number
  subFreq: number
  turboWhistle: boolean
  revDuration: number
  popsAndCrackles: boolean
  exhaustResonance: number
  idleRumble: number
}

// Track active audio playback so multiple sounds do not overlap
let activeAudio: HTMLAudioElement | null = null
let activeTimer: NodeJS.Timeout | null = null

/**
 * Returns the authentic high-definition recorded exhaust audio file
 * for any supercar based on its make, model, and engine architecture.
 */
export function getRealEngineAudioUrl(vehicle: Vehicle): string {
  // If the vehicle has an explicit sound track from CMS/database
  if (vehicle.sounds && vehicle.sounds.length > 0 && vehicle.sounds[0].audioUrl) {
    return vehicle.sounds[0].audioUrl
  }

  const make = (vehicle.make || '').toLowerCase()
  const model = (vehicle.model || '').toLowerCase()
  const engine = (vehicle.engine || '').toLowerCase()

  if (make.includes('porsche') || model.includes('911') || model.includes('gt3') || engine.includes('boxer')) {
    return '/sounds/porsche_engine_start.mp3'
  }

  if (make.includes('ferrari') || model.includes('sf90') || model.includes('roma') || model.includes('f8') || model.includes('296') || model.includes('488') || model.includes('458')) {
    return '/sounds/ferrari_engine_start.mp3'
  }

  if (make.includes('lamborghini') || model.includes('aventador') || model.includes('huracan') || model.includes('urus') || model.includes('revuelto') || model.includes('svj')) {
    return '/sounds/lamborghini_engine_start.mp3'
  }

  if (make.includes('mercedes') || model.includes('g-class') || model.includes('amg') || model.includes('gt') || model.includes('g63')) {
    return '/sounds/mercedes_engine_start.mp3'
  }

  if (make.includes('aston') || model.includes('dbs') || model.includes('vantage') || model.includes('db11') || model.includes('db12') || model.includes('vanquish')) {
    return '/sounds/astonmartin_engine_start.mp3'
  }

  if (make.includes('rolls') || model.includes('phantom') || model.includes('ghost') || model.includes('cullinan') || model.includes('spectre') || model.includes('wraith')) {
    return '/sounds/rollsroyce_engine_start.mp3'
  }

  if (make.includes('mclaren') || model.includes('720s') || model.includes('750s') || model.includes('765lt') || model.includes('artura') || model.includes('p1')) {
    return '/sounds/mclaren_engine_start.mp3'
  }

  if (make.includes('bugatti') || engine.includes('w16') || model.includes('chiron') || model.includes('veyron') || model.includes('tourbillon') || model.includes('divo')) {
    return '/sounds/bugatti_engine_start.mp3'
  }

  // High-performance fallback
  return '/sounds/ferrari_engine_start.mp3'
}

// Generate exact acoustic fallback profile for Web Audio API synthesis
export function getEngineProfile(vehicle: Vehicle): EngineAudioProfile {
  const make = vehicle.make?.toLowerCase() || ''
  const model = vehicle.model?.toLowerCase() || ''
  const engine = vehicle.engine?.toLowerCase() || ''

  if (make.includes('bugatti') || engine.includes('w16')) {
    return {
      baseFreq: 75,
      peakFreq: 520,
      subFreq: 35,
      turboWhistle: true,
      revDuration: 4.5,
      popsAndCrackles: true,
      exhaustResonance: 4500,
      idleRumble: 0.5
    }
  }

  if (make.includes('ferrari') || model.includes('sf90') || model.includes('roma') || model.includes('f8')) {
    return {
      baseFreq: 140,
      peakFreq: 720,
      subFreq: 70,
      turboWhistle: true,
      revDuration: 4.0,
      popsAndCrackles: true,
      exhaustResonance: 5500,
      idleRumble: 0.35
    }
  }

  if (make.includes('lamborghini') || model.includes('revuelto') || model.includes('huracan') || model.includes('aventador')) {
    return {
      baseFreq: 110,
      peakFreq: 820,
      subFreq: 55,
      turboWhistle: false,
      revDuration: 4.5,
      popsAndCrackles: true,
      exhaustResonance: 6200,
      idleRumble: 0.45
    }
  }

  if (make.includes('porsche') || model.includes('gt3') || model.includes('911')) {
    return {
      baseFreq: 160,
      peakFreq: 880,
      subFreq: 80,
      turboWhistle: false,
      revDuration: 4.0,
      popsAndCrackles: true,
      exhaustResonance: 6800,
      idleRumble: 0.3
    }
  }

  if (make.includes('rolls') || model.includes('spectre') || model.includes('cullinan') || model.includes('phantom')) {
    return {
      baseFreq: 55,
      peakFreq: 220,
      subFreq: 25,
      turboWhistle: false,
      revDuration: 4.5,
      popsAndCrackles: false,
      exhaustResonance: 1800,
      idleRumble: 0.2
    }
  }

  if (make.includes('mclaren') || model.includes('750s') || model.includes('720s')) {
    return {
      baseFreq: 125,
      peakFreq: 680,
      subFreq: 60,
      turboWhistle: true,
      revDuration: 4.0,
      popsAndCrackles: true,
      exhaustResonance: 5000,
      idleRumble: 0.4
    }
  }

  return {
    baseFreq: 100,
    peakFreq: 580,
    subFreq: 50,
    turboWhistle: true,
    revDuration: 4.0,
    popsAndCrackles: true,
    exhaustResonance: 4000,
    idleRumble: 0.4
  }
}

/**
 * Play authentic supercar engine roar.
 * Prioritizes high-definition real acoustic recordings with Web Audio fallback.
 */
export function playVehicleEngineSound(
  vehicle: Vehicle,
  onStateChange?: (revving: boolean) => void,
  maxDuration: number = 6.0
) {
  // Stop any currently playing audio track
  if (activeAudio) {
    try {
      activeAudio.pause()
      activeAudio.currentTime = 0
    } catch {}
    activeAudio = null
  }
  if (activeTimer) {
    clearTimeout(activeTimer)
    activeTimer = null
  }

  if (onStateChange) onStateChange(true)

  const audioUrl = getRealEngineAudioUrl(vehicle)

  if (typeof window !== 'undefined') {
    const audio = new Audio(audioUrl)
    audio.volume = 0.85
    activeAudio = audio

    const cleanup = () => {
      if (onStateChange) onStateChange(false)
      if (activeAudio === audio) activeAudio = null
    }

    audio.onended = cleanup
    audio.onpause = cleanup
    audio.onerror = () => {
      // Fallback to synthesized engine audio if real file fails
      playSynthesizedEngineSound(vehicle, onStateChange)
    }

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Allow full dynamic rev burst up to maxDuration
          activeTimer = setTimeout(() => {
            if (activeAudio === audio) {
              // Smooth fade out
              const fadeInterval = setInterval(() => {
                if (audio.volume > 0.1) {
                  audio.volume = Math.max(0, audio.volume - 0.15)
                } else {
                  clearInterval(fadeInterval)
                  try {
                    audio.pause()
                    audio.currentTime = 0
                  } catch {}
                  cleanup()
                }
              }, 50)
            }
          }, maxDuration * 1000)
        })
        .catch(() => {
          // If browser restricts autoplay, fallback to Web Audio
          playSynthesizedEngineSound(vehicle, onStateChange)
        })
    }
  } else {
    if (onStateChange) onStateChange(false)
  }
}

// Fallback high-fidelity Web Audio synthesis
function playSynthesizedEngineSound(
  vehicle: Vehicle,
  onStateChange?: (revving: boolean) => void
) {
  const profile = getEngineProfile(vehicle)
  const duration = profile.revDuration

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) {
      if (onStateChange) onStateChange(false)
      return
    }
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const sub = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc1.type = 'sawtooth'
    osc2.type = 'square'
    sub.type = 'triangle'

    osc1.frequency.setValueAtTime(profile.baseFreq, now)
    osc1.frequency.exponentialRampToValueAtTime(profile.peakFreq, now + duration * 0.35)
    osc1.frequency.exponentialRampToValueAtTime(profile.baseFreq + 15, now + duration - 0.2)

    osc2.frequency.setValueAtTime(profile.baseFreq / 2, now)
    osc2.frequency.exponentialRampToValueAtTime(profile.peakFreq / 2, now + duration * 0.35)
    osc2.frequency.exponentialRampToValueAtTime(profile.baseFreq / 2 + 10, now + duration - 0.2)

    sub.frequency.setValueAtTime(profile.subFreq, now)
    sub.frequency.exponentialRampToValueAtTime(profile.subFreq * 3.5, now + duration * 0.35)
    sub.frequency.exponentialRampToValueAtTime(profile.subFreq, now + duration - 0.2)

    filter.type = 'lowpass'
    filter.Q.value = 6
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(profile.exhaustResonance, now + duration * 0.35)
    filter.frequency.exponentialRampToValueAtTime(350, now + duration - 0.2)

    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.15)
    gainNode.gain.linearRampToValueAtTime(0.5, now + duration * 0.35)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc1.connect(filter)
    osc2.connect(filter)
    sub.connect(filter)

    if (profile.turboWhistle) {
      const turboOsc = ctx.createOscillator()
      const turboGain = ctx.createGain()
      turboOsc.type = 'sine'
      turboOsc.frequency.setValueAtTime(1200, now)
      turboOsc.frequency.exponentialRampToValueAtTime(4500, now + duration * 0.35)
      turboOsc.frequency.exponentialRampToValueAtTime(800, now + duration - 0.2)

      turboGain.gain.setValueAtTime(0.001, now)
      turboGain.gain.linearRampToValueAtTime(0.08, now + duration * 0.3)
      turboGain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.1)

      turboOsc.connect(turboGain)
      turboGain.connect(gainNode)
      turboOsc.start(now)
      turboOsc.stop(now + duration)
    }

    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    sub.start(now)

    osc1.stop(now + duration)
    osc2.stop(now + duration)
    sub.stop(now + duration)

    setTimeout(() => {
      if (onStateChange) onStateChange(false)
      ctx.close()
    }, duration * 1000)
  } catch (err) {
    if (onStateChange) onStateChange(false)
    console.error("Supercar sound error:", err)
  }
}
