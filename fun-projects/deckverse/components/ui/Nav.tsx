'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Nav() {
  const path = usePathname()
  const links = [
    { href: '/games', label: 'Games' },
    { href: '/learn/blackjack', label: 'How to Play' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-xl"
      style={{ background: 'rgba(5,5,16,0.92)' }}>
      <Link href="/" className="text-xl font-black tracking-widest">
        DECK<span className="text-violet-400" style={{ textShadow: '0 0 20px #7c3aed' }}>VERSE</span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`text-sm tracking-wide transition-colors ${path.startsWith(l.href) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            {l.label}
          </Link>
        ))}
      </div>
      <Link href="/games"
        className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
        Play Free
      </Link>
    </nav>
  )
}
