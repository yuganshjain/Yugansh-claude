import { createDeck, shuffle } from '../deck'
import type { Card, GameResult, Rank } from '../types'

export type Meld = Card[]

export type RummyState = {
  hands: Record<string, Card[]>
  deck: Card[]
  discardPile: Card[]
  melds: Record<string, Meld[]>
  players: string[]
  currentPlayer: string
  phase: 'draw' | 'meld' | 'done'
  winner: string | null
  drawnFrom: 'deck' | 'discard' | null
}

export type RummyAction =
  | { type: 'drawDeck' }
  | { type: 'drawDiscard' }
  | { type: 'meld'; cards: Card[] }
  | { type: 'discard'; card: Card }

const RANK_ORDER: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false
  const allSameSuit = cards.every(c => c.suit === cards[0].suit)
  if (allSameSuit) {
    const indices = cards.map(c => RANK_ORDER.indexOf(c.rank)).sort((a, b) => a - b)
    return indices.every((v, i) => i === 0 || v === indices[i - 1] + 1)
  }
  return cards.every(c => c.rank === cards[0].rank) && cards.length <= 4
}

export function initGame(players: string[]): RummyState {
  const deck = shuffle(createDeck())
  const hands: Record<string, Card[]> = {}
  let remaining = [...deck]
  const handSize = players.length <= 2 ? 10 : 7
  players.forEach(p => { hands[p] = remaining.slice(0, handSize); remaining = remaining.slice(handSize) })
  return {
    hands, deck: remaining.slice(1), discardPile: [remaining[0]],
    melds: Object.fromEntries(players.map(p => [p, []])),
    players, currentPlayer: players[0], phase: 'draw', winner: null, drawnFrom: null,
  }
}

export function applyAction(state: RummyState, action: RummyAction, playerId: string): RummyState {
  if (state.phase === 'done' || playerId !== state.currentPlayer) return state

  if (action.type === 'drawDeck' && state.phase === 'draw' && state.deck.length) {
    const hands = { ...state.hands, [playerId]: [...state.hands[playerId], state.deck[0]] }
    return { ...state, hands, deck: state.deck.slice(1), phase: 'meld', drawnFrom: 'deck' }
  }

  if (action.type === 'drawDiscard' && state.phase === 'draw' && state.discardPile.length) {
    const top = state.discardPile[state.discardPile.length - 1]
    const hands = { ...state.hands, [playerId]: [...state.hands[playerId], top] }
    return { ...state, hands, discardPile: state.discardPile.slice(0, -1), phase: 'meld', drawnFrom: 'discard' }
  }

  if (action.type === 'meld' && state.phase === 'meld' && isValidMeld(action.cards)) {
    const hand = state.hands[playerId].filter(c => !action.cards.some(m => m.rank === c.rank && m.suit === c.suit))
    const melds = { ...state.melds, [playerId]: [...state.melds[playerId], action.cards] }
    return { ...state, hands: { ...state.hands, [playerId]: hand }, melds }
  }

  if (action.type === 'discard' && state.phase === 'meld') {
    const hand = state.hands[playerId].filter(c => !(c.rank === action.card.rank && c.suit === action.card.suit))
    const discardPile = [...state.discardPile, action.card]
    if (hand.length === 0) return { ...state, hands: { ...state.hands, [playerId]: hand }, discardPile, phase: 'done', winner: playerId }
    const idx = state.players.indexOf(playerId)
    const nextPlayer = state.players[(idx + 1) % state.players.length]
    return { ...state, hands: { ...state.hands, [playerId]: hand }, discardPile, currentPlayer: nextPlayer, phase: 'draw', drawnFrom: null }
  }

  return state
}

export function isGameOver(state: RummyState): boolean { return state.phase === 'done' }
export function getValidActions(state: RummyState, playerId: string): RummyAction[] {
  if (playerId !== state.currentPlayer) return []
  if (state.phase === 'draw') return [{ type: 'drawDeck' }, { type: 'drawDiscard' }]
  return [{ type: 'discard', card: state.hands[playerId][0] }]
}
export function getResult(state: RummyState): GameResult {
  const scores = Object.fromEntries(state.players.map(p => [p, state.melds[p].flat().length]))
  return { winner: state.winner, scores }
}
