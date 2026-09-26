"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type AudioAPI = {
  enabled: boolean
  toggle: () => void
  startAmbient: () => void
}

const AudioCtx = createContext<AudioAPI | null>(null)

export function useSiteAudio(): AudioAPI {
  const ctx = useContext(AudioCtx)
  if (!ctx) return { enabled: false, toggle: () => {}, startAmbient: () => {} }
  return ctx
}

// soft ambient bed volume (kept intentionally low, Noomo-style)
const MASTER = 0.15

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const sfxRef = useRef<GainNode | null>(null)
  const builtRef = useRef(false)

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current
    const AC =
      typeof window !== "undefined"
        ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined
    if (!AC) return null
    const ctx = new AC()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    const sfx = ctx.createGain()
    sfx.gain.value = 0
    sfx.connect(ctx.destination)
    ctxRef.current = ctx
    masterRef.current = master
    sfxRef.current = sfx
    return ctx
  }, [])

  // build a slow, evolving pad: a few detuned voices through a drifting lowpass
  const buildAmbient = useCallback((ctx: AudioContext, master: GainNode) => {
    const pad = ctx.createGain()
    pad.gain.value = 0.5
    pad.connect(master)

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 620
    filter.Q.value = 0.6
    filter.connect(pad)

    const voices: Array<{ f: number; type: OscillatorType; g: number; detune: number }> = [
      { f: 55, type: "sine", g: 0.5, detune: 0 }, // A1 sub
      { f: 110, type: "sine", g: 0.42, detune: -4 }, // A2
      { f: 164.81, type: "sine", g: 0.3, detune: 6 }, // E3
      { f: 220, type: "triangle", g: 0.14, detune: 3 }, // A3 shimmer
    ]
    voices.forEach(({ f, type, g, detune }) => {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = f
      o.detune.value = detune
      const vg = ctx.createGain()
      vg.gain.value = g
      o.connect(vg).connect(filter)
      o.start()
    })

    // slow filter drift — the pad "breathes" open and closed
    const fl = ctx.createOscillator()
    fl.frequency.value = 0.05
    const flg = ctx.createGain()
    flg.gain.value = 230
    fl.connect(flg).connect(filter.frequency)
    fl.start()

    // gentle amplitude swell
    const al = ctx.createOscillator()
    al.frequency.value = 0.08
    const alg = ctx.createGain()
    alg.gain.value = 0.14
    al.connect(alg).connect(pad.gain)
    al.start()
  }, [])

  const startAmbient = useCallback(() => {
    const ctx = ensure()
    if (!ctx || !masterRef.current) return
    if (ctx.state === "suspended") void ctx.resume()
    if (!builtRef.current) {
      buildAmbient(ctx, masterRef.current)
      builtRef.current = true
    }
    const now = ctx.currentTime
    const g = masterRef.current.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(MASTER, now + 2.6) // soft roll-in
    if (sfxRef.current) sfxRef.current.gain.setValueAtTime(0.9, now)
    enabledRef.current = true
    setEnabled(true)
  }, [ensure, buildAmbient])

  const mute = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !masterRef.current) return
    const now = ctx.currentTime
    const g = masterRef.current.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(0, now + 0.45)
    if (sfxRef.current) sfxRef.current.gain.setValueAtTime(0, now)
    enabledRef.current = false
    setEnabled(false)
  }, [])

  const toggle = useCallback(() => {
    if (enabledRef.current) mute()
    else startAmbient()
  }, [mute, startAmbient])

  // short, soft UI tick on interactive clicks
  const playClick = useCallback(() => {
    const ctx = ctxRef.current
    const sfx = sfxRef.current
    if (!ctx || !sfx || !enabledRef.current) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = "triangle"
    o.frequency.setValueAtTime(820, t)
    o.frequency.exponentialRampToValueAtTime(360, t + 0.11)
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 1100
    bp.Q.value = 1.1
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15)
    o.connect(bp).connect(g).connect(sfx)
    o.start(t)
    o.stop(t + 0.17)
  }, [])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      if (el.closest('a,button,[role="button"],input[type="submit"],input[type="button"],label,summary')) {
        playClick()
      }
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [playClick])

  return <AudioCtx.Provider value={{ enabled, toggle, startAmbient }}>{children}</AudioCtx.Provider>
}
