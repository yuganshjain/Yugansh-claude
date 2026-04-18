import { createDeck, shuffle } from '../deck'
import type { Card, GameResult, Suit } from '../types'

export type CrazyEightsState = {
  hands: Record<string, Card[]>
  deck: Card[]
  discardPile: Card[]
  players: string[]
  currentPlayer: string
  declaredSuit: Suit | null
  phase: 'playing' | 'done'
  winner: string | null
  direction: 1 | -1
}

export type CrazyEightsAction =
  | { type: 'play'; card: Card; declaredSuit?: Suit }
  | { type: 'draw' }

function canPlay(card: Card, top: Card, declared: Suit | null): boolean {
  if (card.rank === '8') return true
  const suit = declared ?? top.suit
  return card.suit === suit || card.rank === top.rank
}

export function initGame(players: string[]): CrazyEightsState {
  const deck = shuffle(createDeck())
  const hands: Record<string, Card[]> = {}
  let remaining = [...deck]
  players.forEach(p => { hands[p] = remaining.slice(0, 7); remaining = remaining.slice(7) })
  const [top, ...rest] = remaining
  return { hands, deck: rest, discardPile: [top], players, currentPlayer: players[0], declaredSuit: null, phase: 'playing', winner: null, direction: 1 }
}

export function applyAction(state: CrazyEightsState, action: CrazyEightsAction, playerId: string): CrazyEightsState {
  if (state.phase === 'done' || playerId !== state.currentPlayer) return state
  const top = state.discardPile[state.discardPile.length - 1]

  if (action.type === 'draw') {
    if (!state.deck.length) return state
    const hands = { ...state.hands, [playerId]: [...state.hands[playerId], state.deck[0]] }
    const deck = state.deck.slice(1)
    const idx = state.players.indexOf(playerId)
    const next = state.players[(idx + state.direction + state.players.length) % state.players.length]
    return { ...state, hands, deck, currentPlayer: next }
  }

  if (action.type === 'play') {
    const { card, declaredSuit } = action
    if (!canPlay(card, top, state.declaredSuit)) return state
    const hands = { ...state.hands, [playerId]: state.hands[playerId].filter(c => !(c.rank === card.rank && c.suit === card.suit)) }
    const discardPile = [...state.discardPile, card]

    if (hands[playerId].length === 0) {
      return { ...state, hands, discardPile, phase: 'done', winner: playerId }
    }

    let direction = state.direction
    if (card.rank === 'Q') direction = direction === 1 ? -1 : 1

    const idx = state.players.indexOf(playerId)
    let skip = card.rank === 'J' ? 2 : 1
    const next = state.players[(idx + direction * skip + state.players.length * skip) % state.players.length]

    return { ...state, hands, discardPile, currentPlayer: next, declaredSuit: card.rank === '8' ? (declaredSuit ?? top.suit) : null, direction }
  }

  return state
}

export function isGameOver(state: CrazyEightsState): boolean { return state.phase === 'done' }
export function getValidActions(state: CrazyEightsState, playerId: string): CrazyEightsAction[] {
  if (playerId !== state.currentPlayer) return []
  const top = state.discardPile[state.discardPile.length - 1]
  const plays = state.hands[playerId]
    .filter(c => canPlay(c, top, state.declaredSuit))
    .map(card => ({ type: 'play' as const, card }))
  return plays.length > 0 ? plays : [{ type: 'draw' }]
}
export function getResult(state: CrazyEightsState): GameResult {
  const scores = Object.fromEntries(state.players.map(p => [p, state.hands[p].length]))
  return { winner: state.winner, scores }
}
