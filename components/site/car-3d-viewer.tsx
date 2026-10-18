"use client"

import { Suspense, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Canvas } from "@react-three/fiber"
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei"
import { Move, RotateCcw } from "lucide-react"
import { CarModel } from "./car-model"

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    )
  } catch {
    return false
  }
}

function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center" role="status" aria-label="Loading 3D car model">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ember/30 border-t-ember" />
    </div>
  )
}

function FallbackPoster() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-navy/20 px-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/car/angle.jpeg"
        alt="Helios Mk-III prototype photographed from a low front angle"
        className="h-44 w-44 rounded-sm object-cover sm:h-56 sm:w-56"
      />
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        The interactive 3D model needs WebGL or a faster connection. Here is the
        prototype in the meantime — tap through the photos below.
      </p>
    </div>
  )
}

const SWIPE_THRESHOLD = 40

export function Car3DViewer() {
  const [ready, setReady] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [hinted, setHinted] = useState(false)
  const [dataSaver, setDataSaver] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    setWebgl(supportsWebGL())
    setReady(true)
    if (typeof navigator !== "undefined" && (navigator as { connection?: { saveData?: boolean } }).connection?.saveData) {
      setDataSaver(true)
    }
  }, [])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragStart.current !== null) setDragOffset(e.clientX - dragStart.current)
  }

  function endDrag() {
    if (dragStart.current === null) return
    if (dragOffset <= -SWIPE_THRESHOLD) setHinted(true)
    else if (dragOffset >= SWIPE_THRESHOLD) setHinted(true)
    dragStart.current = null
    setDragOffset(0)
  }

  if (!ready) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border/60 bg-navy/20 sm:aspect-[16/9]">
        <Spinner />
      </div>
    )
  }

  if (!webgl || dataSaver) {
    return (
      <div className="w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border/60 bg-navy/20 sm:aspect-[16/9]">
          <FallbackPoster />
        </div>
        <PhotoStrip />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="region"
        aria-label="Interactive 3D model of the Helios Mk-III — drag to rotate"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHinted(true)
          if (e.key === "ArrowLeft") setHinted(true)
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-sm border border-border/60 bg-navy/20 outline-none transition-colors focus-visible:border-ember sm:aspect-[16/9]"
      >
        <Canvas
          camera={{ position: [2.6, 1.1, 2.6], fov: 40 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#070d20", 1)
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false)
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 2]} intensity={1.4} color="#ffe6c4" />
          <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#4a6fd6" />
          <Suspense fallback={null}>
            <CarModel />
            <ContactShadows position={[0, 0.001, 0]} opacity={0.55} blur={2.4} scale={4} />
            <Environment preset="night" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!hinted}
            autoRotateSpeed={0.9}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.9}
            dampingFactor={0.08}
          />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-12">
          <span className="flex items-center gap-1.5 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            <Move className="h-3.5 w-3.5" aria-hidden="true" />
            Drag to rotate · Pinch to zoom
          </span>
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-foreground">
            Helios Mk-III · 3D
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
          Real-time model · Rotate freely
        </p>
        <button
          type="button"
          onClick={() => setHinted(false)}
          className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border/60 px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-foreground transition-colors hover:border-ember hover:text-ember"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset view
        </button>
      </div>
    </div>
  )
}

function PhotoStrip() {
  const PHOTOS = [
    { src: "/car/angle.jpeg", alt: "Helios Mk-III from a low front angle, nose and front wing in focus" },
    { src: "/car/front.jpeg", alt: "Helios Mk-III head-on, showing front wing, cockpit and rear wing" },
    { src: "/car/top.jpeg", alt: "Helios Mk-III from above, showing the full body, wheels and both wings" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {PHOTOS.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.src}
          src={p.src || "/placeholder.svg"}
          alt={p.alt}
          draggable={false}
          className="aspect-[4/3] w-full rounded-sm border border-border/60 object-cover"
        />
      ))}
    </div>
  )
}
