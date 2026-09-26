"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { NAV } from "@/lib/nav"
import { LogoMark } from "./logo"
import { useSiteAudio } from "@/components/audio/audio-provider"

function SoundToggle() {
  const { enabled, toggle } = useSiteAudio()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound" : "Play ambient sound"}
      title={enabled ? "Sound on" : "Sound off"}
      className={`sound-toggle ${enabled ? "is-on" : ""}`}
    >
      <span />
      <span />
      <span />
      <span />
    </button>
  )
}

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-border/60 bg-background/70 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="group flex items-center gap-3">
          {/* reserved logo slot */}
          <span className="flex h-9 w-9 items-center justify-center border border-border/70 bg-navy-deep/60 transition-colors group-hover:border-ember/60">
            <LogoMark className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-2xl uppercase tracking-[0.16em] text-foreground">Icarus</span>
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.42em] text-muted-foreground">
              STEM Racing
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-7">
          {/* desktop */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative font-sans text-xs uppercase tracking-[0.22em] transition-colors ${
                      active ? "text-ember" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>

          <SoundToggle />

          {/* mobile toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-ember hover:text-ember md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* mobile overlay */}
      <div
        className={`fixed inset-0 top-0 z-40 flex flex-col bg-background/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="mt-24 flex flex-col gap-2 px-8">
          {NAV.map((item, i) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li
                key={item.href}
                style={{
                  transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                  transform: open ? "translateY(0)" : "translateY(16px)",
                  opacity: open ? 1 : 0,
                  transition: "opacity .5s, transform .5s",
                }}
              >
                <Link
                  href={item.href}
                  className={`flex items-baseline justify-between border-b border-border/60 py-4 font-display text-4xl uppercase tracking-wide ${
                    active ? "text-ember" : "text-foreground"
                  }`}
                >
                  {item.label}
                  <span className="font-sans text-xs tracking-[0.3em] text-muted-foreground">0{i + 1}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </header>
  )
}
