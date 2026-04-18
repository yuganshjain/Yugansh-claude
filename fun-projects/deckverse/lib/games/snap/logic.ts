import { createDeck, shuffle } from '../deck'
import type { Card, GameResult } from '../types'

export type SnapState = {
  piles: Record<string, Card[]>
  centerPile: Card[]
  players: string[]
  phase: 'playing' | 'done'
  currentPlayer: string
  winner: string | null
  lastSnap: string | null
}

export type SnapAction = { type: 'play' } | { type: 'snap' }

export function initGame(players: string[]): SnapState {
  const deck = shuffle(createDeck())
  const perPlayer = Math.floor(deck.length / players.length)
  const piles: Record<string, Card[]> = {}
  players.forEach((p, i) => { piles[p] = deck.slice(i * perPlayer, (i + 1) * perPlayer) })
  return { piles, centerPile: [], players, phase: 'playing', currentPlayer: players[0], winner: null, lastSnap: null }
}

export function applyAction(state: SnapState, action: SnapAction, playerId: string): SnapState {
  if (state.phase === 'done') return state

  if (action.type === 'play' && playerId === state.currentPlayer) {
    const pile = [...state.piles[playerId]]
    if (!pile.length) return state
    const [card, ...rest] = pile
    const centerPile = [...state.centerPile, card]
    const piles = { ...state.piles, [playerId]: rest }
    const idx = state.players.indexOf(playerId)
    const nextPlayer = state.players.filter(p => piles[p].length > 0)[(idx + 1) % state.players.filter(p => piles[p].length > 0).length]
    const remaining = Object.values(piles).filter(p => p.length > 0).length
    if (remaining <= 1) {
      const winner = Object.entries(piles).find(([, p]) => p.length > 0)?.[0] ?? playerId
      return { ...state, piles, centerPile, phase: 'done', winner, currentPlayer: nextPlayer ?? playerId }
    }
    return { ...state, piles, centerPile, currentPlayer: nextPlayer ?? playerId }
  }

  if (action.type === 'snap' && state.centerPile.length >= 2) {
    const top = state.centerPile[state.centerPile.length - 1]
    const second = state.centerPile[state.centerPile.length - 2]
    if (top.rank === second.rank) {
      const piles = { ...state.piles, [playerId]: [...state.centerPile, ...state.piles[playerId]] }
      return { ...state, piles, centerPile: [], lastSnap: playerId }
    }
    const pile = [...state.piles[playerId]]
    if (pile.length > 0) {
      const [penalty, ...rest] = pile
      return { ...state, piles: { ...state.piles, [playerId]: rest }, centerPile: [...state.centerPile, penalty], lastSnap: null }
    }
  }

  return state
}

export function isGameOver(state: SnapState): boolean { return state.phase === 'done' }
export function getValidActions(state: SnapState, playerId: string): SnapAction[] {
  const actions: SnapAction[] = []
  if (playerId === state.currentPlayer && state.piles[playerId]?.length > 0) actions.push({ type: 'play' })
  if (state.centerPile.length >= 2) actions.push({ type: 'snap' })
  return actions
}
export function getResult(state: SnapState): GameResult {
  const scores = Object.fromEntries(state.players.map(p => [p, state.piles[p]?.length ?? 0]))
  return { winner: state.winner, scores }
}
