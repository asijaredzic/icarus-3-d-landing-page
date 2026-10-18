"use client"

import { useState, type FormEvent } from "react"
import { Send, Check } from "lucide-react"
import { TEAM_EMAIL } from "@/lib/contact"

const SUBJECTS = ["Sponsorship", "Join the team", "Press", "General"]

export function ContactForm() {
  const [subject, setSubject] = useState("Sponsorship")
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const message = String(data.get("message") ?? "").trim()
    const body = `${message}\n\n— ${name} (${email})`
    const href = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(`[${subject}] ${name}`)}&body=${encodeURIComponent(body)}`
    window.location.href = href
    setSent(true)
  }

  const field =
    "peer w-full rounded-sm border border-border/60 bg-background/40 px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-ember focus:bg-background/70"

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-sm border border-ember/40 bg-navy/20 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ember/50 bg-ember/10">
          <Check className="h-7 w-7 text-ember" />
        </div>
        <h3 className="mt-6 font-display text-3xl uppercase tracking-wide">Almost there</h3>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Your mail app should have opened with the message ready — just hit send. If it didn&apos;t,
          email us directly at{" "}
          <a href={`mailto:${TEAM_EMAIL}`} className="text-ember underline underline-offset-4">
            {TEAM_EMAIL}
          </a>
          .
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-8 rounded-sm border border-steel/50 px-6 py-2.5 font-sans text-xs uppercase tracking-[0.24em] text-steel transition-colors hover:border-steel hover:text-foreground"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-border/60 bg-navy/10 p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Name
          </span>
          <input required name="name" type="text" placeholder="Your name" className={field} />
        </label>
        <label className="block">
          <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Email
          </span>
          <input required name="email" type="email" placeholder="you@domain.com" className={field} />
        </label>
      </div>

      <div className="mt-5">
        <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
          Subject
        </span>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`rounded-sm border px-4 py-2 font-sans text-xs uppercase tracking-[0.18em] transition-colors ${
                subject === s
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Tell us about the ascent you have in mind…"
          className={`${field} resize-none`}
        />
      </label>

      <button
        type="submit"
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ember px-7 py-4 font-sans text-xs uppercase tracking-[0.24em] text-background transition-all hover:shadow-[0_0_40px_-6px_var(--ember)] sm:w-auto"
      >
        Transmit
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
      </button>
    </form>
  )
}
