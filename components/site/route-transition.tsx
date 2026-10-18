"use client"

import type { CSSProperties } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { markTransition } from "@/lib/transition-state"

const BEATS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/car": "Our Car",
  "/journey": "Journey",
  "/sponsors": "Sponsors",
  "/contact": "Contact",
}

const BANDS = ["var(--ember)", "var(--flame)", "var(--crimson)", "var(--steel)"]

const DURATION = 1600

function RaceCar() {
  return (
    <svg viewBox="0 0 240 80" className="h-auto w-56 md:w-80" aria-hidden>
      <rect x="0" y="18" width="30" height="6" rx="1" fill="var(--crimson)" />
      <rect x="8" y="24" width="6" height="26" fill="var(--crimson)" />
      <path
        d="M10 52 L42 44 L94 40 L118 29 L152 29 L170 40 L220 44 L234 52 L228 58 L16 58 Z"
        fill="var(--ember)"
      />
      <path d="M122 32 L148 32 L158 40 L116 40 Z" fill="var(--background)" />
      <rect x="44" y="50" width="160" height="3" fill="var(--steel)" />
      <rect x="206" y="56" width="34" height="4" rx="1" fill="var(--crimson)" />
      <g className="wheel">
        <circle cx="54" cy="58" r="14" fill="var(--background)" stroke="var(--foreground)" strokeWidth="2.5" />
        <path d="M54 48 V68 M44 58 H64" stroke="var(--muted-foreground)" strokeWidth="2" />
      </g>
      <g className="wheel">
        <circle cx="186" cy="59" r="13" fill="var(--background)" stroke="var(--foreground)" strokeWidth="2.5" />
        <path d="M186 50 V68 M177 59 H195" stroke="var(--muted-foreground)" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function RouteTransition() {
  const pathname = usePathname()
  const [play, setPlay] = useState(false)
  const [tick, setTick] = useState(0)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    markTransition(DURATION)
    setTick((t) => t + 1)
    setPlay(true)
    const id = setTimeout(() => setPlay(false), DURATION)
    return () => clearTimeout(id)
  }, [pathname])

  const label = BEATS[pathname] ?? BEATS["/"]

  return (
    <div key={tick} aria-hidden className={`route-tx ${play ? "is-playing" : ""}`}>
      <div className="veil" />
      <div className="bands">
        {BANDS.map((color, i) => (
          <span key={color} className="band" style={{ background: color, ["--i" as string]: i } as CSSProperties} />
        ))}
      </div>
      <div className="track">
        <div className="car">
          <span className="speed-line" style={{ top: "38%", width: "5rem" }} />
          <span className="speed-line" style={{ top: "58%", width: "8rem" }} />
          <span className="speed-line" style={{ top: "76%", width: "4rem" }} />
          <RaceCar />
        </div>
        <span className="tx-label font-display text-3xl uppercase tracking-[0.12em] text-foreground md:text-4xl">
          {label}
        </span>
      </div>
    </div>
  )
}
