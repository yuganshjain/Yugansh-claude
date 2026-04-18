'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver, getValidActions } from '@/lib/games/crazy-eights/logic'
import type { CrazyEightsState } from '@/lib/games/crazy-eights/logic'
import type { Suit } from '@/lib/games/types'

const SUIT_SYMBOLS: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

function aiMove(state: CrazyEightsState): CrazyEightsState {
  let s = state
  while (s.currentPlayer === 'ai' && !isGameOver(s)) {
    const actions = getValidActions(s, 'ai')
    if (!actions.length) break
    const play = actions.find(a => a.type === 'play') ?? actions[0]
    if (play.type === 'play' && play.card.rank === '8') {
      s = applyAction(s, { type: 'play', card: play.card, declaredSuit: 'hearts' }, 'ai')
    } else {
      s = applyAction(s, play, 'ai')
    }
  }
  return s
}

export function CrazyEightsBoard() {
  const [state, setState] = useState<CrazyEightsState>(() => initGame(['player', 'ai']))
  const [suitPicker, setSuitPicker] = useState<{ card: Parameters<typeof applyAction>[1] & { type: 'play' } } | null>(null)
  const reset = () => { setState(initGame(['player', 'ai'])); setSuitPicker(null) }

  const playCard = (action: Parameters<typeof applyAction>[1]) => {
    if (action.type !== 'play') return
    if (action.card.rank === '8') { setSuitPicker({ card: action }); return }
    let s = applyAction(state, action, 'player')
    setState(aiMove(s))
  }

  const pickSuit = (suit: Suit) => {
    if (!suitPicker) return
    let s = applyAction(state, { ...suitPicker.card, declaredSuit: suit }, 'player')
    setState(aiMove(s))
    setSuitPicker(null)
  }

  const draw = () => {
    let s = applyAction(state, { type: 'draw' }, 'player')
    setState(aiMove(s))
  }

  const over = isGameOver(state)
  const top = state.discardPile[state.discardPile.length - 1]
  const validActions = getValidActions(state, 'player')
  const canPlay = validActions.filter(a => a.type === 'play')
  const playableCards = new Set(canPlay.map(a => a.type === 'play' ? `${a.card.rank}-${a.card.suit}` : ''))

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4">
        {suitPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-violet-500/30">
              <div className="text-lg font-bold mb-4">Choose a suit</div>
              <div className="grid grid-cols-2 gap-3">
                {SUITS.map(s => (
                  <button key={s} onClick={() => pickSuit(s)}
                    className="p-4 rounded-xl border border-white/10 hover:bg-violet-500/20 transition-all text-2xl">
                    {SUIT_SYMBOLS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mb-4 text-sm">
          <div className="text-gray-400">AI: <span className="text-white font-bold">{state.hands['ai']?.length ?? 0} cards</span></div>
          <div className="text-gray-400">Deck: <span className="text-white font-bold">{state.deck.length}</span></div>
        </div>

        <div className="flex justify-center mb-2">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">Discard pile {state.declaredSuit ? `(${SUIT_SYMBOLS[state.declaredSuit]} declared)` : ''}</div>
            {top && <Card card={top} size="lg" animate />}
          </div>
        </div>

        {over ? (
          <div className="text-center py-6">
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: state.winner === 'player' ? '#4ade80' : '#f87171' }}>
              {state.winner === 'player' ? '🎉 You Win!' : '💀 AI Wins!'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-3 text-center">Your hand</div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {(state.hands['player'] ?? []).map((c, i) => {
                const isPlayable = playableCards.has(`${c.rank}-${c.suit}`) && state.currentPlayer === 'player'
                return (
                  <div key={i} onClick={() => isPlayable && playCard({ type: 'play', card: c })}
                    className={`transition-all ${isPlayable ? 'cursor-pointer -translate-y-2' : 'opacity-50 cursor-not-allowed'}`}>
                    <Card card={c} size="sm" animate={false} selected={isPlayable} />
                  </div>
                )
              })}
            </div>
            {state.currentPlayer === 'player' && validActions.some(a => a.type === 'draw') && (
              <div className="text-center">
                <button onClick={draw} className="px-6 py-2 rounded-xl border border-white/20 text-sm hover:bg-white/10">Draw Card</button>
              </div>
            )}
            {state.currentPlayer === 'ai' && <div className="text-center text-yellow-400 text-sm animate-pulse">AI is thinking...</div>}
          </>
        )}
      </div>
    </Table>
  )
}
