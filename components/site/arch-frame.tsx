// Gothic pointed-arch outline that draws itself in — the cathedral motif.
export function ArchFrame({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 440"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMin meet"
    >
      {[0, 1].map((i) => {
        const inset = i * 16
        return (
          <path
            key={i}
            d={`M ${18 + inset} 440 L ${18 + inset} ${150 + inset} Q 150 ${10 + inset * 1.4} ${282 - inset} ${150 + inset} L ${282 - inset} 440`}
            stroke={i === 0 ? "var(--ember)" : "var(--steel)"}
            strokeWidth="1"
            strokeOpacity={i === 0 ? 0.55 : 0.35}
            strokeDasharray="1400"
            strokeDashoffset="1400"
            style={{ animation: `drawIn 2.6s ${i * 0.35 + 0.2}s cubic-bezier(0.2,0.7,0.2,1) forwards` }}
          />
        )
      })}
    </svg>
  )
}
