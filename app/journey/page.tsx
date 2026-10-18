import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Check, Loader } from "lucide-react"

const STEPS = [
  {
    phase: "01",
    title: "The brief",
    body: "A blank design folder and a box of regulations. We sketched wildly, argued a lot, and picked a shape that felt fast on paper.",
    status: "done" as const,
  },
  {
    phase: "02",
    title: "CAD & CFD",
    body: "Weeks in the modelling software. Every curve tested in airflow simulation until the numbers finally started dropping.",
    status: "done" as const,
  },
  {
    phase: "03",
    title: "Made real",
    body: "The block goes into the machine, the body comes out. Sanding, priming, and the first time it actually looks like a car.",
    status: "in-progress" as const,
  },
  {
    phase: "04",
    title: "The look",
    body: "Livery, portfolio, pit display and this site. The Icarus identity built to match how the car wants to move.",
    status: "in-progress" as const,
  },
  {
    phase: "05",
    title: "Race day",
    body: "Twenty metres, one canister, under a second of pure nerves. Then straight back to the bench to find the next tenth.",
    status: "todo" as const,
  },
]

function StatusChip({ status }: { status: "done" | "in-progress" | "todo" }) {
  const map = {
    done: { label: "Done", icon: Check, classes: "border-ember/50 text-ember" },
    "in-progress": { label: "In progress", icon: Loader, classes: "border-steel/60 text-steel" },
    todo: { label: "Ahead", icon: ArrowRight, classes: "border-border/80 text-muted-foreground" },
  }
  const { label, icon: Icon, classes } = map[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[0.58rem] uppercase tracking-[0.26em] ${classes}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export default function JourneyPage() {
  return (
    <PageShell
      index="03"
      eyebrow="The Build"
      title="Sketch"
      stroke="to Start line"
      intro="We're still preparing everything. The prototype is in testing, and these are the steps we're working through before race day."
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
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <h3 className="font-display text-3xl uppercase tracking-wide text-foreground transition-colors group-hover:text-ember md:text-4xl">
                    {s.title}
                  </h3>
                  <StatusChip status={s.status} />
                </div>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* closing */}
      <Reveal className="mt-14">
        <p className="max-w-xl font-script text-3xl text-ember">Still preparing. More soon.</p>
      </Reveal>

      <Reveal className="mt-10">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/car"
            className="cta-cut group inline-flex min-h-11 items-center gap-2 bg-ember py-3 pl-7 pr-9 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)]"
          >
            Meet the car
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/sponsors"
            className="group inline-flex min-h-11 items-center gap-2 rounded-sm border border-steel/50 px-7 py-3 font-sans text-xs uppercase tracking-[0.24em] text-foreground transition-colors hover:border-steel hover:text-steel"
          >
            Back the team
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Reveal>
    </PageShell>
  )
}
