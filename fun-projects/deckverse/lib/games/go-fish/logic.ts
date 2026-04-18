import { createDeck, shuffle } from '../deck'
import type { Card, GameResult, Rank } from '../types'

export type GoFishState = {
  hands: Record<string, Card[]>
  deck: Card[]
  books: Record<string, Rank[]>
  players: string[]
  currentPlayer: string
  phase: 'playing' | 'done'
  lastAction: string | null
}

export type GoFishAction = { type: 'ask'; targetPlayer: string; rank: Rank }

export function initGame(players: string[]): GoFishState {
  const deck = shuffle(createDeck())
  const handSize = players.length <= 3 ? 7 : 5
  const hands: Record<string, Card[]> = {}
  let remaining = [...deck]
  players.forEach(p => {
    hands[p] = remaining.slice(0, handSize)
    remaining = remaining.slice(handSize)
  })
  const books: Record<string, Rank[]> = Object.fromEntries(players.map(p => [p, []]))
  return { hands, deck: remaining, books, players, currentPlayer: players[0], phase: 'playing', lastAction: null }
}

function checkBooks(hand: Card[]): { hand: Card[]; newBooks: Rank[] } {
  const counts: Record<string, Card[]> = {}
  hand.forEach(c => { if (!counts[c.rank]) counts[c.rank] = []; counts[c.rank].push(c) })
  const newBooks: Rank[] = []
  const remaining: Card[] = []
  Object.entries(counts).forEach(([rank, cards]) => {
    if (cards.length === 4) newBooks.push(rank as Rank)
    else remaining.push(...cards)
  })
  return { hand: remaining, newBooks }
}

export function applyAction(state: GoFishState, action: GoFishAction, playerId: string): GoFishState {
  if (state.phase === 'done' || playerId !== state.currentPlayer) return state

  const targetHand = state.hands[action.targetPlayer] ?? []
  const matching = targetHand.filter(c => c.rank === action.rank)

  let hands = { ...state.hands }
  let deck = [...state.deck]
  let lastAction: string

  if (matching.length > 0) {
    hands[action.targetPlayer] = targetHand.filter(c => c.rank !== action.rank)
    hands[playerId] = [...hands[playerId], ...matching]
    lastAction = `${playerId} got ${matching.length} ${action.rank}(s) from ${action.targetPlayer}!`
  } else {
    lastAction = `Go Fish! ${playerId} drew a card.`
    if (deck.length > 0) {
      hands[playerId] = [...hands[playerId], deck[0]]
      deck = deck.slice(1)
    }
  }

  const { hand: newHand, newBooks } = checkBooks(hands[playerId])
  const books = { ...state.books, [playerId]: [...state.books[playerId], ...newBooks] }
  hands[playerId] = newHand

  const idx = state.players.indexOf(playerId)
  const nextPlayer = state.players[(idx + 1) % state.players.length]
  const done = deck.length === 0 && state.players.every(p => hands[p].length === 0)

  return { ...state, hands, deck, books, lastAction, currentPlayer: matching.length > 0 ? playerId : nextPlayer, phase: done ? 'done' : 'playing' }
}

export function isGameOver(state: GoFishState): boolean { return state.phase === 'done' }
export function getValidActions(state: GoFishState, playerId: string): GoFishAction[] {
  if (playerId !== state.currentPlayer) return []
  const ranks = [...new Set(state.hands[playerId]?.map(c => c.rank) ?? [])]
  const targets = state.players.filter(p => p !== playerId)
  return ranks.flatMap(rank => targets.map(targetPlayer => ({ type: 'ask' as const, targetPlayer, rank })))
}
export function getResult(state: GoFishState): GameResult {
  const scores = Object.fromEntries(state.players.map(p => [p, state.books[p].length]))
  const topScore = Math.max(...Object.values(scores))
  const winners = Object.entries(scores).filter(([, s]) => s === topScore).map(([p]) => p)
  return { winner: winners.length === 1 ? winners[0] : null, scores }
}
