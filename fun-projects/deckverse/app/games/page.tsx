import Link from 'next/link'
import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS } from '@/lib/games/types'

export default function GamesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Georgia, serif' }}>All Games</h1>
          <p className="text-gray-400">Pick a game and start playing — tutorials included</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GAME_SLUGS.map(slug => {
            const m = GAME_META[slug]
            return (
              <Link key={slug} href={`/games/${slug}`}
                className="group p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/20"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-5xl mb-4">{m.icon}</div>
                <h3 className="text-lg font-bold mb-2">{m.name}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{m.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {m.hasSolo && (
                    <span className="text-xs px-3 py-1 rounded-full text-violet-300" style={{ background: 'rgba(124,58,237,0.2)' }}>
                      Solo AI
                    </span>
                  )}
                  {m.hasMulti && (
                    <span className="text-xs px-3 py-1 rounded-full text-emerald-300" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      Multiplayer
                    </span>
                  )}
                  <span className="text-xs px-3 py-1 rounded-full text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {m.minPlayers === m.maxPlayers ? `${m.minPlayers}P` : `${m.minPlayers}–${m.maxPlayers}P`}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
