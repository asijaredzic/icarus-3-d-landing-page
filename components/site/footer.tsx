import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { NAV } from "@/lib/nav"
import { LogoMark } from "./logo"

const TEAM_SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "LinkedIn", href: "#" },
]

const SCHOOL_SOCIALS = [
  { label: "Website", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
]

export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-border/60 bg-background/40">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-border/70 bg-navy-deep/60">
                <LogoMark className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl uppercase tracking-[0.14em]">Icarus</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A student STEM Racing team chasing the world finals on nothing but caffeine, late
              nights and an unhealthy obsession with tenths of a second.
            </p>
            <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ember">
              Funded by SCHOOL &amp; SCHOOL
            </p>
          </div>

          <div>
            <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ember">Navigate</h4>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.32em] text-steel">Team</h4>
            <ul className="mt-5 space-y-3">
              {TEAM_SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.32em] text-steel">School &amp; School</h4>
            <ul className="mt-5 space-y-3">
              {SCHOOL_SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Team Icarus · A SCHOOL &amp; SCHOOL project.
          </p>
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground/60">
            Chasing the sun · Never falling
          </p>
        </div>
      </div>

      {/* oversized ghost wordmark */}
      <div className="pointer-events-none select-none px-6 md:px-10">
        <p className="text-stroke-steel -mb-4 font-display text-[22vw] leading-none tracking-tight opacity-[0.06]">
          ICARUS
        </p>
      </div>
    </footer>
  )
}
