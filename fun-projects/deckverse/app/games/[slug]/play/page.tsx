import { notFound } from 'next/navigation'
import { GAME_SLUGS, GAME_META, type GameSlug } from '@/lib/games/types'
import { BlackjackBoard } from '@/components/games/blackjack/Board'
import { WarBoard } from '@/components/games/war/Board'
import { MemoryBoard } from '@/components/games/memory/Board'
import { SnapBoard } from '@/components/games/snap/Board'
import { GoFishBoard } from '@/components/games/go-fish/Board'
import { CrazyEightsBoard } from '@/components/games/crazy-eights/Board'
import { RummyBoard } from '@/components/games/rummy/Board'
import { SpeedBoard } from '@/components/games/speed/Board'
import { PokerBoard } from '@/components/games/poker/Board'
import { SolitaireBoard } from '@/components/games/solitaire/Board'
import Link from 'next/link'

const BOARDS: Record<GameSlug, React.ComponentType> = {
  blackjack: BlackjackBoard,
  war: WarBoard,
  memory: MemoryBoard,
  snap: SnapBoard,
  'go-fish': GoFishBoard,
  'crazy-eights': CrazyEightsBoard,
  rummy: RummyBoard,
  speed: SpeedBoard,
  poker: PokerBoard,
  solitaire: SolitaireBoard,
}

export function generateStaticParams() {
  return GAME_SLUGS.map(slug => ({ slug }))
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound()

  const Board = BOARDS[slug as GameSlug]
  const m = GAME_META[slug as GameSlug]

  return (
    <div className="relative">
      {/* Game nav bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href={`/games/${slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">← Back</Link>
        <span className="text-sm font-bold">{m.icon} {m.name}</span>
        <Link href={`/learn/${slug}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">How to Play</Link>
      </div>
      <div className="pt-12">
        <Board />
      </div>
    </div>
  )
}
