import { notFound } from 'next/navigation'
import { GAME_SLUGS, type GameSlug } from '@/lib/games/types'
import { BlackjackBoard } from '@/components/games/blackjack/Board'

const BOARDS: Partial<Record<GameSlug, React.ComponentType>> = {
  blackjack: BlackjackBoard,
}

export function generateStaticParams() {
  return GAME_SLUGS.map(slug => ({ slug }))
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound()

  const Board = BOARDS[slug as GameSlug]
  if (!Board) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-black mb-2">Coming Soon</h1>
          <p className="text-gray-400">This game is being built. Check back soon!</p>
        </div>
      </div>
    )
  }

  return <Board />
}
