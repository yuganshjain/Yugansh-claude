'use client'

import { useState } from 'react'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/memory/logic'
import type { MemoryState } from '@/lib/games/memory/logic'

const SUIT_SYMBOLS: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const SUIT_COLORS: Record<string, string> = { hearts: '#ef4444', diamonds: '#ef4444', clubs: '#c4b5fd', spades: '#c4b5fd' }

export function MemoryBoard() {
  const [state, setState] = useState<MemoryState>(() => initGame(['player']))
  const reset = () => setState(initGame(['player']))

  const flip = (id: number) => {
    if (state.flipped.length >= 2) return
    setState(prev => applyAction(prev, { type: 'flip', cardId: id }, 'player'))
  }

  const over = isGameOver(state)
  const score = state.scores['player'] ?? 0

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-400">Pairs: <span className="text-violet-400 font-bold">{score}</span></div>
          <div className="text-sm text-gray-400">Remaining: <span className="text-white font-bold">{(state.board.length - state.matched.length) / 2}</span></div>
        </div>

        {over && (
          <div className="text-center mb-6">
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: '#4ade80' }}>🎉 Complete! {score} pairs</div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {state.board.map(card => {
            const visible = card.flipped || card.matched
            return (
              <button key={card.id} onClick={() => !visible && !over && flip(card.id)}
                className="aspect-[3/4] rounded-xl border-2 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: card.matched ? 'rgba(74,222,128,0.15)' : visible ? '#fff' : 'linear-gradient(135deg,#1e1b4b,#312e81)',
                  borderColor: card.matched ? '#4ade80' : visible ? '#e2e8f0' : 'rgba(124,58,237,0.4)',
                  transform: visible ? 'rotateY(0deg)' : 'rotateY(0deg)',
                  cursor: visible || over ? 'default' : 'pointer',
                }}>
                {visible ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black" style={{ color: SUIT_COLORS[card.suit] }}>{SUIT_SYMBOLS[card.suit]}</div>
                    <div className="text-xs font-black mt-1" style={{ color: SUIT_COLORS[card.suit] }}>{card.rank}</div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-violet-400 text-xl opacity-50">★</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Table>
  )
}
