import Link from "next/link"
import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { AtSign, Globe, Mail, ArrowUpRight } from "lucide-react"

const TIERS = [
  {
    tier: "Title",
    price: "The whole ascent",
    perks: ["Logo on the car & driver suit", "Name in the team title", "Front-page billing everywhere"],
    accent: true,
  },
  {
    tier: "Wing",
    price: "Major support",
    perks: ["Logo on bodywork panel", "Pit-display & portfolio credit", "Shout-outs across socials"],
    accent: false,
  },
  {
    tier: "Grid",
    price: "Fuel in the tank",
    perks: ["Name on the supporters wall", "Website credit", "Our genuine gratitude"],
    accent: false,
  },
]

export default function SponsorsPage() {
  return (
    <PageShell
      index="04"
      eyebrow="Sponsors & Backers"
      title="People who"
      stroke="believed"
      intro="A student team runs on carbon, canisters and generosity. These are the people who chose to back five kids with a fast idea."
    >
      {/* title backer */}
      <Reveal className="mt-16">
        <div className="relative overflow-hidden rounded-sm border border-ember/40 bg-navy/30 p-8 md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ember/20 blur-3xl" />
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-ember">Title backer</span>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.9] tracking-tight text-balance">
            SCHOOL &amp; SCHOOL
          </h2>
          <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            None of this exists without our school. SCHOOL &amp; SCHOOL funded the team, gave us the
            workshop, and let us turn a corner of the building into a race shop. Every tenth we find
            has their name on it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://instagram.com"
              target="_blank"
              className="group inline-flex items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-ember hover:text-ember"
            >
              <AtSign className="h-4 w-4" />
              @schoolandschool
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="https://schoolandschool.edu"
              target="_blank"
              className="group inline-flex items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-ember hover:text-ember"
            >
              <Globe className="h-4 w-4" />
              schoolandschool.edu
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* tiers */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-ember">Ways to back us</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.tier} delay={i * 80}>
              <div
                className={`flex h-full flex-col rounded-sm border p-7 transition-colors ${
                  t.accent
                    ? "border-ember/50 bg-ember/5 hover:border-ember"
                    : "border-border/60 bg-navy/20 hover:border-steel/60"
                }`}
              >
                <h3 className="font-display text-4xl uppercase tracking-wide text-foreground">{t.tier}</h3>
                <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-steel">{t.price}</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${t.accent ? "bg-ember" : "bg-steel"}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* cta */}
      <Reveal className="mt-16">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-3 rounded-sm bg-ember px-8 py-4 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)]"
        >
          <Mail className="h-4 w-4" />
          Back the team
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </Reveal>
    </PageShell>
  )
}
