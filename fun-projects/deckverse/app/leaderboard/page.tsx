import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS } from '@/lib/games/types'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>Leaderboard</h1>
          <p className="text-gray-400">Top players across all games</p>
        </div>

        <div className="grid gap-6">
          {GAME_SLUGS.map(slug => {
            const m = GAME_META[slug]
            return (
              <div key={slug} className="p-6 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{m.icon}</span>
                  <h2 className="text-lg font-bold">{m.name}</h2>
                </div>
                <div className="text-sm text-gray-500 text-center py-4">
                  No games played yet — be the first to set a record!
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
