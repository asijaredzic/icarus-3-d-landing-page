import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { Gauge, Wind, Feather, Timer } from "lucide-react"

// Kept intentionally light — a few honest numbers, not a spec sheet.
const SPECS = [
  { icon: Timer, k: "Track time", v: "0.98", u: "sec / 20 m" },
  { icon: Gauge, k: "Top speed", v: "78", u: "km/h" },
  { icon: Feather, k: "Race weight", v: "54", u: "grams" },
  { icon: Wind, k: "Drag coeff.", v: "0.21", u: "Cd (CFD)" },
]

export default function CarPage() {
  return (
    <PageShell
      index="02"
      eyebrow="The Car"
      title="Helios"
      stroke="Mk-III"
      intro="Our STEM Racing car: a CO2-powered model machined from a single block, shaped in CFD and finished by hand. Small enough to hold, obsessive enough to keep us up at night."
    >
      {/* hero image */}
      <Reveal className="mt-16">
        <div className="relative overflow-hidden rounded-sm border border-border/60 bg-navy/20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/20 blur-3xl" />
          <img
            src="/solar-car.png"
            alt="Helios Mk-III STEM Racing car"
            className="animate-float-slow relative mx-auto w-full max-w-3xl px-8 py-14"
          />
          <span className="absolute bottom-5 left-6 font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
            Helios Mk-III · Car No. 003
          </span>
        </div>
      </Reveal>

      {/* a few specs */}
      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {SPECS.map((s, i) => {
          const Icon = s.icon
          return (
            <Reveal key={s.k} delay={i * 70}>
              <div className="group h-full rounded-sm border border-border/60 bg-background/50 p-6 transition-colors hover:border-ember/50">
                <Icon className="h-6 w-6 text-steel transition-colors group-hover:text-ember" />
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl tracking-tight text-foreground md:text-5xl">{s.v}</span>
                  <span className="font-sans text-[0.6rem] uppercase tracking-widest text-ember">{s.u}</span>
                </div>
                <p className="mt-2 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">{s.k}</p>
              </div>
            </Reveal>
          )
        })}
      </div>

      {/* short narrative */}
      <Reveal className="mt-16">
        <div className="max-w-2xl">
          <p className="text-pretty leading-relaxed text-muted-foreground">
            The brief is simple and brutal: fastest car down the track wins. So we chased the tenths
            everywhere — a slimmer body in CFD, lighter wheels, a cleaner airline off the tether. The
            paint is the last thing we&apos;d ever cut, because if it&apos;s going to be quick, it
            should look quick too.
          </p>
        </div>
      </Reveal>
    </PageShell>
  )
}
