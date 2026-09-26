// Shared CSS cosmic backdrop sitting behind every page: navy night,
// ember + crimson glow and a faint tiled starfield. Cheap and always-on.
export function CosmicBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* base vertical wash: navy up top, deep space below */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a1330 0%, #070a18 42%, #05070f 100%)",
        }}
      />
      {/* stained-glass glows */}
      <div
        className="absolute -left-[10%] top-[8%] h-[55vh] w-[55vh] rounded-full opacity-60 blur-[90px] animate-ember"
        style={{ background: "radial-gradient(circle, rgba(255,157,60,0.30), transparent 70%)" }}
      />
      <div
        className="absolute right-[-12%] top-[38%] h-[60vh] w-[60vh] rounded-full opacity-50 blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(63,99,196,0.28), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-14%] left-[24%] h-[55vh] w-[70vh] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(179,52,31,0.30), transparent 72%)" }}
      />
      {/* tiled twinkling stars */}
      <div
        className="absolute inset-0 animate-twinkle"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 24px 30px, rgba(239,228,207,0.7), transparent), radial-gradient(1px 1px at 130px 80px, rgba(239,228,207,0.5), transparent), radial-gradient(1.4px 1.4px at 200px 160px, rgba(239,228,207,0.6), transparent), radial-gradient(1px 1px at 90px 200px, rgba(200,214,255,0.5), transparent)",
          backgroundSize: "240px 240px",
        }}
      />
      {/* top + bottom fade for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/70" />
    </div>
  )
}
