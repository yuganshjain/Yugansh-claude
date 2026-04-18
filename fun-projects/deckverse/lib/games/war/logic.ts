import { createDeck, shuffle, rankOrder } from '../deck'
import type { Card, GameResult } from '../types'

export type WarState = {
  playerPile: Card[]
  opponentPile: Card[]
  playerCard: Card | null
  opponentCard: Card | null
  warPile: Card[]
  phase: 'flip' | 'war' | 'done'
  outcome: 'win' | 'loss' | 'draw' | null
  players: string[]
  round: number
}

export type WarAction = { type: 'flip' }

export function initGame(players: string[]): WarState {
  const deck = shuffle(createDeck())
  return {
    playerPile: deck.slice(0, 26),
    opponentPile: deck.slice(26),
    playerCard: null,
    opponentCard: null,
    warPile: [],
    phase: 'flip',
    outcome: null,
    players,
    round: 0,
  }
}

export function applyAction(state: WarState, action: WarAction): WarState {
  if (action.type !== 'flip' || state.phase === 'done') return state

  if (!state.playerPile.length || !state.opponentPile.length) {
    return {
      ...state,
      phase: 'done',
      outcome: !state.playerPile.length ? 'loss' : 'win',
    }
  }

  const [playerCard, ...playerPile] = state.playerPile
  const [opponentCard, ...opponentPile] = state.opponentPile
  const warPile = [...state.warPile, playerCard, opponentCard]

  const pRank = rankOrder(playerCard.rank)
  const oRank = rankOrder(opponentCard.rank)

  if (pRank > oRank) {
    return { ...state, playerCard, opponentCard, playerPile: [...playerPile, ...warPile], opponentPile, warPile: [], phase: 'flip', round: state.round + 1 }
  } else if (oRank > pRank) {
    return { ...state, playerCard, opponentCard, playerPile, opponentPile: [...opponentPile, ...warPile], warPile: [], phase: 'flip', round: state.round + 1 }
  } else {
    if (playerPile.length < 3 || opponentPile.length < 3) {
      return { ...state, playerCard, opponentCard, phase: 'done', outcome: 'draw' }
    }
    return {
      ...state, playerCard, opponentCard,
      playerPile: playerPile.slice(3),
      opponentPile: opponentPile.slice(3),
      warPile: [...warPile, ...playerPile.slice(0, 3), ...opponentPile.slice(0, 3)],
      phase: 'war',
    }
  }
}

export function isGameOver(state: WarState): boolean { return state.phase === 'done' }
export function getValidActions(_state: WarState): WarAction[] { return [{ type: 'flip' }] }
export function getResult(state: WarState): GameResult {
  return {
    winner: state.outcome === 'win' ? state.players[0] : state.outcome === 'loss' ? 'opponent' : null,
    scores: { [state.players[0]]: state.playerPile.length },
  }
}
