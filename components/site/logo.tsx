// ICARUS mark — a rising sun over the horizon, crowned with rays and a wing.
// Lives in its own reserved slot in the nav; swap for a real logo file later.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden focusable="false">
      {/* horizon */}
      <path d="M4 28 H36" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="square" />
      {/* rising sun */}
      <path d="M11 28 A9 9 0 0 1 29 28" stroke="var(--ember)" strokeWidth="2.2" strokeLinecap="square" />
      <path d="M15.5 28 A4.5 4.5 0 0 1 24.5 28" fill="var(--ember)" />
      {/* rays */}
      <line x1="20" y1="6" x2="20" y2="12" stroke="var(--ember)" strokeWidth="2" strokeLinecap="square" />
      <line x1="9" y1="11" x2="12.5" y2="14.5" stroke="var(--steel)" strokeWidth="2" strokeLinecap="square" />
      <line x1="31" y1="11" x2="27.5" y2="14.5" stroke="var(--steel)" strokeWidth="2" strokeLinecap="square" />
    </svg>
  )
}
