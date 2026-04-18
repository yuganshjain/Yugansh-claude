'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/war/logic'
import type { WarState } from '@/lib/games/war/logic'

export function WarBoard() {
  const [state, setState] = useState<WarState>(() => initGame(['player']))
  const reset = () => setState(initGame(['player']))

  const flip = () => {
    if (!isGameOver(state)) setState(prev => applyAction(prev, { type: 'flip' }))
  }

  const over = isGameOver(state)
  const playerWinning = state.playerPile.length > state.opponentPile.length

  return (
    <Table>
      {over && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <div className="text-6xl font-black mb-4" style={{ fontFamily: 'Georgia,serif', color: state.outcome === 'win' ? '#4ade80' : state.outcome === 'draw' ? '#facc15' : '#f87171' }}>
              {state.outcome === 'win' ? '🎉 You Win!' : state.outcome === 'draw' ? '🤝 Draw' : '💀 You Lose'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-xs text-gray-400 tracking-widest uppercase mb-2">Opponent</div>
        <div className="text-sm text-violet-400 font-bold mb-3">{state.opponentPile.length} cards</div>
        <div className="flex justify-center">
          {state.opponentCard
            ? <Card card={state.opponentCard} size="lg" animate />
            : <div className="w-24 h-36 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600">?</div>}
        </div>
      </div>

      {state.phase === 'war' && (
        <div className="text-center my-2 text-yellow-400 font-black text-xl tracking-widest animate-pulse">⚔️ WAR! ⚔️</div>
      )}

      <div className="text-center my-4 text-gray-500 text-xs">
        {state.warPile.length > 0 && `${state.warPile.length} cards in pot`}
      </div>

      <div className="text-center mt-6">
        <div className="flex justify-center mb-3">
          {state.playerCard
            ? <Card card={state.playerCard} size="lg" animate />
            : <div className="w-24 h-36 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600">?</div>}
        </div>
        <div className="text-sm text-violet-400 font-bold mb-2">{state.playerPile.length} cards</div>
        <div className="text-xs text-gray-400 tracking-widest uppercase mb-6">You</div>

        {!over && (
          <button onClick={flip}
            className="px-10 py-4 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
            {state.phase === 'war' ? '⚔️ BATTLE!' : '🃏 Flip!'}
          </button>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Round {state.round} · You: {state.playerPile.length} · Opponent: {state.opponentPile.length}
        </div>
      </div>
    </Table>
  )
}
