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

const MASTER = 0.24
const BPM = 86
const EIGHTH = 60 / BPM / 2
const STEPS_PER_CHORD = 16 // two bars of eighths
const CYCLE = STEPS_PER_CHORD * 4 // Am → F → C → G

const PROGRESSION = [
  { root: 45, pad: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  { root: 41, pad: [57, 60, 65, 69], arp: [65, 69, 72, 77] },
  { root: 48, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
]
const ARP_PATTERN = [0, 1, 2, 3, 2, 1, 2, 3]

// [step within the 8-bar cycle, midi note, length in eighths]
const MELODY: Array<[number, number, number]> = [
  [0, 76, 4], [4, 74, 2], [6, 72, 2], [8, 69, 8],
  [16, 72, 4], [20, 77, 4], [24, 76, 8],
  [32, 79, 4], [36, 76, 2], [38, 74, 2], [40, 72, 8],
  [48, 74, 4], [52, 71, 2], [54, 67, 2], [56, 71, 8],
]

// layers per 8-bar section; after the intro the arrangement loops through sections 1–4
const SECTIONS = [
  { arp: false, kick: false, melody: false, rolling: false },
  { arp: true, kick: false, melody: false, rolling: true },
  { arp: true, kick: true, melody: true, rolling: true },
  { arp: true, kick: true, melody: true, rolling: true },
  { arp: true, kick: false, melody: false, rolling: false },
]

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

type Buses = { music: GainNode; delay: GainNode; reverb: GainNode }

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const sfxRef = useRef<GainNode | null>(null)
  const busesRef = useRef<Buses | null>(null)
  const schedRef = useRef<{ step: number; next: number; timer: ReturnType<typeof setInterval> | null }>({
    step: 0,
    next: 0,
    timer: null,
  })
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    comp.attack.value = 0.02
    comp.release.value = 0.3
    master.connect(comp).connect(ctx.destination)

    const music = ctx.createGain()
    music.connect(master)

    // generated hall impulse: a decaying stereo tail, never heard on its own
    const seconds = 2.8
    const ir = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch)
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3.2)
    }
    const convolver = ctx.createConvolver()
    convolver.buffer = ir
    const reverb = ctx.createGain()
    reverb.gain.value = 1
    const reverbOut = ctx.createGain()
    reverbOut.gain.value = 0.42
    reverb.connect(convolver).connect(reverbOut).connect(master)

    // dotted-eighth echo with a darkening feedback loop
    const delay = ctx.createGain()
    const delayNode = ctx.createDelay(2)
    delayNode.delayTime.value = EIGHTH * 1.5
    const feedback = ctx.createGain()
    feedback.gain.value = 0.34
    const darken = ctx.createBiquadFilter()
    darken.type = "lowpass"
    darken.frequency.value = 2400
    delay.connect(delayNode)
    delayNode.connect(darken).connect(feedback).connect(delayNode)
    darken.connect(music)
    darken.connect(reverb)

    const sfx = ctx.createGain()
    sfx.gain.value = 0
    sfx.connect(ctx.destination)

    ctxRef.current = ctx
    masterRef.current = master
    sfxRef.current = sfx
    busesRef.current = { music, delay, reverb }
    return ctx
  }, [])

  const playPad = useCallback((ctx: AudioContext, b: Buses, notes: number[], t: number, dur: number) => {
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.Q.value = 0.7
    filter.frequency.setValueAtTime(500, t)
    filter.frequency.linearRampToValueAtTime(1300, t + dur * 0.55)
    filter.frequency.linearRampToValueAtTime(700, t + dur + 2)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(0.05, t + 1.6)
    env.gain.setValueAtTime(0.05, t + dur)
    env.gain.linearRampToValueAtTime(0.0001, t + dur + 2.2)
    filter.connect(env)
    env.connect(b.music)
    env.connect(b.reverb)
    notes.forEach((n) => {
      ;[-7, 7].forEach((detune) => {
        const o = ctx.createOscillator()
        o.type = "sawtooth"
        o.frequency.value = freq(n)
        o.detune.value = detune
        o.connect(filter)
        o.start(t)
        o.stop(t + dur + 2.4)
      })
    })
  }, [])

  const playBass = useCallback((ctx: AudioContext, b: Buses, midi: number, t: number, len: number, level: number) => {
    const o = ctx.createOscillator()
    o.type = "sawtooth"
    o.frequency.value = freq(midi)
    const sub = ctx.createOscillator()
    sub.type = "sine"
    sub.frequency.value = freq(midi - 12)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.setValueAtTime(420, t)
    lp.frequency.exponentialRampToValueAtTime(160, t + Math.min(len, 0.4))
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    o.connect(lp)
    sub.connect(lp)
    lp.connect(g).connect(b.music)
    o.start(t)
    sub.start(t)
    o.stop(t + len + 0.05)
    sub.stop(t + len + 0.05)
  }, [])

  const playPluck = useCallback((ctx: AudioContext, b: Buses, midi: number, t: number, level: number) => {
    const o = ctx.createOscillator()
    o.type = "triangle"
    o.frequency.value = freq(midi)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.setValueAtTime(3200, t)
    lp.frequency.exponentialRampToValueAtTime(900, t + 0.22)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
    o.connect(lp).connect(g)
    g.connect(b.music)
    g.connect(b.delay)
    o.start(t)
    o.stop(t + 0.36)
  }, [])

  const playBell = useCallback((ctx: AudioContext, b: Buses, midi: number, t: number, len: number) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.8)
    g.connect(b.music)
    g.connect(b.reverb)
    g.connect(b.delay)
    ;[
      { ratio: 1, level: 1, type: "sine" as OscillatorType },
      { ratio: 2, level: 0.18, type: "sine" as OscillatorType },
      { ratio: 3, level: 0.06, type: "triangle" as OscillatorType },
    ].forEach(({ ratio, level, type }) => {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq(midi) * ratio
      const og = ctx.createGain()
      og.gain.value = level
      o.connect(og).connect(g)
      o.start(t)
      o.stop(t + len + 0.9)
    })
  }, [])

  const playKick = useCallback((ctx: AudioContext, b: Buses, t: number) => {
    const o = ctx.createOscillator()
    o.type = "sine"
    o.frequency.setValueAtTime(120, t)
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    o.connect(g).connect(b.music)
    o.start(t)
    o.stop(t + 0.45)
  }, [])

  const scheduleStep = useCallback(
    (step: number, t: number) => {
      const ctx = ctxRef.current
      const b = busesRef.current
      if (!ctx || !b) return
      const cycleIndex = Math.floor(step / CYCLE)
      const section = SECTIONS[cycleIndex === 0 ? 0 : ((cycleIndex - 1) % 4) + 1]
      const inCycle = step % CYCLE
      const chord = PROGRESSION[Math.floor(inCycle / STEPS_PER_CHORD)]
      const inChord = inCycle % STEPS_PER_CHORD

      if (inChord === 0) playPad(ctx, b, chord.pad, t, STEPS_PER_CHORD * EIGHTH)

      if (section.rolling) {
        playBass(ctx, b, chord.root, t, EIGHTH * 0.9, inChord % 2 === 0 ? 0.16 : 0.09)
      } else if (inChord % 8 === 0) {
        playBass(ctx, b, chord.root, t, EIGHTH * 7, 0.15)
      }

      if (section.arp) {
        const note = chord.arp[ARP_PATTERN[inChord % ARP_PATTERN.length]]
        playPluck(ctx, b, note, t, inChord % 4 === 0 ? 0.075 : 0.05)
      }

      if (section.kick && inChord % 4 === 0) playKick(ctx, b, t)

      if (section.melody) {
        const hit = MELODY.find(([s]) => s === inCycle)
        if (hit) playBell(ctx, b, hit[1], t, hit[2] * EIGHTH)
      }
    },
    [playPad, playBass, playPluck, playKick, playBell],
  )

  const startScheduler = useCallback(() => {
    const ctx = ctxRef.current
    const s = schedRef.current
    if (!ctx || s.timer) return
    s.next = Math.max(s.next, ctx.currentTime + 0.08)
    s.timer = setInterval(() => {
      while (s.next < ctx.currentTime + 0.25) {
        scheduleStep(s.step, s.next)
        s.step++
        s.next += EIGHTH
      }
    }, 40)
  }, [scheduleStep])

  const stopScheduler = useCallback(() => {
    const s = schedRef.current
    if (s.timer) clearInterval(s.timer)
    s.timer = null
  }, [])

  const startAmbient = useCallback(() => {
    const ctx = ensure()
    if (!ctx || !masterRef.current) return
    if (ctx.state === "suspended") void ctx.resume()
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    startScheduler()
    const now = ctx.currentTime
    const g = masterRef.current.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(MASTER, now + 3)
    if (sfxRef.current) sfxRef.current.gain.setValueAtTime(0.9, now)
    enabledRef.current = true
    setEnabled(true)
  }, [ensure, startScheduler])

  const mute = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !masterRef.current) return
    const now = ctx.currentTime
    const g = masterRef.current.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(0, now + 0.6)
    if (sfxRef.current) sfxRef.current.gain.setValueAtTime(0, now)
    stopTimerRef.current = setTimeout(stopScheduler, 700)
    enabledRef.current = false
    setEnabled(false)
  }, [stopScheduler])

  const toggle = useCallback(() => {
    if (enabledRef.current) mute()
    else startAmbient()
  }, [mute, startAmbient])

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

  // background tabs throttle timers, which would make the music stutter — pause instead
  useEffect(() => {
    const onVisibility = () => {
      const ctx = ctxRef.current
      if (!ctx) return
      if (document.hidden) void ctx.suspend()
      else if (enabledRef.current) void ctx.resume()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      stopScheduler()
    }
  }, [stopScheduler])

  return <AudioCtx.Provider value={{ enabled, toggle, startAmbient }}>{children}</AudioCtx.Provider>
}
