import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { CarViewer } from "@/components/site/car-viewer"

export default function CarPage() {
  return (
    <PageShell
      index="02"
      eyebrow="The Car"
      title="Helios"
      stroke="Mk-III"
      intro="Our STEM Racing car: a CO2-powered model machined from a single block, shaped in CFD and finished by hand. Small enough to hold, obsessive enough to keep us up at night."
    >
      {/* interactive prototype viewer */}
      <Reveal className="mt-16">
        <CarViewer />
      </Reveal>

      {/* prototype status */}
      <Reveal className="mt-16">
        <div className="rounded-sm border border-ember/40 bg-navy/20 p-6 md:p-8">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-ember">Status · Prototype</span>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-wide text-foreground md:text-4xl">
            One car, still on the bench
          </h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Right now we only have our Formula prototype. We&apos;re testing it and refining the design
            before we commit to a final race car.
          </p>
        </div>
      </Reveal>

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
