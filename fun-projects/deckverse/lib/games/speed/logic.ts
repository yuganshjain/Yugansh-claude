import { createDeck, shuffle, rankOrder } from '../deck'
import type { Card, GameResult } from '../types'

export type SpeedState = {
  piles: [Card[], Card[]]
  hands: Record<string, Card[]>
  stockpiles: Record<string, Card[]>
  players: [string, string]
  phase: 'playing' | 'done'
  winner: string | null
}

export type SpeedAction = { type: 'play'; card: Card; pile: 0 | 1 } | { type: 'flip' }

function canPlayOn(card: Card, pile: Card[]): boolean {
  if (!pile.length) return true
  const top = pile[pile.length - 1]
  const diff = Math.abs(rankOrder(card.rank) - rankOrder(top.rank))
  return diff === 1 || diff === 12
}

export function initGame(players: [string, string]): SpeedState {
  const deck = shuffle(createDeck())
  const hands: Record<string, Card[]> = { [players[0]]: deck.slice(0, 5), [players[1]]: deck.slice(5, 10) }
  const stockpiles: Record<string, Card[]> = { [players[0]]: deck.slice(10, 31), [players[1]]: deck.slice(31, 52) }
  return { piles: [[], []], hands, stockpiles, players, phase: 'playing', winner: null }
}

export function applyAction(state: SpeedState, action: SpeedAction, playerId: string): SpeedState {
  if (state.phase === 'done') return state

  if (action.type === 'flip') {
    const piles: [Card[], Card[]] = [
      state.stockpiles[state.players[0]].length ? [...state.piles[0], state.stockpiles[state.players[0]][0]] : state.piles[0],
      state.stockpiles[state.players[1]].length ? [...state.piles[1], state.stockpiles[state.players[1]][0]] : state.piles[1],
    ]
    const stockpiles = {
      [state.players[0]]: state.stockpiles[state.players[0]].slice(1),
      [state.players[1]]: state.stockpiles[state.players[1]].slice(1),
    }
    return { ...state, piles, stockpiles }
  }

  if (action.type === 'play') {
    const targetPile = state.piles[action.pile]
    if (!canPlayOn(action.card, targetPile)) return state

    const hand = state.hands[playerId].filter(c => !(c.rank === action.card.rank && c.suit === action.card.suit))
    const newPile = [...targetPile, action.card]
    const piles: [Card[], Card[]] = action.pile === 0 ? [newPile, state.piles[1]] : [state.piles[0], newPile]

    let newHand = hand
    if (hand.length < 5 && state.stockpiles[playerId].length > 0) {
      newHand = [...hand, state.stockpiles[playerId][0]]
    }
    const stockpiles = hand.length < 5 && state.stockpiles[playerId].length > 0
      ? { ...state.stockpiles, [playerId]: state.stockpiles[playerId].slice(1) }
      : state.stockpiles

    const hands = { ...state.hands, [playerId]: newHand }
    if (newHand.length === 0 && stockpiles[playerId].length === 0) {
      return { ...state, hands, piles, stockpiles, phase: 'done', winner: playerId }
    }
    return { ...state, hands, piles, stockpiles }
  }

  return state
}

export function isGameOver(state: SpeedState): boolean { return state.phase === 'done' }
export function getValidActions(state: SpeedState, playerId: string): SpeedAction[] {
  return state.hands[playerId]
    .flatMap(card => ([0, 1] as const).filter(i => canPlayOn(card, state.piles[i])).map(pile => ({ type: 'play' as const, card, pile })))
}
export function getResult(state: SpeedState): GameResult {
  return { winner: state.winner, scores: Object.fromEntries(state.players.map(p => [p, state.hands[p].length])) }
}
