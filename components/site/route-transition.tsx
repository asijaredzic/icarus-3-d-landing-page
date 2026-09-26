"use client"

import type { CSSProperties, ReactElement } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

// Each route wipes in with a self-drawing line illustration from the Icarus
// myth and a matching "chapter" beat. Two panels close over the screen, an
// ember horizon flares along the seam, the motif draws itself, then it all
// pulls away.

const BEATS: Record<string, { tag: string; title: string }> = {
  "/": { tag: "Prologue", title: "The Workshop" },
  "/about": { tag: "Chapter I", title: "The Makers" },
  "/car": { tag: "Chapter II", title: "The Wings" },
  "/journey": { tag: "Chapter III", title: "The Flight" },
  "/sponsors": { tag: "Chapter IV", title: "Those Who Lift Us" },
  "/contact": { tag: "Chapter V", title: "The Call" },
}

const draw = (i: number) =>
  ({
    "data-draw": true,
    pathLength: 1,
    style: { ["--d" as string]: `${(i * 0.07).toFixed(2)}s` } as CSSProperties,
  }) as const

function Motif({ pathname }: { pathname: string }) {
  const common = {
    fill: "none",
    stroke: "var(--ember)",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  const glow = { filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--ember) 70%, transparent))" }

  let content: ReactElement

  if (pathname.startsWith("/about")) {
    // two mirrored wings taking shape
    content = (
      <g {...common}>
        <path {...draw(0)} d="M110 74 L110 122" />
        <path {...draw(1)} d="M110 90 C82 74 58 76 36 92" />
        <path {...draw(2)} d="M110 98 C84 86 62 90 44 106" />
        <path {...draw(3)} d="M110 106 C88 98 70 102 54 118" />
        <path {...draw(1)} d="M110 90 C138 74 162 76 184 92" />
        <path {...draw(2)} d="M110 98 C136 86 158 90 176 106" />
        <path {...draw(3)} d="M110 106 C132 98 150 102 166 118" />
      </g>
    )
  } else if (pathname.startsWith("/car")) {
    // a single engineered wing
    content = (
      <g {...common}>
        <path {...draw(0)} d="M42 66 C88 70 150 88 196 132" />
        <path {...draw(1)} d="M72 72 L64 100" />
        <path {...draw(2)} d="M98 80 L90 112" />
        <path {...draw(3)} d="M124 92 L116 126" />
        <path {...draw(4)} d="M150 106 L142 140" />
        <path {...draw(5)} d="M176 122 L169 152" />
      </g>
    )
  } else if (pathname.startsWith("/journey")) {
    // the flight arc toward the sun
    content = (
      <g {...common}>
        <path {...draw(0)} d="M22 158 Q 110 -8 198 158" />
        <circle {...draw(2)} cx={110} cy={42} r={13} />
        <path {...draw(3)} d="M64 116 C60 110 55 110 50 114" />
        <path {...draw(3)} d="M78 116 C82 110 87 110 92 114" />
        <circle {...draw(4)} cx={71} cy={116} r={3.4} />
      </g>
    )
  } else if (pathname.startsWith("/sponsors")) {
    // updrafts / thermals that lift the flight
    content = (
      <g {...common}>
        <path {...draw(0)} d="M62 162 C52 132 76 118 64 88 C56 68 72 56 64 34" />
        <path {...draw(1)} d="M110 166 C100 134 124 120 112 88 C104 66 120 54 112 30" />
        <path {...draw(2)} d="M158 162 C148 132 172 118 160 88 C152 68 168 56 160 34" />
      </g>
    )
  } else if (pathname.startsWith("/contact")) {
    // the radiant sun — the call
    content = (
      <g {...common}>
        <circle {...draw(0)} cx={110} cy={92} r={28} />
        <path {...draw(1)} d="M150 92 L170 92" />
        <path {...draw(1)} d="M70 92 L50 92" />
        <path {...draw(2)} d="M110 52 L110 32" />
        <path {...draw(2)} d="M110 132 L110 152" />
        <path {...draw(3)} d="M138 64 L152 50" />
        <path {...draw(3)} d="M82 64 L68 50" />
        <path {...draw(4)} d="M138 120 L152 134" />
        <path {...draw(4)} d="M82 120 L68 134" />
      </g>
    )
  } else {
    // home — the blueprint: a drafting arc, compass, and a small sun
    content = (
      <g {...common}>
        <path {...draw(0)} d="M28 152 A 118 118 0 0 1 192 60" />
        <path {...draw(1)} d="M110 40 L70 150" />
        <path {...draw(2)} d="M110 40 L150 150" />
        <path {...draw(3)} d="M70 150 L150 150" />
        <circle {...draw(4)} cx={110} cy={40} r={8} />
      </g>
    )
  }

  return (
    <svg viewBox="0 0 220 190" className="h-40 w-48 md:h-52 md:w-60" style={glow} aria-hidden>
      {content}
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
    setTick((t) => t + 1)
    setPlay(true)
    const id = setTimeout(() => setPlay(false), 1500)
    return () => clearTimeout(id)
  }, [pathname])

  const beat = BEATS[pathname] ?? BEATS["/"]

  return (
    <div key={tick} aria-hidden className={`route-tx ${play ? "is-playing" : ""}`}>
      <div className="panel panel-top" />
      <div className="panel panel-bottom" />
      <span className="horizon" />
      <div className="myth">
        <div className="flex flex-col items-center gap-5">
          <Motif pathname={pathname} />
          <div className="beat flex flex-col items-center gap-1.5">
            <span className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-ember">{beat.tag}</span>
            <span className="font-display text-3xl uppercase tracking-[0.08em] text-foreground md:text-4xl">
              {beat.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
