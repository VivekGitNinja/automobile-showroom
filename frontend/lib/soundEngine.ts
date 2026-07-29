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

// Generate exact acoustic profile based on make, model, and engine type
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
      revDuration: 2.8,
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
      revDuration: 2.3,
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
      revDuration: 2.6,
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
      revDuration: 2.2,
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
      revDuration: 3.0,
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
      revDuration: 2.4,
      popsAndCrackles: true,
      exhaustResonance: 5000,
      idleRumble: 0.4
    }
  }

  // Default Hypercar V8 Profile
  return {
    baseFreq: 100,
    peakFreq: 580,
    subFreq: 50,
    turboWhistle: true,
    revDuration: 2.4,
    popsAndCrackles: true,
    exhaustResonance: 4000,
    idleRumble: 0.4
  }
}

// Synthesize authentic supercar engine rev using Web Audio API
export function playVehicleEngineSound(
  vehicle: Vehicle,
  onStateChange?: (revving: boolean) => void
) {
  if (onStateChange) onStateChange(true)

  const profile = getEngineProfile(vehicle)
  const duration = profile.revDuration

  setTimeout(() => {
    if (onStateChange) onStateChange(false)
  }, duration * 1000)

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Primary & Secondary Engine Oscillators
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const sub = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc1.type = 'sawtooth'
    osc2.type = 'square'
    sub.type = 'triangle'

    // Engine Rev Frequency Envelope
    osc1.frequency.setValueAtTime(profile.baseFreq, now)
    osc1.frequency.exponentialRampToValueAtTime(profile.peakFreq, now + duration * 0.35)
    osc1.frequency.exponentialRampToValueAtTime(profile.baseFreq + 15, now + duration - 0.2)

    osc2.frequency.setValueAtTime(profile.baseFreq / 2, now)
    osc2.frequency.exponentialRampToValueAtTime(profile.peakFreq / 2, now + duration * 0.35)
    osc2.frequency.exponentialRampToValueAtTime(profile.baseFreq / 2 + 10, now + duration - 0.2)

    sub.frequency.setValueAtTime(profile.subFreq, now)
    sub.frequency.exponentialRampToValueAtTime(profile.subFreq * 3.5, now + duration * 0.35)
    sub.frequency.exponentialRampToValueAtTime(profile.subFreq, now + duration - 0.2)

    // Exhaust Resonance Filter Envelope
    filter.type = 'lowpass'
    filter.Q.value = 6
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(profile.exhaustResonance, now + duration * 0.35)
    filter.frequency.exponentialRampToValueAtTime(350, now + duration - 0.2)

    // Volume Envelope
    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.15)
    gainNode.gain.linearRampToValueAtTime(0.5, now + duration * 0.35)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc1.connect(filter)
    osc2.connect(filter)
    sub.connect(filter)

    // Add Turbo Spool Whistle if present
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
      ctx.close()
    }, duration * 1000 + 200)

  } catch (err) {
    console.error("Supercar sound synthesis error:", err)
  }
}
