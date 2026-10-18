import Link from "next/link"
import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { ContactForm } from "@/components/site/contact-form"
import { AtSign, Mail, Phone } from "lucide-react"
import { TEAM_EMAIL } from "@/lib/contact"

const CHANNELS = [
  { icon: Mail, label: "Email", value: TEAM_EMAIL, href: `mailto:${TEAM_EMAIL}` },
  { icon: Phone, label: "Phone", value: "62079054", href: "tel:+38762079054" },
  { icon: AtSign, label: "Instagram", value: "@icarus.stem", href: "https://www.instagram.com/icarus.stem/" },
]

export default function ContactPage() {
  return (
    <PageShell
      index="05"
      eyebrow="Get in touch"
      title="Say"
      stroke="hello"
      intro="Sponsorship, press, or you just think what we're doing is cool — we read everything. So does SCHOOL & SCHOOL."
    >
      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        {/* channels */}
        <Reveal>
          <h2 className="font-display text-3xl uppercase tracking-wide text-steel">Direct lines</h2>
          <div className="mt-6 space-y-3">
            {CHANNELS.map((c) => {
              const Icon = c.icon
              return (
                <Link
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  className="group flex items-center gap-4 rounded-sm border border-border/60 bg-navy/20 p-4 transition-colors hover:border-ember/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-border/60 bg-background/40 text-steel transition-colors group-hover:text-ember">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                      {c.label}
                    </span>
                    <span className="font-display text-lg uppercase tracking-wide text-foreground">{c.value}</span>
                  </span>
                </Link>
              )
            })}
          </div>
          <p className="mt-8 font-script text-3xl text-ember">Fly with us.</p>
        </Reveal>

        {/* form */}
        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </PageShell>
  )
}
