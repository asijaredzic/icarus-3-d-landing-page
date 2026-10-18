"use client"

import { useEffect, useState } from "react"
import { onTransitionEnd, transitionRemaining } from "@/lib/transition-state"

const TICKS = 46
const SWEEP = 270
const START_ANGLE = 135
const REDLINE = 0.86
const ARC_R = 66
const ARC_LEN = 2 * Math.PI * ARC_R * (SWEEP / 360)

const STATUS: Array<[number, string]> = [
  [0, "Fuelling the cartridge"],
  [26, "Calibrating the wings"],
  [52, "Checking the wax"],
  [78, "Igniting"],
  [100, "Ready"],
]

const STRIPES = [
  { color: "var(--ember)", grow: 4 },
  { color: "var(--flame)", grow: 3 },
  { color: "var(--crimson)", grow: 2 },
  { color: "var(--steel)", grow: 1.2 },
]
const STRIPE_TOTAL = STRIPES.reduce((s, x) => s + x.grow, 0)

let visitedBefore = false

const polar = (angleDeg: number, r: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: 100 + Math.cos(a) * r, y: 100 + Math.sin(a) * r }
}

export function IntroLoader({ onDone }: { onDone: () => void }) {
  const [armed, setArmed] = useState(false)
  const [count, setCount] = useState(0)
  const [hide, setHide] = useState(false)

  // wait for an in-flight car transition so the two never play on top of each other
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    const id = setTimeout(() => {
      if (transitionRemaining() === 0) setArmed(true)
      else unsubscribe = onTransitionEnd(() => setArmed(true))
    }, 40)
    return () => {
      clearTimeout(id)
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!armed) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dur = reduced ? 500 : visitedBefore ? 1300 : 2300
    let raf = 0
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let doneTimer: ReturnType<typeof setTimeout> | undefined
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      setCount(Math.round(eased * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
        return
      }
      visitedBefore = true
      exitTimer = setTimeout(() => {
        setHide(true)
        doneTimer = setTimeout(onDone, 900)
      }, 420)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (exitTimer) clearTimeout(exitTimer)
      if (doneTimer) clearTimeout(doneTimer)
    }
  }, [armed, onDone])

  const p = count / 100
  const status = [...STATUS].reverse().find(([at]) => count >= at)?.[1] ?? STATUS[0][1]
  const needle = polar(START_ANGLE + SWEEP * p, ARC_R)

  let consumed = 0
  const stripeFills = STRIPES.map((s) => {
    const from = consumed / STRIPE_TOTAL
    consumed += s.grow
    const to = consumed / STRIPE_TOTAL
    return Math.min(1, Math.max(0, (p - from) / (to - from)))
  })

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading Icarus, ${count} percent`}
      className={`intro-loader fixed inset-0 z-[60] bg-navy-deep ${hide ? "is-out" : ""}`}
    >
      <div className={`loader-content flex h-full flex-col items-center justify-center px-6 ${armed ? "is-armed" : ""}`}>
        <div className="relative flex h-60 w-60 items-center justify-center">
          <span
            aria-hidden
            className="loader-glow pointer-events-none absolute inset-0 rounded-full"
            style={{ opacity: 0.35 + p * 0.65 }}
          />
          <svg viewBox="0 0 200 200" width="240" height="240" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle
              className="loader-orbit"
              cx="100"
              cy="100"
              r="97"
              fill="none"
              stroke="var(--steel)"
              strokeOpacity="0.35"
              strokeWidth="0.6"
              strokeDasharray="1 5"
            />
            {Array.from({ length: TICKS }, (_, i) => {
              const t = i / (TICKS - 1)
              const major = i % 5 === 0
              const angle = START_ANGLE + SWEEP * t
              const a = polar(angle, major ? 76 : 80)
              const b = polar(angle, 88)
              const lit = t <= p
              const red = t >= REDLINE
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={major ? 2 : 1.2}
                  strokeLinecap="round"
                  stroke={lit ? (red ? "var(--crimson)" : "var(--ember)") : "var(--border)"}
                  style={{ transition: "stroke 220ms ease" }}
                />
              )
            })}
            <circle
              cx="100"
              cy="100"
              r={ARC_R}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={`${ARC_LEN} 999`}
              transform={`rotate(${START_ANGLE} 100 100)`}
            />
            <circle
              cx="100"
              cy="100"
              r={ARC_R}
              fill="none"
              stroke="var(--ember)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LEN * p} 999`}
              transform={`rotate(${START_ANGLE} 100 100)`}
            />
            <circle cx={needle.x} cy={needle.y} r="3.2" fill="var(--foreground)" className="loader-needle" />
          </svg>

          <div className="relative flex flex-col items-center">
            <img src="/images/logo.png" alt="" width={34} height={34} className="mb-2 h-8 w-8 opacity-90" />
            <span className="font-display text-6xl leading-none tracking-tight text-foreground tabular-nums">
              {count}
            </span>
            <span className="mt-2 pl-[0.4em] font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground">
              Ignition
            </span>
          </div>
        </div>

        <div className="mt-6 flex w-56 items-center gap-1.5" aria-hidden>
          {STRIPES.map((s, i) => (
            <span
              key={s.color}
              className="relative h-1.5 overflow-hidden bg-border/60"
              style={{ flexGrow: s.grow, transform: "skewX(-24deg)" }}
            >
              <span
                className="absolute inset-0 origin-left"
                style={{ background: s.color, transform: `scaleX(${stripeFills[i]})` }}
              />
            </span>
          ))}
        </div>

        <p
          key={status}
          className="loader-status mt-5 pl-[0.42em] text-center font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ember"
        >
          {status}
        </p>
      </div>

      <div
        className={`loader-content pointer-events-none absolute inset-x-6 bottom-8 flex items-end justify-between font-sans text-[0.58rem] uppercase tracking-[0.34em] text-muted-foreground md:inset-x-10 ${armed ? "is-armed" : ""}`}
        aria-hidden
      >
        <span>
          <span className="font-script text-2xl normal-case tracking-normal text-ember">Icarus</span>
          <br />
          STEM Racing
        </span>
        <span className="text-right">
          Too close
          <br />
          to the sun
        </span>
      </div>
    </div>
  )
}
