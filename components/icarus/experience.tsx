"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { Scene } from "./scene"
import { useSiteAudio } from "@/components/audio/audio-provider"

const RING = 2 * Math.PI * 52 // circumference of the ignition ring

type Phase = "loading" | "gate" | "reveal" | "done"

/* ---------------- loading screen (ignition) ---------------- */
function IntroLoader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [hide, setHide] = useState(false)

  useEffect(() => {
    let raf = 0
    const startTime = performance.now()
    const dur = 1900
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / dur, 1)
      // easeOutCubic for a lovely settle at 100
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setHide(true)
          setTimeout(onDone, 720)
        }, 260)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-navy-deep transition-opacity duration-700 ${
        hide ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* soft ember glow behind the ring (circular, no box artifact) */}
        <span
          aria-hidden
          className="pointer-events-none absolute h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--ember) 26%, transparent) 0%, transparent 68%)" }}
        />
        <svg viewBox="0 0 120 120" className="absolute inset-6 -rotate-90">
          <circle cx="60" cy="60" r="52" stroke="var(--border)" strokeWidth="2" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="var(--ember)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - count / 100)}
            style={{ filter: "drop-shadow(0 0 8px var(--ember))" }}
          />
        </svg>
        <span className="font-display text-5xl tracking-tight text-foreground tabular-nums">{count}</span>
      </div>
      <p className="mt-8 font-script text-3xl text-ember">Icarus</p>
      <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.6em] text-muted-foreground">
        Ignition Sequence
      </p>
    </div>
  )
}

/* ---------------- enter gate (at the surface of the sun) ---------------- */
function EnterGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="enter-gate pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(4,6,14,0.72) 0%, rgba(4,6,14,0.4) 45%, transparent 72%)" }}
      />
      <p className="relative font-sans text-[0.6rem] uppercase tracking-[0.55em] text-ember">Too close to the sun</p>
      <button
        type="button"
        onClick={onEnter}
        className="enter-btn pointer-events-auto mt-8"
        aria-label="Enter the experience"
      >
        <span className="enter-ring" />
        <span className="enter-ring two" />
        Enter
      </button>
      <p className="mt-8 max-w-xs font-sans text-[0.62rem] leading-relaxed uppercase tracking-[0.32em] text-muted-foreground">
        Pull away from the light
      </p>
    </div>
  )
}

/* ---------------- landing hero copy (revealed after the pull-away) ---------------- */
function HeroCopy() {
  const letters = "ICARUS".split("")
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ember">
        <span className="h-px w-10 bg-ember/60" />
        STEM Racing · Team Icarus
      </div>

      <p className="mt-5 font-script text-4xl leading-[0.8] text-ember/90 md:text-5xl">chasing the</p>

      <div className="relative -mt-1">
        <h1 className="wordmark-glow font-display text-[clamp(4rem,18vw,15rem)] uppercase leading-[0.78] tracking-[0.02em]">
          {letters.map((c, i) => (
            <span key={i} className="letter" style={{ animationDelay: `${120 + i * 70}ms` }}>
              {c}
            </span>
          ))}
        </h1>
      </div>

      <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-foreground/80 md:text-lg">
        Five students, one garage, and a car built to catch light and not get burned. This is our
        run at the STEM Racing world finals.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/car"
          className="group inline-flex items-center gap-2 rounded-sm bg-ember px-7 py-3 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)]"
        >
          Meet the car
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/about"
          className="group inline-flex items-center gap-2 rounded-sm border border-steel/50 px-7 py-3 font-sans text-xs uppercase tracking-[0.24em] text-foreground transition-colors hover:border-steel hover:text-steel"
        >
          Our story
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  )
}

export function Experience() {
  const [phase, setPhase] = useState<Phase>("loading")
  const [p, setP] = useState(0) // pull-away progress for overlays (0 surface → 1 settled)
  const progressRef = useRef(0) // read by the R3F scene every frame

  const audio = useSiteAudio()
  const enterDone = useCallback(() => setPhase("gate"), [])
  const onEnter = useCallback(() => {
    audio.startAmbient()
    setPhase("reveal")
  }, [audio])

  // lock the page until the one-time pull-away has finished
  useEffect(() => {
    const locked = phase === "loading" || phase === "gate" || phase === "reveal"
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  // one-time timed pull-away — plays automatically on enter, then locks in place
  useEffect(() => {
    if (phase !== "reveal") return
    let raf = 0
    const start = performance.now()
    const dur = 2800
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      progressRef.current = eased
      setP(eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        progressRef.current = 1
        setP(1)
        setPhase("done")
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const entered = phase === "reveal" || phase === "done"
  const copyOpacity = Math.min(1, Math.max(0, (p - 0.42) / 0.34))
  const showCopy = entered && p > 0.42

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          className="absolute inset-0"
          style={{ position: "absolute", inset: 0 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 2]}
          camera={{ position: [0, 0.2, 3.4], fov: 45 }}
        >
          <Scene progressRef={progressRef} entered={entered} />
        </Canvas>
      </div>

      {/* legibility washes — only meaningful once the hero has settled */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: copyOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-transparent to-transparent" />
      </div>

      {/* vertical side label */}
      {entered && (
        <span
          className="vertical-rl absolute left-6 top-1/2 hidden -translate-y-1/2 font-sans text-[0.62rem] uppercase tracking-[0.5em] text-muted-foreground transition-opacity duration-500 md:block"
          style={{ opacity: copyOpacity }}
        >
          STEM Racing World Finals · 2025
        </span>
      )}

      {/* landing hero copy */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
        {showCopy && (
          <div style={{ opacity: copyOpacity }}>
            <HeroCopy />
          </div>
        )}
      </div>

      {/* poster-style credits */}
      {entered && (
        <div
          className="pointer-events-none absolute bottom-6 right-6 hidden flex-col items-end gap-1 text-right transition-opacity duration-500 md:flex"
          style={{ opacity: copyOpacity }}
        >
          <span className="font-sans text-[0.58rem] uppercase tracking-[0.34em] text-muted-foreground">
            Designed &amp; built by Team Icarus
          </span>
          <span className="font-sans text-[0.58rem] uppercase tracking-[0.34em] text-muted-foreground">
            A <span className="text-steel">School &amp; School</span> project · MMXXV
          </span>
        </div>
      )}

      {phase === "gate" && <EnterGate onEnter={onEnter} />}
      {phase === "loading" && <IntroLoader onDone={enterDone} />}
    </section>
  )
}
