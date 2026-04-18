import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'DeckVerse — The Ultimate Card Games Hub',
  description: '10 classic card games with 3D animations, solo AI play, and live multiplayer. Free forever.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#050510] text-white antialiased">{children}</body>
    </html>
  )
}
