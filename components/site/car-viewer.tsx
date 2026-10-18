"use client"

import { useRef, useState, type PointerEvent } from "react"
import { ChevronLeft, ChevronRight, Move } from "lucide-react"

const VIEWS = [
  { src: "/car/angle.jpeg", label: "Nose", alt: "Formula prototype seen from low in front, nose and front wing in focus" },
  { src: "/car/front.jpeg", label: "Front", alt: "Formula prototype head-on, showing front wing, cockpit and rear wing" },
  { src: "/car/top.jpeg", label: "Top", alt: "Formula prototype from above, showing the full body, wheels and both wings" },
]

const SWIPE_THRESHOLD = 40

export function CarViewer() {
  const [index, setIndex] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState(0)
  const dragStart = useRef<number | null>(null)

  const go = (dir: number) => setIndex((i) => (i + dir + VIEWS.length) % VIEWS.length)

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    if (e.pointerType === "mouse") setTilt({ x: py * -8, y: px * 10 })
    if (dragStart.current !== null) setDragOffset(e.clientX - dragStart.current)
  }

  function endDrag() {
    if (dragStart.current === null) return
    if (dragOffset <= -SWIPE_THRESHOLD) go(1)
    else if (dragOffset >= SWIPE_THRESHOLD) go(-1)
    dragStart.current = null
    setDragOffset(0)
  }

  const current = VIEWS[index]

  return (
    <div className="flex flex-col gap-4">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Formula prototype viewer"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden rounded-sm border border-border/60 bg-navy/20 outline-none focus-visible:border-ember active:cursor-grabbing [perspective:1200px]"
      >
        <div
          className="h-full w-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${dragOffset * 0.4}px) rotateX(${tilt.x}deg) rotateY(${tilt.y + dragOffset * 0.05}deg) scale(1.04)`,
          }}
        >
          {VIEWS.map((v, i) => (
            <img
              key={v.src}
              src={v.src || "/placeholder.svg"}
              alt={v.alt}
              draggable={false}
              aria-hidden={i !== index}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-12">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-foreground">
            {current.label} view · {index + 1}/{VIEWS.length}
          </span>
          <span className="flex items-center gap-1.5 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            <Move className="h-3.5 w-3.5" aria-hidden="true" />
            Drag to turn
          </span>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Previous view"
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/60 text-foreground backdrop-blur transition-colors hover:border-ember hover:text-ember"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Next view"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/60 text-foreground backdrop-blur transition-colors hover:border-ember hover:text-ember"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Choose a view">
        {VIEWS.map((v, i) => (
          <button
            key={v.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={`group relative aspect-[4/3] overflow-hidden rounded-sm border transition-colors ${
              i === index ? "border-ember" : "border-border/60 hover:border-steel"
            }`}
          >
            <img
              src={v.src || "/placeholder.svg"}
              alt=""
              draggable={false}
              className={`h-full w-full object-cover transition-opacity ${i === index ? "opacity-100" : "opacity-50 group-hover:opacity-80"}`}
            />
            <span className="absolute bottom-1.5 left-2 font-sans text-[0.55rem] uppercase tracking-[0.3em] text-foreground">
              {v.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
