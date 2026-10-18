import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { Car3DViewer } from "@/components/site/car-3d-viewer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const SPECS = [
  { value: "0.98", unit: "sec", label: "Best track time" },
  { value: "78", unit: "km/h", label: "Scale top speed" },
  { value: "1", unit: "block", label: "Machined from a single block" },
  { value: "CFD", unit: "sim", label: "Shaped in simulations" },
]

const BUILD_NOTES = [
  {
    title: "Slimmed in CFD",
    desc: "Every surface was pushed through simulations until the drag curve stopped moving. If the sim disagreed with the eye, the sim won.",
  },
  {
    title: "Lighter wheels",
    desc: "Rotating mass costs more than static mass, so we cut every gram out of the rims we could get away with.",
  },
  {
    title: "Cleaner airline",
    desc: "The tether is the quiet tenth: we re-routed the airline off the body so it stops fighting the car down the track.",
  },
  {
    title: "Finish by hand",
    desc: "Sanded, primed, painted — the paint is the last thing we'd ever cut, because if it's going to be quick it should look quick.",
  },
]

export default function CarPage() {
  return (
    <PageShell
      index="02"
      eyebrow="Our Cars"
      title="Helios"
      stroke="Mk-III"
      intro="Our STEM Racing car: a CO2-powered prototype machined from a single block, shaped in CFD and finished by hand. Spin it, turn it, look at it from every angle — this is the car as it sits on the bench today."
    >
      {/* interactive 3D model */}
      <Reveal className="mt-16">
        <Car3DViewer />
      </Reveal>

      {/* asset note: what is needed for the real scan */}
      <Reveal className="mt-8">
        <p className="max-w-3xl border-l border-ember/50 pl-4 text-sm leading-relaxed text-muted-foreground">
          Note: this is a real-time stand-in model of the Helios Mk-III. To swap in
          the exact car, we need a scanned or exported GLB of the prototype
          (glTF binary, under 5&nbsp;MB, +Y up, decimated under 100k triangles) —
          drop it in and it loads straight into this viewer with photos as the
          fallback.
        </p>
      </Reveal>

      {/* specs */}
      <Reveal className="mt-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/40 md:grid-cols-4">
          {SPECS.map((s) => (
            <div key={s.label} className="bg-navy/20 p-6 backdrop-blur-sm">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl leading-none tracking-tight md:text-5xl">{s.value}</span>
                <span className="font-sans text-xs uppercase tracking-widest text-ember">{s.unit}</span>
              </div>
              <span className="mt-5 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* prototype status */}
      <Reveal className="mt-16">
        <div className="rounded-sm border border-ember/40 bg-navy/20 p-6 md:p-8">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-ember">Status · Prototype</span>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-wide md:text-4xl">
            One car, still on the bench
          </h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Right now we only have our Formula prototype. We&apos;re testing it and refining the design
            before we commit to a final race car.
          </p>
        </div>
      </Reveal>

      {/* build notes */}
      <Reveal className="mt-16">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.42em] text-steel">How we chased the tenths</span>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {BUILD_NOTES.map((n, i) => (
            <div key={n.title} className="rounded-sm border border-border/60 bg-navy/20 p-6 transition-colors hover:border-ember/40">
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">0{i + 1}</span>
              <h3 className="mt-2 font-display text-2xl uppercase tracking-wide">{n.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CTA to journey */}
      <Reveal className="mt-16">
        <Link
          href="/journey"
          className="cta-cut group inline-flex min-h-11 items-center gap-2 bg-ember py-3 pl-7 pr-9 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)]"
        >
          See the full build story
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </PageShell>
  )
}
