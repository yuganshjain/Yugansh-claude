import { createDeck, shuffle } from '../deck'
import type { Card, GameResult, Rank } from '../types'

export type PokerPhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'done'

export type PokerState = {
  hands: Record<string, Card[]>
  community: Card[]
  deck: Card[]
  pot: number
  bets: Record<string, number>
  stacks: Record<string, number>
  players: string[]
  activePlayers: string[]
  currentPlayer: string
  phase: PokerPhase
  dealer: number
  winner: string | null
}

export type PokerAction =
  | { type: 'fold' }
  | { type: 'call' }
  | { type: 'raise'; amount: number }
  | { type: 'check' }

const RANK_VAL: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

function handRank(cards: Card[]): number {
  const counts: Record<string, number> = {}
  cards.forEach(c => { counts[c.rank] = (counts[c.rank] ?? 0) + 1 })
  const vals = Object.values(counts).sort((a, b) => b - a)
  const allSameSuit = cards.every(c => c.suit === cards[0].suit)
  const sorted = cards.map(c => RANK_VAL[c.rank]).sort((a, b) => a - b)
  const isStr = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1)
  if (allSameSuit && isStr) return 8
  if (vals[0] === 4) return 7
  if (vals[0] === 3 && vals[1] === 2) return 6
  if (allSameSuit) return 5
  if (isStr) return 4
  if (vals[0] === 3) return 3
  if (vals[0] === 2 && vals[1] === 2) return 2
  if (vals[0] === 2) return 1
  return 0
}

function bestHand(hole: Card[], community: Card[]): number {
  const all = [...hole, ...community]
  let best = 0
  for (let i = 0; i < all.length - 4; i++)
    for (let j = i + 1; j < all.length - 3; j++)
      for (let k = j + 1; k < all.length - 2; k++)
        for (let l = k + 1; l < all.length - 1; l++)
          for (let m = l + 1; m < all.length; m++)
            best = Math.max(best, handRank([all[i], all[j], all[k], all[l], all[m]]))
  return best
}

export function initGame(players: string[]): PokerState {
  const deck = shuffle(createDeck())
  const hands: Record<string, Card[]> = {}
  const stacks: Record<string, number> = {}
  let remaining = [...deck]
  players.forEach(p => { hands[p] = remaining.slice(0, 2); stacks[p] = 1000; remaining = remaining.slice(2) })
  return {
    hands, community: [], deck: remaining, pot: 0,
    bets: Object.fromEntries(players.map(p => [p, 0])),
    stacks, players, activePlayers: [...players],
    currentPlayer: players[0], phase: 'preflop', dealer: 0, winner: null,
  }
}

export function applyAction(state: PokerState, action: PokerAction, playerId: string): PokerState {
  if (state.phase === 'done' || playerId !== state.currentPlayer) return state

  let activePlayers = [...state.activePlayers]
  let stacks = { ...state.stacks }
  let bets = { ...state.bets }
  let pot = state.pot

  if (action.type === 'fold') {
    activePlayers = activePlayers.filter(p => p !== playerId)
    if (activePlayers.length === 1) {
      return { ...state, activePlayers, stacks: { ...stacks, [activePlayers[0]]: stacks[activePlayers[0]] + pot }, pot: 0, phase: 'done', winner: activePlayers[0] }
    }
  }

  if (action.type === 'call') {
    const maxBet = Math.max(...Object.values(bets))
    const toCall = maxBet - bets[playerId]
    stacks[playerId] -= toCall
    pot += toCall
    bets[playerId] += toCall
  }

  if (action.type === 'raise') {
    const maxBet = Math.max(...Object.values(bets))
    const toCall = maxBet - bets[playerId]
    const total = toCall + action.amount
    stacks[playerId] -= total
    pot += total
    bets[playerId] += total
  }

  const idx = activePlayers.indexOf(playerId)
  const nextPlayer = activePlayers[(idx + 1) % activePlayers.length]
  const allCalled = activePlayers.every(p => bets[p] === Math.max(...Object.values(bets)))

  let phase = state.phase
  let community = [...state.community]
  let deck = [...state.deck]

  if (allCalled && nextPlayer === activePlayers[0]) {
    bets = Object.fromEntries(state.players.map(p => [p, 0]))
    if (phase === 'preflop') { community = deck.slice(0, 3); deck = deck.slice(3); phase = 'flop' }
    else if (phase === 'flop') { community = [...community, deck[0]]; deck = deck.slice(1); phase = 'turn' }
    else if (phase === 'turn') { community = [...community, deck[0]]; deck = deck.slice(1); phase = 'river' }
    else if (phase === 'river') {
      const ranks = activePlayers.map(p => ({ p, r: bestHand(state.hands[p], community) }))
      ranks.sort((a, b) => b.r - a.r)
      const winner = ranks[0].p
      return { ...state, community, deck, bets, pot: 0, stacks: { ...stacks, [winner]: stacks[winner] + pot }, activePlayers, phase: 'done', winner, currentPlayer: nextPlayer }
    }
  }

  return { ...state, activePlayers, stacks, bets, pot, phase, community, deck, currentPlayer: nextPlayer }
}

export function isGameOver(state: PokerState): boolean { return state.phase === 'done' }
export function getValidActions(state: PokerState, playerId: string): PokerAction[] {
  if (playerId !== state.currentPlayer) return []
  const maxBet = Math.max(...Object.values(state.bets))
  const actions: PokerAction[] = [{ type: 'fold' }]
  if (state.bets[playerId] < maxBet) actions.push({ type: 'call' })
  else actions.push({ type: 'check' })
  if (state.stacks[playerId] > 0) actions.push({ type: 'raise', amount: 50 })
  return actions
}
export function getResult(state: PokerState): GameResult {
  return { winner: state.winner, scores: state.stacks }
}
