import type { Card, Rank, Suit } from './types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function createDeck(): Card[] {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function cardValue(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10
  if (rank === 'A') return 11
  return parseInt(rank)
}

export function rankOrder(rank: Rank): number {
  return RANKS.indexOf(rank)
}

export function deal(deck: Card[], count: number): { hand: Card[]; remaining: Card[] } {
  return { hand: deck.slice(0, count), remaining: deck.slice(count) }
}
