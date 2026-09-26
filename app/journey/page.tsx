import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"

const STEPS = [
  {
    phase: "01",
    title: "The brief",
    body: "A blank design folder and a box of regulations. We sketched wildly, argued a lot, and picked a shape that felt fast on paper.",
  },
  {
    phase: "02",
    title: "CAD & CFD",
    body: "Weeks in the modelling software. Every curve tested in airflow simulation until the numbers finally started dropping.",
  },
  {
    phase: "03",
    title: "Made real",
    body: "The block goes into the machine, the body comes out. Sanding, priming, and the first time it actually looks like a car.",
  },
  {
    phase: "04",
    title: "The look",
    body: "Livery, portfolio, pit display and this site. The Icarus identity built to match how the car wants to move.",
  },
  {
    phase: "05",
    title: "Race day",
    body: "Twenty metres, one canister, under a second of pure nerves. Then straight back to the bench to find the next tenth.",
  },
]

export default function JourneyPage() {
  return (
    <PageShell
      index="03"
      eyebrow="The Build"
      title="Sketch"
      stroke="to Start line"
      intro="How a school project became a car on the STEM Racing grid — the honest, unglamorous, deeply fun version."
    >
      <div className="mt-16">
        {STEPS.map((s, i) => (
          <Reveal key={s.phase} delay={i * 70}>
            <div className="group grid gap-6 border-b border-border/50 py-10 md:grid-cols-[auto_1fr] md:gap-12">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-6xl leading-none tracking-tight text-steel/40 transition-colors group-hover:text-ember md:text-7xl">
                  {s.phase}
                </span>
              </div>
              <div className="max-w-2xl">
                <h3 className="font-display text-3xl uppercase tracking-wide text-foreground transition-colors group-hover:text-ember md:text-4xl">
                  {s.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <p className="max-w-xl font-script text-3xl text-ember">
          Still building. Always one tenth away from happy.
        </p>
      </Reveal>
    </PageShell>
  )
}
