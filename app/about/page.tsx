import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"

const CREW = [
  {
    name: "Omer",
    role: "Team Manager & Social Media Lead",
    note: "Keeps the team organised, sets deadlines, and runs our social media.",
  },
  {
    name: "Vedad",
    role: "Chief Design Engineer",
    note: "Leads the car's design, from the first sketch to the final shape.",
  },
  {
    name: "Šemsudin",
    role: "Manufacturing & CAD Engineer",
    note: "Builds the CAD models and turns them into real, printed parts.",
  },
  {
    name: "Ibrahim",
    role: "Resource Manager & Engineer",
    note: "Manages our materials and tools, and works on the engineering of the car.",
  },
  {
    name: "Asija",
    role: "Finance & Web Design Manager",
    note: "Handles the team budget and designs and maintains this website.",
  },
]

export default function AboutPage() {
  return (
    <PageShell
      index="01"
      eyebrow="The Crew"
      title="Five of us."
      stroke="One garage."
      intro="We're a STEM Racing team from SCHOOL & SCHOOL — five students who turned a design brief and a classroom corner into a workshop, a brand, and a car we're genuinely proud of."
    >
      {/* story */}
      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-3xl uppercase tracking-wide text-steel">How it started</h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            It started as a school project and quietly took over our lunch breaks, our weekends and
            an alarming amount of our group chat. STEM Racing is F1&apos;s global schools
            competition: design a miniature car in CAD, manufacture it, and race it down a 20-metre
            track powered by a single CO2 canister — judged on speed, engineering and enterprise.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            We named the team Icarus because we liked the dare in it. Fly close to the sun — just be
            clever enough not to melt. That&apos;s basically our whole engineering philosophy.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="font-display text-3xl uppercase tracking-wide text-ember">What we&apos;re about</h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            We&apos;re not a corporation with a marketing budget. We&apos;re students who got
            obsessed with tenths of a second and refused to let a first attempt be our best one.
            Everything here — the car, the graphics, the pit display — was made by the five names
            below, with a lot of help from the people who backed us.
          </p>
          <p className="mt-4 font-script text-3xl text-ember">Chasing the sun, never falling.</p>
        </Reveal>
      </div>

      {/* crew */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-ember">The five</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREW.map((m, i) => (
            <Reveal key={m.name} delay={i * 70}>
              <div className="group h-full rounded-sm border border-border/60 bg-navy/20 p-6 transition-colors hover:border-ember/50">
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-3xl uppercase tracking-wide text-foreground transition-colors group-hover:text-ember">
                  {m.name}
                </h3>
                <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-steel">{m.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
