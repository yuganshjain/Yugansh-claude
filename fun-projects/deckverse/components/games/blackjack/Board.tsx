'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver, getResult, handScore } from '@/lib/games/blackjack/logic'
import type { BlackjackState, BlackjackAction } from '@/lib/games/blackjack/logic'

export function BlackjackBoard() {
  const [state, setState] = useState<BlackjackState>(() => initGame(['player']))

  const act = (action: BlackjackAction) => {
    setState(prev => applyAction(prev, action))
  }

  const reset = () => setState(initGame(['player']))

  const over = isGameOver(state)
  const result = over ? getResult(state) : null
  const playerScore = handScore(state.playerHand)
  const dealerScore = handScore(state.dealerHand)

  return (
    <Table>
      {/* Outcome Banner */}
      {over && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="text-7xl font-black mb-4"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '0 0 60px currentColor',
                color: state.outcome === 'win' ? '#4ade80' : state.outcome === 'draw' ? '#facc15' : '#f87171',
              }}>
              {state.outcome === 'win' ? '🎉 You Win!' : state.outcome === 'draw' ? '🤝 Draw' : '💀 Bust!'}
            </div>
            <button onClick={reset}
              className="px-8 py-3 rounded-xl font-bold text-lg"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Dealer */}
      <div className="mb-12 text-center">
        <div className="text-sm text-gray-400 tracking-widest uppercase mb-4">Dealer {over ? `— ${dealerScore}` : ''}</div>
        <div className="flex gap-3 justify-center flex-wrap">
          {state.dealerHand.map((c, i) => (
            <Card key={i} card={c} faceDown={i === 1 && !over} animate size="md" />
          ))}
        </div>
      </div>

      {/* Center Divider */}
      <div className="w-64 h-px my-6 mx-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Player */}
      <div className="mt-6 text-center">
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          {state.playerHand.map((c, i) => (
            <Card key={i} card={c} animate size="md" />
          ))}
        </div>
        <div className="text-sm text-gray-400 tracking-widest uppercase mb-8">You — {playerScore}</div>

        {/* Actions */}
        {!over && (
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => act({ type: 'hit' })}
              className="px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              Hit
            </button>
            <button onClick={() => act({ type: 'stand' })}
              className="px-6 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-all">
              Stand
            </button>
            {state.playerHand.length === 2 && (
              <button onClick={() => act({ type: 'double' })}
                className="px-6 py-3 rounded-xl font-bold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-all">
                Double
              </button>
            )}
          </div>
        )}
      </div>
    </Table>
  )
}
