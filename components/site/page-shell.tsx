import type { ReactNode } from "react"

// Standard page hero header so every sub-page shares the landing's cathedral feel.
export function PageShell({
  index,
  eyebrow,
  title,
  stroke,
  intro,
  children,
}: {
  index: string
  eyebrow: string
  title: string
  stroke?: string
  intro?: string
  children: ReactNode
}) {
  return (
    <div className="relative min-h-screen pb-24 pt-28 md:pt-36">

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
        <header className="border-b border-border/50 pb-10">
          <div className="flex items-center gap-4 font-sans text-[0.65rem] uppercase tracking-[0.4em] text-ember">
            <span className="text-muted-foreground">{index}</span>
            <span className="h-px w-10 bg-ember/50" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="mt-6 font-display text-[clamp(3rem,11vw,9rem)] uppercase leading-[0.86] tracking-tight text-balance">
            {title}
            {stroke ? <span className="text-stroke block md:inline"> {stroke}</span> : null}
          </h1>
          {intro ? (
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {intro}
            </p>
          ) : null}
        </header>

        {children}
      </div>
    </div>
  )
}
