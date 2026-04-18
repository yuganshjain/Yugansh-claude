'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver, isValidMeld } from '@/lib/games/rummy/logic'
import type { RummyState } from '@/lib/games/rummy/logic'
import type { Card as CardType } from '@/lib/games/types'

function aiTurn(s: RummyState): RummyState {
  if (s.currentPlayer !== 'ai' || isGameOver(s)) return s
  // Draw
  s = applyAction(s, { type: 'drawDeck' }, 'ai')
  // Try to meld
  const hand = s.hands['ai'] ?? []
  for (let i = 0; i < hand.length - 2; i++) {
    for (let j = i + 1; j < hand.length - 1; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        const meld = [hand[i], hand[j], hand[k]]
        if (isValidMeld(meld)) {
          s = applyAction(s, { type: 'meld', cards: meld }, 'ai')
          break
        }
      }
    }
  }
  // Discard
  const remaining = s.hands['ai'] ?? []
  if (remaining.length > 0) s = applyAction(s, { type: 'discard', card: remaining[remaining.length - 1] }, 'ai')
  return s
}

export function RummyBoard() {
  const [state, setState] = useState<RummyState>(() => initGame(['player', 'ai']))
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const reset = () => { setState(initGame(['player', 'ai'])); setSelected(new Set()) }

  const toggleCard = (i: number) => {
    const s = new Set(selected)
    s.has(i) ? s.delete(i) : s.add(i)
    setSelected(s)
  }

  const draw = (from: 'drawDeck' | 'drawDiscard') => {
    if (state.phase !== 'draw' || state.currentPlayer !== 'player') return
    setState(prev => applyAction(prev, { type: from }, 'player'))
  }

  const meld = () => {
    const hand = state.hands['player'] ?? []
    const cards = [...selected].map(i => hand[i])
    if (!isValidMeld(cards)) return
    let s = applyAction(state, { type: 'meld', cards }, 'player')
    setSelected(new Set())
    setState(s)
  }

  const discard = () => {
    if (selected.size !== 1) return
    const hand = state.hands['player'] ?? []
    const [idx] = [...selected]
    let s = applyAction(state, { type: 'discard', card: hand[idx] }, 'player')
    setSelected(new Set())
    s = aiTurn(s)
    setState(s)
  }

  const over = isGameOver(state)
  const hand = state.hands['player'] ?? []
  const top = state.discardPile[state.discardPile.length - 1]
  const selectedCards = [...selected].map(i => hand[i])
  const canMeld = selected.size >= 3 && isValidMeld(selectedCards)

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="flex justify-between mb-4 text-sm">
          <div className="text-gray-400">AI: <span className="text-white font-bold">{state.hands['ai']?.length ?? 0} cards</span> · Melds: <span className="text-violet-400">{state.melds['ai']?.length ?? 0}</span></div>
          <div className="text-gray-400">Deck: <span className="text-white font-bold">{state.deck.length}</span></div>
        </div>

        <div className="flex gap-6 justify-center mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Deck</div>
            <div onClick={() => draw('drawDeck')} className={state.phase === 'draw' && state.currentPlayer === 'player' ? 'cursor-pointer' : 'opacity-40'}>
              <Card faceDown size="md" animate={false} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Discard</div>
            {top
              ? <div onClick={() => draw('drawDiscard')} className={state.phase === 'draw' && state.currentPlayer === 'player' ? 'cursor-pointer' : 'opacity-40'}><Card card={top} size="md" animate={false} /></div>
              : <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/10" />}
          </div>
        </div>

        {over ? (
          <div className="text-center py-4">
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: state.winner === 'player' ? '#4ade80' : '#f87171' }}>
              {state.winner === 'player' ? '🎉 You Win!' : '💀 AI Wins!'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 text-center">
              {state.phase === 'draw' ? 'Draw a card' : 'Select cards to meld, then discard one'} · {state.currentPlayer === 'ai' ? '(AI turn)' : '(Your turn)'}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {hand.map((c, i) => (
                <div key={i} onClick={() => state.phase === 'meld' && state.currentPlayer === 'player' && toggleCard(i)}>
                  <Card card={c} size="sm" animate={false} selected={selected.has(i)} className={state.phase === 'meld' && state.currentPlayer === 'player' ? 'cursor-pointer' : ''} />
                </div>
              ))}
            </div>
            {state.phase === 'meld' && state.currentPlayer === 'player' && (
              <div className="flex gap-3 justify-center">
                <button onClick={meld} disabled={!canMeld} className="px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Meld ({selected.size})</button>
                <button onClick={discard} disabled={selected.size !== 1} className="px-5 py-2 rounded-xl font-bold text-sm border border-white/20 disabled:opacity-40 hover:bg-white/10">Discard</button>
              </div>
            )}
            {state.melds['player']?.length > 0 && (
              <div className="text-center mt-3 text-xs text-emerald-400">Your melds: {state.melds['player'].length}</div>
            )}
          </>
        )}
      </div>
    </Table>
  )
}
