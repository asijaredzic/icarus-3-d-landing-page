import Image from "next/image"

// Swap the file at /public/images/logo.png to change the team logo everywhere.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt=""
      aria-hidden
      width={512}
      height={512}
      priority
      className={`logo-mark object-contain ${className}`}
    />
  )
}
