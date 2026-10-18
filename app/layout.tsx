import type { Metadata, Viewport } from "next"
import { Anton, Space_Grotesk, Pinyon_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SiteNav } from "@/components/site/site-nav"
import { SiteFooter } from "@/components/site/footer"
import { CosmicBackground } from "@/components/site/cosmic-background"
import { Grain } from "@/components/site/grain"
import { RouteTransition } from "@/components/site/route-transition"
import { ScrollProgress } from "@/components/site/scroll-progress"
import { AudioProvider } from "@/components/audio/audio-provider"
import "./globals.css"

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-thunder" })
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" })
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon" })

export const metadata: Metadata = {
  title: "ICARUS — Student Solar Racing",
  description:
    "Five engineering students, one garage, and a car that runs on nothing but sunlight. This is ICARUS.",
}

export const viewport: Viewport = {
  themeColor: "#04060e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${anton.variable} ${grotesk.variable} ${pinyon.variable}`}>
      <body className="font-sans antialiased">
        <AudioProvider>
          <CosmicBackground />
          <SiteNav />
          <RouteTransition />
          <ScrollProgress />
          <main className="relative z-10">{children}</main>
          <SiteFooter />
          <Grain />
        </AudioProvider>
        <Analytics />
      </body>
    </html>
  )
}
