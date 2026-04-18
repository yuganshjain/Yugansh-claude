import type { Card, GameResult } from '../types'
import { createDeck, shuffle } from '../deck'

export type MemoryCard = Card & { id: number; matched: boolean; flipped: boolean }

export type MemoryState = {
  board: MemoryCard[]
  flipped: number[]
  matched: number[]
  scores: Record<string, number>
  currentPlayer: string
  players: string[]
  phase: 'playing' | 'done'
}

export type MemoryAction = { type: 'flip'; cardId: number }

export function initGame(players: string[]): MemoryState {
  const deck = shuffle(createDeck()).slice(0, 16)
  const pairs = shuffle([...deck, ...deck]).map((c, i) => ({ ...c, id: i, matched: false, flipped: false }))
  return {
    board: pairs,
    flipped: [],
    matched: [],
    scores: Object.fromEntries(players.map(p => [p, 0])),
    currentPlayer: players[0],
    players,
    phase: 'playing',
  }
}

export function applyAction(state: MemoryState, action: MemoryAction, playerId: string): MemoryState {
  if (state.phase === 'done' || playerId !== state.currentPlayer) return state
  if (state.flipped.length >= 2) return state
  const card = state.board.find(c => c.id === action.cardId)
  if (!card || card.matched || card.flipped) return state

  const board = state.board.map(c => c.id === action.cardId ? { ...c, flipped: true } : c)
  const flipped = [...state.flipped, action.cardId]

  if (flipped.length < 2) return { ...state, board, flipped }

  const [a, b] = flipped.map(id => board.find(c => c.id === id)!)
  const isMatch = a.rank === b.rank && a.suit === b.suit

  if (isMatch) {
    const matched = [...state.matched, ...flipped]
    const newBoard = board.map(c => flipped.includes(c.id) ? { ...c, matched: true } : c)
    const scores = { ...state.scores, [playerId]: (state.scores[playerId] ?? 0) + 1 }
    const done = matched.length === board.length
    return { ...state, board: newBoard, flipped: [], matched, scores, phase: done ? 'done' : 'playing' }
  }

  const idx = state.players.indexOf(playerId)
  const nextPlayer = state.players[(idx + 1) % state.players.length]
  const resetBoard = board.map(c => flipped.includes(c.id) ? { ...c, flipped: false } : c)
  return { ...state, board: resetBoard, flipped: [], currentPlayer: nextPlayer }
}

export function isGameOver(state: MemoryState): boolean { return state.phase === 'done' }
export function getValidActions(state: MemoryState, playerId: string): MemoryAction[] {
  if (playerId !== state.currentPlayer) return []
  return state.board.filter(c => !c.matched && !c.flipped).map(c => ({ type: 'flip', cardId: c.id }))
}
export function getResult(state: MemoryState): GameResult {
  const topScore = Math.max(...Object.values(state.scores))
  const winners = Object.entries(state.scores).filter(([, s]) => s === topScore).map(([p]) => p)
  return { winner: winners.length === 1 ? winners[0] : null, scores: state.scores }
}
