import { createDeck, shuffle, cardValue, deal } from '../deck'
import type { Card, GameResult } from '../types'

export type BlackjackPhase = 'playing' | 'dealer' | 'done'

export type BlackjackState = {
  phase: BlackjackPhase
  playerHand: Card[]
  dealerHand: Card[]
  deck: Card[]
  outcome: 'win' | 'loss' | 'draw' | null
  players: string[]
}

export type BlackjackAction =
  | { type: 'hit' }
  | { type: 'stand' }
  | { type: 'double' }

function handScore(hand: Card[]): number {
  let score = hand.reduce((sum, c) => sum + cardValue(c.rank), 0)
  let aces = hand.filter(c => c.rank === 'A').length
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

export function initGame(players: string[]): BlackjackState {
  const deck = shuffle(createDeck())
  const { hand: playerHand, remaining: r1 } = deal(deck, 2)
  const { hand: dealerHand, remaining } = deal(r1, 2)
  return { phase: 'playing', playerHand, dealerHand, deck: remaining, outcome: null, players }
}

export function applyAction(state: BlackjackState, action: BlackjackAction): BlackjackState {
  if (state.phase === 'done') return state

  if (action.type === 'hit') {
    const [card, ...remaining] = state.deck
    const playerHand = [...state.playerHand, card]
    if (handScore(playerHand) > 21) {
      return { ...state, playerHand, deck: remaining, phase: 'done', outcome: 'loss' }
    }
    return { ...state, playerHand, deck: remaining }
  }

  if (action.type === 'stand' || action.type === 'double') {
    let s = action.type === 'double'
      ? { ...state, playerHand: [...state.playerHand, state.deck[0]], deck: state.deck.slice(1) }
      : state

    let dealerHand = [...s.dealerHand]
    let deck = [...s.deck]
    while (handScore(dealerHand) < 17) {
      dealerHand = [...dealerHand, deck[0]]
      deck = deck.slice(1)
    }

    const playerScore = handScore(s.playerHand)
    const dealerScore = handScore(dealerHand)
    let outcome: BlackjackState['outcome'] =
      dealerScore > 21 || playerScore > dealerScore ? 'win'
      : playerScore < dealerScore ? 'loss'
      : 'draw'

    return { ...s, dealerHand, deck, phase: 'done', outcome }
  }

  return state
}

export function getValidActions(state: BlackjackState): BlackjackAction[] {
  if (state.phase !== 'playing') return []
  const actions: BlackjackAction[] = [{ type: 'hit' }, { type: 'stand' }]
  if (state.playerHand.length === 2) actions.push({ type: 'double' })
  return actions
}

export function isGameOver(state: BlackjackState): boolean {
  return state.phase === 'done'
}

export function getResult(state: BlackjackState): GameResult {
  const playerId = state.players[0]
  return {
    winner: state.outcome === 'win' ? playerId : state.outcome === 'draw' ? null : 'dealer',
    scores: { [playerId]: state.outcome === 'win' ? 1 : 0 },
  }
}

export { handScore }
