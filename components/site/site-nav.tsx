"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { NAV } from "@/lib/nav"
import { LogoMark } from "./logo"
import { useSiteAudio } from "@/components/audio/audio-provider"

const BRAND = "ICARUS".split("")

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

  // only touch overflow while the menu is open, so it never unlocks the home intro
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${
        scrolled || open
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="group flex items-center gap-3">
          {/* reserved logo slot */}
          <span className="nav-mark flex h-9 w-9 items-center justify-center border border-border/70 bg-navy-deep/60 transition-[border-color,box-shadow] duration-300">
            <LogoMark className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="relative overflow-hidden font-display text-2xl uppercase tracking-[0.16em] text-foreground">
              <span className="sr-only">Icarus</span>
              <span aria-hidden>
                {BRAND.map((ch, i) => (
                  <span key={i} className="nav-letter" style={{ animationDelay: `${300 + i * 55}ms` }}>
                    {ch}
                  </span>
                ))}
              </span>
              <span aria-hidden className="nav-glint">
                ICARUS
              </span>
            </span>
            <span className="nav-sub font-sans text-[0.55rem] uppercase tracking-[0.42em] text-muted-foreground">
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
    </header>

      {/* mobile overlay — kept outside the header so it truly covers the viewport */}
      <div
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background pb-10 transition-opacity duration-500 md:hidden ${
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
                  transitionProperty: "opacity, transform",
                  transitionDuration: "500ms",
                  transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                  transform: open ? "translateY(0)" : "translateY(16px)",
                  opacity: open ? 1 : 0,
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
    </>
  )
}
