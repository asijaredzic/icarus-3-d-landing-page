import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Experience } from "@/components/icarus/experience"
import { Reveal } from "@/components/site/reveal"

const STATS = [
  { value: "0.98", unit: "sec", label: "Best track time" },
  { value: "78", unit: "km/h", label: "Top speed" },
  { value: "20", unit: "m", label: "Race distance" },
  { value: "5", unit: "crew", label: "Students, one team" },
]

const SECTIONS = [
  { href: "/about", label: "The Crew", desc: "Five students, one classroom turned workshop." },
  { href: "/car", label: "The Car", desc: "Helios Mk-III — machined, sanded and tuned by us." },
  { href: "/journey", label: "The Build", desc: "From a napkin sketch to the STEM Racing grid." },
  { href: "/sponsors", label: "The Backers", desc: "Led by SCHOOL & SCHOOL, who believed first." },
]

export default function Home() {
  return (
    <>
      <Experience />

      {/* manifesto */}
      <section className="relative mx-auto w-full max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.42em] text-steel">Who we are</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 max-w-4xl text-balance font-display text-[clamp(1.8rem,4.6vw,3.6rem)] uppercase leading-[1.02] tracking-tight">
            We&apos;re a school team that took the oldest warning in the sky and made it a{" "}
            <span className="font-script text-ember normal-case">promise</span> — fly closer to the
            sun than anyone, and come back <span className="text-stroke-steel">faster</span>.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            No sponsors&apos; head office, no pro workshop — just five of us, a design brief, a block
            of foam and a CO2 canister. STEM Racing gave us the track. SCHOOL &amp; SCHOOL gave us
            the room to build in.
          </p>
        </Reveal>

        {/* stats */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/40 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="bg-background/60">
              <div className="flex h-full flex-col justify-between p-6 backdrop-blur-sm">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl leading-none tracking-tight text-foreground md:text-6xl">
                    {s.value}
                  </span>
                  <span className="font-sans text-xs uppercase tracking-widest text-ember">{s.unit}</span>
                </div>
                <span className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  {s.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* section hub */}
      <section className="relative mx-auto w-full max-w-7xl px-6 pb-28 md:px-10">
        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((d, i) => (
            <Reveal key={d.href} delay={i * 80}>
              <Link
                href={d.href}
                className="group relative flex items-end justify-between overflow-hidden rounded-sm border border-border/60 bg-navy/20 p-8 transition-colors hover:border-ember/50"
              >
                <div>
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-3xl uppercase tracking-wide text-foreground transition-colors group-hover:text-ember md:text-4xl">
                    {d.label}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">{d.desc}</p>
                </div>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-steel transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ember" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
