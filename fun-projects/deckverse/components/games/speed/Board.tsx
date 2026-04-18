'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/speed/logic'
import type { SpeedState } from '@/lib/games/speed/logic'
import type { Card as CardType } from '@/lib/games/types'
import { rankOrder } from '@/lib/games/deck'

function canPlayOn(card: CardType, pile: CardType[]) {
  if (!pile.length) return true
  const top = pile[pile.length - 1]
  const diff = Math.abs(rankOrder(card.rank) - rankOrder(top.rank))
  return diff === 1 || diff === 12
}

export function SpeedBoard() {
  const [state, setState] = useState<SpeedState>(() => initGame(['player', 'ai']))
  const [selected, setSelected] = useState<CardType | null>(null)

  // AI plays every 800ms
  useEffect(() => {
    if (isGameOver(state)) return
    const t = setInterval(() => {
      setState(prev => {
        const aiHand = prev.hands['ai'] ?? []
        for (const card of aiHand) {
          for (const pile of [0, 1] as const) {
            if (canPlayOn(card, prev.piles[pile])) {
              return applyAction(prev, { type: 'play', card, pile }, 'ai')
            }
          }
        }
        return prev
      })
    }, 800 + Math.random() * 400)
    return () => clearInterval(t)
  }, [state])

  const reset = () => { setState(initGame(['player', 'ai'])); setSelected(null) }

  const selectCard = (card: CardType) => setSelected(prev => prev?.rank === card.rank && prev?.suit === card.suit ? null : card)

  const playOnPile = (pile: 0 | 1) => {
    if (!selected) return
    setState(prev => applyAction(prev, { type: 'play', card: selected, pile }, 'player'))
    setSelected(null)
  }

  const flip = () => setState(prev => applyAction(prev, { type: 'flip' }, 'player'))

  const over = isGameOver(state)
  const playerHand = state.hands['player'] ?? []
  const aiHand = state.hands['ai'] ?? []

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4 text-center">
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">AI — {aiHand.length} cards + {state.stockpiles['ai']?.length ?? 0} stock</div>
          <div className="flex gap-2 justify-center">
            {aiHand.slice(0, 5).map((c, i) => <Card key={i} card={c} size="sm" animate={false} />)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 my-6">
          <div onClick={() => playOnPile(0)} className="cursor-pointer group">
            <div className="text-xs text-gray-400 mb-1">Pile 1</div>
            {state.piles[0].length
              ? <Card card={state.piles[0][state.piles[0].length - 1]} size="md" animate className="group-hover:scale-105 transition-transform" />
              : <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 text-xs">Empty</div>}
          </div>

          <button onClick={flip} className="px-4 py-2 rounded-lg text-xs font-bold border border-white/20 hover:bg-white/10">Flip</button>

          <div onClick={() => playOnPile(1)} className="cursor-pointer group">
            <div className="text-xs text-gray-400 mb-1">Pile 2</div>
            {state.piles[1].length
              ? <Card card={state.piles[1][state.piles[1].length - 1]} size="md" animate className="group-hover:scale-105 transition-transform" />
              : <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 text-xs">Empty</div>}
          </div>
        </div>

        {over ? (
          <div className="py-4">
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: state.winner === 'player' ? '#4ade80' : '#f87171' }}>
              {state.winner === 'player' ? '⚡ SPEED! You Win!' : '💀 AI Won!'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Your hand — tap to select, tap pile to play</div>
            <div className="flex gap-2 justify-center">
              {playerHand.map((c, i) => (
                <div key={i} onClick={() => selectCard(c)}>
                  <Card card={c} size="sm" animate={false} selected={selected?.rank === c.rank && selected?.suit === c.suit} className="cursor-pointer" />
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">Stock: {state.stockpiles['player']?.length ?? 0}</div>
          </>
        )}
      </div>
    </Table>
  )
}
