import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS, type GameSlug } from '@/lib/games/types'

const TUTORIALS: Record<GameSlug, { steps: { title: string; desc: string }[]; tip: string }> = {
  blackjack: {
    steps: [
      { title: 'Place your bet', desc: 'Choose your chip value and place your bet before cards are dealt.' },
      { title: 'Cards are dealt', desc: 'You and the dealer each get 2 cards. One dealer card stays face down.' },
      { title: 'Hit or Stand', desc: 'Hit to draw another card. Stand to keep your total. Stay under 22!' },
      { title: 'Dealer reveals', desc: 'Dealer flips their card and must hit until reaching 17 or more.' },
      { title: 'Win or lose', desc: 'Closest to 21 without busting wins. Tie is a draw. Blackjack pays 1.5x.' },
    ],
    tip: 'Always stand on 17+. Hit on 11 or less. Double down on 10 or 11.',
  },
  solitaire: {
    steps: [
      { title: 'Setup', desc: '7 tableau columns, top card face-up. 4 empty foundation piles. Remaining deck in stock.' },
      { title: 'Build tableau', desc: 'Stack cards in descending order, alternating red and black suits.' },
      { title: 'Draw from stock', desc: 'Click the stock pile to flip cards to waste. Play from waste to tableau or foundations.' },
      { title: 'Build foundations', desc: 'Move Aces to foundations first, then build each suit from A to K.' },
      { title: 'Win!', desc: 'Fill all 4 foundations from Ace to King to win the game.' },
    ],
    tip: 'Prioritize moving Aces and 2s to foundations early. Expose face-down cards whenever possible.',
  },
  poker: {
    steps: [
      { title: 'Blinds posted', desc: 'Small and big blind post forced bets. Two hole cards dealt to each player.' },
      { title: 'Pre-flop betting', desc: 'Bet, call, raise, or fold based on your hole cards.' },
      { title: 'The Flop', desc: '3 community cards revealed. Another round of betting.' },
      { title: 'Turn & River', desc: '4th and 5th community cards revealed with betting rounds in between.' },
      { title: 'Showdown', desc: 'Best 5-card hand from your 2 hole + 5 community cards wins the pot.' },
    ],
    tip: 'Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > Pair > High Card',
  },
  war: {
    steps: [
      { title: 'Split deck', desc: 'Each player gets half the deck, face down.' },
      { title: 'Flip!', desc: 'Both players flip their top card simultaneously.' },
      { title: 'Higher card wins', desc: 'Higher card takes both cards to the bottom of the winner\'s pile.' },
      { title: 'War!', desc: 'If cards match — War! Each player places 3 cards face-down, then 1 face-up. Higher card wins all.' },
      { title: 'Victory', desc: 'First player to collect all 52 cards wins!' },
    ],
    tip: 'War is pure luck — but keep an eye on your pile size to know when you\'re winning!',
  },
  snap: {
    steps: [
      { title: 'Deal cards', desc: 'Cards are split equally between all players, face down.' },
      { title: 'Play in turn', desc: 'Players take turns flipping their top card onto the center pile.' },
      { title: 'SNAP!', desc: 'When two consecutive center cards match in rank, shout SNAP! and grab the pile.' },
      { title: 'Wrong snap penalty', desc: 'False snap? Give one card to each other player.' },
      { title: 'Win!', desc: 'Collect all the cards to win. Run out of cards? You\'re out!' },
    ],
    tip: 'Keep your eyes on the center pile, not your own cards. Reflexes win this game!',
  },
  memory: {
    steps: [
      { title: 'Cards laid out', desc: 'All cards placed face-down in a grid. Each card has exactly one match.' },
      { title: 'Flip two cards', desc: 'On your turn, flip any two cards face-up.' },
      { title: 'Match!', desc: 'If they match, keep them and take another turn.' },
      { title: 'No match', desc: 'If they don\'t match, flip them back over. Next player\'s turn.' },
      { title: 'Win!', desc: 'Player with the most matched pairs when all cards are collected wins.' },
    ],
    tip: 'Focus on remembering the position of cards you\'ve seen. Start from the edges and work inward.',
  },
  'go-fish': {
    steps: [
      { title: 'Deal hands', desc: 'Each player gets 5–7 cards. Remaining cards form the pond (draw pile).' },
      { title: 'Ask for cards', desc: 'Ask any player "Do you have any [rank]s?" You must hold at least one of that rank.' },
      { title: 'Got some!', desc: 'They give you all cards of that rank. Take another turn.' },
      { title: 'Go Fish!', desc: 'If they have none, draw from the pond. Your turn ends.' },
      { title: 'Books win', desc: 'Collect all 4 cards of any rank to make a "book". Most books wins!' },
    ],
    tip: 'Ask for ranks you have multiple of. Pay attention to what others ask for — they\'re telling you what they hold!',
  },
  'crazy-eights': {
    steps: [
      { title: 'Deal 7 cards', desc: 'Each player gets 7 cards. Top card of remaining deck starts the discard pile.' },
      { title: 'Match suit or rank', desc: 'Play a card matching the top discard\'s suit OR rank.' },
      { title: 'Eights are wild!', desc: 'Play any 8 at any time and declare the new suit.' },
      { title: 'Special cards', desc: 'Jack skips next player. Queen reverses direction. 2 makes next player draw 2.' },
      { title: 'Win!', desc: 'First player to empty their hand wins. Call "Last card!" when you have one left.' },
    ],
    tip: 'Save your 8s for emergencies. Try to switch to a suit you have many cards in.',
  },
  rummy: {
    steps: [
      { title: 'Deal hands', desc: '7–10 cards dealt per player. One card face-up starts discard pile.' },
      { title: 'Draw a card', desc: 'Draw from the deck or take the top discard card.' },
      { title: 'Form melds', desc: 'A meld is 3+ cards of the same rank, or 3+ consecutive cards of the same suit.' },
      { title: 'Lay down melds', desc: 'Place valid melds face-up on the table at any time.' },
      { title: 'Discard & win', desc: 'Discard one card. First to empty their hand by melding all cards wins!' },
    ],
    tip: 'Draw from discard only if it completes a meld immediately. Keep flexible partial melds rather than committing too early.',
  },
  speed: {
    steps: [
      { title: 'Setup', desc: 'Each player gets 20 cards in their stockpile and 5 in hand. Two center piles start empty.' },
      { title: 'Flip to start', desc: 'Both players simultaneously flip a card onto the center piles.' },
      { title: 'Play fast!', desc: 'Play any hand card that is one rank higher or lower than a center pile top card — no turns!' },
      { title: 'Replenish hand', desc: 'Draw from your stockpile whenever your hand has fewer than 5 cards.' },
      { title: 'Win!', desc: 'First player to empty both their hand and stockpile wins. SPEED!' },
    ],
    tip: 'Don\'t fixate on one pile — scan both constantly. Play your least useful cards first.',
  },
}

export function generateStaticParams() {
  return GAME_SLUGS.map(slug => ({ slug }))
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!GAME_SLUGS.includes(slug as GameSlug)) notFound()

  const m = GAME_META[slug as GameSlug]
  const t = TUTORIALS[slug as GameSlug]

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{m.icon}</div>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>How to Play {m.name}</h1>
          <p className="text-gray-400">{m.description}</p>
        </div>

        <div className="space-y-4 mb-10">
          {t.steps.map((step, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl border border-yellow-500/20 mb-10" style={{ background: 'rgba(234,179,8,0.05)' }}>
          <div className="text-sm font-bold text-yellow-400 mb-1">💡 Pro Tip</div>
          <p className="text-sm text-gray-300">{t.tip}</p>
        </div>

        <div className="flex gap-4">
          <Link href={`/games/${slug}/play`}
            className="flex-1 py-4 rounded-xl font-bold text-center transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            Play Now
          </Link>
          <Link href="/games"
            className="px-6 py-4 rounded-xl font-semibold border border-white/10 hover:bg-white/5 transition-all">
            All Games
          </Link>
        </div>
      </div>
    </div>
  )
}
