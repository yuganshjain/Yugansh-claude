import { createDeck, shuffle } from '../deck'
import type { Card, GameResult, Suit } from '../types'

export type SolitaireState = {
  tableau: Card[][]
  foundations: Record<Suit, Card[]>
  stock: Card[]
  waste: Card[]
  phase: 'playing' | 'done'
  players: string[]
  moves: number
}

export type SolitaireAction =
  | { type: 'draw' }
  | { type: 'wasteToTableau'; col: number }
  | { type: 'wasteToFoundation' }
  | { type: 'tableauToFoundation'; fromCol: number }
  | { type: 'tableauToTableau'; fromCol: number; toCol: number; cardIndex: number }

const SUIT_ORDER: Record<Suit, Suit> = { hearts: 'hearts', diamonds: 'diamonds', clubs: 'clubs', spades: 'spades' }
const RED_SUITS: Suit[] = ['hearts', 'diamonds']

function isRed(suit: Suit) { return RED_SUITS.includes(suit) }
function rankVal(rank: string): number {
  const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  return order.indexOf(rank)
}

function canStackTableau(card: Card, onto: Card | undefined): boolean {
  if (!onto) return card.rank === 'K'
  return isRed(card.suit) !== isRed(onto.suit) && rankVal(card.rank) === rankVal(onto.rank) - 1
}

function canFoundation(card: Card, foundation: Card[]): boolean {
  if (!foundation.length) return card.rank === 'A'
  const top = foundation[foundation.length - 1]
  return card.suit === top.suit && rankVal(card.rank) === rankVal(top.rank) + 1
}

export function initGame(players: string[]): SolitaireState {
  const deck = shuffle(createDeck())
  const tableau: Card[][] = []
  let idx = 0
  for (let i = 0; i < 7; i++) {
    tableau.push(deck.slice(idx, idx + i + 1).map((c, j) => ({ ...c, faceDown: j < i } as Card & { faceDown?: boolean })))
    idx += i + 1
  }
  return {
    tableau,
    foundations: { hearts: [], diamonds: [], clubs: [], spades: [] },
    stock: deck.slice(idx),
    waste: [],
    phase: 'playing',
    players,
    moves: 0,
  }
}

export function applyAction(state: SolitaireState, action: SolitaireAction): SolitaireState {
  const s = { ...state, moves: state.moves + 1 }

  if (action.type === 'draw') {
    if (!s.stock.length) return { ...s, stock: [...s.waste].reverse(), waste: [] }
    return { ...s, stock: s.stock.slice(1), waste: [...s.waste, s.stock[0]] }
  }

  if (action.type === 'wasteToFoundation') {
    const card = s.waste[s.waste.length - 1]
    if (!card || !canFoundation(card, s.foundations[card.suit])) return state
    const foundations = { ...s.foundations, [card.suit]: [...s.foundations[card.suit], card] }
    const waste = s.waste.slice(0, -1)
    const done = Object.values(foundations).every(f => f.length === 13)
    return { ...s, foundations, waste, phase: done ? 'done' : 'playing' }
  }

  if (action.type === 'wasteToTableau') {
    const card = s.waste[s.waste.length - 1]
    const col = s.tableau[action.col]
    if (!card || !canStackTableau(card, col[col.length - 1])) return state
    const tableau = s.tableau.map((c, i) => i === action.col ? [...c, card] : c)
    return { ...s, tableau, waste: s.waste.slice(0, -1) }
  }

  if (action.type === 'tableauToFoundation') {
    const col = s.tableau[action.fromCol]
    const card = col[col.length - 1]
    if (!card || !canFoundation(card, s.foundations[card.suit])) return state
    const tableau = s.tableau.map((c, i) => i === action.fromCol ? c.slice(0, -1) : c)
    const foundations = { ...s.foundations, [card.suit]: [...s.foundations[card.suit], card] }
    const done = Object.values(foundations).every(f => f.length === 13)
    return { ...s, tableau, foundations, phase: done ? 'done' : 'playing' }
  }

  if (action.type === 'tableauToTableau') {
    const fromCol = s.tableau[action.fromCol]
    const toCol = s.tableau[action.toCol]
    const moving = fromCol.slice(action.cardIndex)
    if (!canStackTableau(moving[0], toCol[toCol.length - 1])) return state
    const tableau = s.tableau.map((c, i) => {
      if (i === action.fromCol) return c.slice(0, action.cardIndex)
      if (i === action.toCol) return [...c, ...moving]
      return c
    })
    return { ...s, tableau }
  }

  return state
}

export function isGameOver(state: SolitaireState): boolean { return state.phase === 'done' }
export function getValidActions(_state: SolitaireState): SolitaireAction[] { return [] }
export function getResult(state: SolitaireState): GameResult {
  const won = state.phase === 'done'
  return { winner: won ? state.players[0] : null, scores: { [state.players[0]]: won ? state.moves : 0 } }
}
