export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export type Card = { suit: Suit; rank: Rank }

export type GameResult = {
  winner: string | null
  scores: Record<string, number>
}

export interface GameLogic<TState, TAction> {
  initGame(players: string[]): TState
  applyAction(state: TState, action: TAction, playerId: string): TState
  getValidActions(state: TState, playerId: string): TAction[]
  isGameOver(state: TState): boolean
  getResult(state: TState): GameResult
}

export const GAME_SLUGS = [
  'blackjack',
  'solitaire',
  'poker',
  'war',
  'snap',
  'memory',
  'go-fish',
  'crazy-eights',
  'rummy',
  'speed',
] as const

export type GameSlug = typeof GAME_SLUGS[number]

export const GAME_META: Record<GameSlug, { name: string; icon: string; minPlayers: number; maxPlayers: number; hasSolo: boolean; hasMulti: boolean; description: string }> = {
  blackjack:      { name: 'Blackjack',      icon: '♠', minPlayers: 1, maxPlayers: 6, hasSolo: true,  hasMulti: true,  description: 'Beat the dealer to 21 without going bust.' },
  solitaire:      { name: 'Solitaire',      icon: '🃏', minPlayers: 1, maxPlayers: 1, hasSolo: true,  hasMulti: false, description: 'Classic Klondike patience — build the foundations.' },
  poker:          { name: 'Poker',          icon: '♦', minPlayers: 2, maxPlayers: 8, hasSolo: true,  hasMulti: true,  description: 'Texas Hold\'em — best 5-card hand wins the pot.' },
  war:            { name: 'War',            icon: '⚔️', minPlayers: 2, maxPlayers: 2, hasSolo: true,  hasMulti: true,  description: 'Flip cards and win the pile — highest card wins.' },
  snap:           { name: 'Snap',           icon: '👏', minPlayers: 2, maxPlayers: 4, hasSolo: true,  hasMulti: true,  description: 'Shout SNAP when two cards match — fastest wins!' },
  memory:         { name: 'Memory',         icon: '🧠', minPlayers: 1, maxPlayers: 4, hasSolo: true,  hasMulti: true,  description: 'Flip and match pairs — best memory wins.' },
  'go-fish':      { name: 'Go Fish',        icon: '🐟', minPlayers: 2, maxPlayers: 6, hasSolo: true,  hasMulti: true,  description: 'Ask for cards and collect sets of four.' },
  'crazy-eights': { name: 'Crazy Eights',   icon: '8️⃣', minPlayers: 2, maxPlayers: 8, hasSolo: true,  hasMulti: true,  description: 'Match suit or rank — eights are wild!' },
  rummy:          { name: 'Rummy',          icon: '🎯', minPlayers: 2, maxPlayers: 6, hasSolo: true,  hasMulti: true,  description: 'Form melds and runs — first to go out wins.' },
  speed:          { name: 'Speed',          icon: '⚡', minPlayers: 2, maxPlayers: 2, hasSolo: true,  hasMulti: true,  description: 'Race to empty your hand — fastest fingers win!' },
}
