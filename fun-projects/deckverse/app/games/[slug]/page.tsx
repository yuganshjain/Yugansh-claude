import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS, type GameSlug } from '@/lib/games/types'

export function generateStaticParams() {
  return GAME_SLUGS.map(slug => ({ slug }))
}

export default async function GameHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound()
  const m = GAME_META[slug as GameSlug]

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-7xl mb-6">{m.icon}</div>
        <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Georgia, serif' }}>{m.name}</h1>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">{m.description}</p>

        <div className="flex flex-col gap-4">
          {m.hasSolo && (
            <Link href={`/games/${slug}/play`}
              className="w-full py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 text-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
              🤖 Play vs AI
            </Link>
          )}
          {m.hasMulti && (
            <Link href={`/room/create?game=${slug}`}
              className="w-full py-5 rounded-2xl font-bold text-xl border border-white/10 hover:bg-white/5 transition-all text-center">
              👥 Create Multiplayer Room
            </Link>
          )}
          <Link href={`/learn/${slug}`}
            className="w-full py-4 rounded-2xl font-semibold text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-center">
            📖 How to Play
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl border border-white/5">
            <div className="text-2xl font-black text-violet-400">{m.minPlayers === m.maxPlayers ? m.minPlayers : `${m.minPlayers}–${m.maxPlayers}`}</div>
            <div className="text-xs text-gray-500 mt-1">Players</div>
          </div>
          <div className="p-4 rounded-xl border border-white/5">
            <div className="text-2xl font-black text-violet-400">{m.hasSolo ? '✓' : '—'}</div>
            <div className="text-xs text-gray-500 mt-1">Solo Mode</div>
          </div>
          <div className="p-4 rounded-xl border border-white/5">
            <div className="text-2xl font-black text-violet-400">{m.hasMulti ? '✓' : '—'}</div>
            <div className="text-xs text-gray-500 mt-1">Multiplayer</div>
          </div>
        </div>
      </div>
    </div>
  )
}
