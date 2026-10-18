"use client"

import Link from "next/link"
import { memo, useCallback, useEffect, useRef, useState, type MutableRefObject } from "react"
import { Canvas } from "@react-three/fiber"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { Scene } from "./scene"
import { IntroLoader } from "./intro-loader"
import { useSiteAudio } from "@/components/audio/audio-provider"

type Phase = "loading" | "gate" | "reveal" | "done"

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
const STRIPES = [
  { color: "var(--ember)", grow: 4 },
  { color: "var(--flame)", grow: 3 },
  { color: "var(--crimson)", grow: 2 },
  { color: "var(--steel)", grow: 1.2 },
]

function HeroCopy() {
  return (
    <div className="max-w-3xl md:max-w-[min(48rem,54%)] lg:max-w-[min(44rem,50%)]">
      <div
        className="hero-in flex items-center gap-4 font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ember"
        style={{ animationDelay: "0ms" }}
      >
        <span className="h-px w-10 shrink-0 bg-ember/70" />
        <span className="text-balance">STEM Racing · Team Icarus</span>
      </div>

      <p
        className="hero-in script-lift mt-6 font-script text-5xl leading-[0.9] md:mt-5 md:text-[clamp(2.75rem,min(4.6vw,7.5svh),4.5rem)]"
        style={{ animationDelay: "250ms" }}
      >
        the rising of
      </p>

      <div className="relative mt-1 inline-flex flex-col">
        <h1 className="wordmark-glow wordmark-ignite relative whitespace-nowrap font-display text-[clamp(4rem,19vw,15rem)] uppercase md:text-[clamp(5rem,min(11vw,17svh),11rem)] leading-[0.8] tracking-[0.02em]" style={{ animationDelay: "380ms, 2300ms" }}>
          ICARUS
          <span aria-hidden className="wordmark-sheen">
            ICARUS
          </span>
        </h1>

        <div className="mt-4 flex w-full items-center gap-2 pl-1 pr-2 md:gap-3" aria-hidden>
          {STRIPES.map((s, i) => (
            <span
              key={s.color}
              className="hero-stripe h-1.5 md:h-2"
              style={{ background: s.color, flexGrow: s.grow, animationDelay: `${1300 + i * 90}ms` }}
            />
          ))}
        </div>
      </div>

      <p
        className="hero-in mt-6 max-w-xl text-pretty text-base leading-relaxed text-foreground/85 md:text-lg"
        style={{ animationDelay: "1500ms" }}
      >
        Five students, one garage, and a car built to catch light and not get burned. This is our
        run at the STEM Racing world finals.
      </p>

      <div className="hero-in mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: "1700ms" }}>
        <Link
          href="/car"
          className="cta-cut group inline-flex min-h-11 items-center gap-2 bg-ember py-3 pl-7 pr-9 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)]"
        >
          Meet the car
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/about"
          className="group inline-flex min-h-11 items-center gap-2 rounded-sm border border-steel/50 px-7 py-3 font-sans text-xs uppercase tracking-[0.24em] text-foreground transition-colors hover:border-steel hover:text-steel"
        >
          Our story
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  )
}

/* Memoized so the per-frame overlay progress state never re-renders the WebGL
   tree (re-renders were recompiling post effects and causing flicker). */
const SunCanvas = memo(function SunCanvas({
  progressRef,
  entered,
}: {
  progressRef: MutableRefObject<number>
  entered: boolean
}) {
  return (
    <div className="absolute inset-0 bg-navy-deep">
      <Canvas
        className="absolute inset-0"
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: false, powerPreference: "default", alpha: false, stencil: false }}
        dpr={[1, 1.5]}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
        camera={{ position: [0, 0.2, 3.4], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05070f", 1)
          // let the browser restore a dropped context instead of leaving a black frame
          gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false)
        }}
      >
        <Scene progressRef={progressRef} entered={entered} />
      </Canvas>
    </div>
  )
})

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
  const showCopy = entered && p > 0.5

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <SunCanvas progressRef={progressRef} entered={entered} />

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
          className="vertical-rl absolute left-8 top-1/2 hidden -translate-y-1/2 font-sans text-[0.62rem] uppercase tracking-[0.5em] text-muted-foreground transition-opacity duration-500 2xl:block"
          style={{ opacity: copyOpacity }}
        >
          STEM Racing World Finals · 2025
        </span>
      )}

      {/* landing hero copy */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-16 md:justify-center md:px-10 md:pb-16 md:pt-28 lg:px-12">
        {showCopy && <HeroCopy />}
      </div>

      {/* poster-style credits */}
      {entered && (
        <div
          className="pointer-events-none absolute bottom-6 right-8 hidden flex-col items-end gap-1 text-right transition-opacity duration-500 lg:flex"
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
