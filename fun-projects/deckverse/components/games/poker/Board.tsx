'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver, getValidActions } from '@/lib/games/poker/logic'
import type { PokerState } from '@/lib/games/poker/logic'

function aiTurn(s: PokerState): PokerState {
  while (s.currentPlayer === 'ai' && !isGameOver(s)) {
    const actions = getValidActions(s, 'ai')
    if (!actions.length) break
    const action = Math.random() > 0.3 ? (actions.find(a => a.type === 'call') ?? actions[0]) : actions[0]
    s = applyAction(s, action, 'ai')
  }
  return s
}

const PHASE_LABELS: Record<string, string> = { preflop: 'Pre-Flop', flop: 'Flop', turn: 'Turn', river: 'River', done: 'Showdown' }

export function PokerBoard() {
  const [state, setState] = useState<PokerState>(() => aiTurn(initGame(['player', 'ai'])))
  const reset = () => setState(aiTurn(initGame(['player', 'ai'])))

  const act = (type: string, amount?: number) => {
    const action = type === 'raise' ? { type: 'raise' as const, amount: amount ?? 50 } : { type: type as 'fold' | 'call' | 'check' }
    const s = applyAction(state, action, 'player')
    setState(aiTurn(s))
  }

  const over = isGameOver(state)
  const playerHand = state.hands['player'] ?? []
  const validActions = getValidActions(state, 'player')

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4 text-center">
        <div className="flex justify-between mb-4 text-sm">
          <div className="text-gray-400">AI Stack: <span className="text-white font-bold">${state.stacks['ai'] ?? 0}</span></div>
          <div className="text-violet-400 font-bold">Pot: ${state.pot}</div>
          <div className="text-gray-400">You: <span className="text-white font-bold">${state.stacks['player'] ?? 0}</span></div>
        </div>

        <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">{PHASE_LABELS[state.phase] ?? state.phase}</div>

        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">AI hand</div>
          <div className="flex gap-2 justify-center mb-4">
            {(state.hands['ai'] ?? []).map((c, i) => (
              <Card key={i} card={c} faceDown={!over} size="md" animate={false} />
            ))}
          </div>

          {state.community.length > 0 && (
            <>
              <div className="text-xs text-gray-400 mb-2">Community Cards</div>
              <div className="flex gap-2 justify-center mb-4">
                {state.community.map((c, i) => <Card key={i} card={c} size="md" animate />)}
              </div>
            </>
          )}

          <div className="text-xs text-gray-500 mb-2">Your hand</div>
          <div className="flex gap-2 justify-center">
            {playerHand.map((c, i) => <Card key={i} card={c} size="md" animate={false} />)}
          </div>
        </div>

        {over ? (
          <div>
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: state.winner === 'player' ? '#4ade80' : '#f87171' }}>
              {state.winner === 'player' ? '🎉 You Win!' : '💀 AI Wins!'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>New Hand</button>
          </div>
        ) : state.currentPlayer === 'player' ? (
          <div className="flex gap-3 justify-center flex-wrap">
            {validActions.map((a, i) => (
              <button key={i} onClick={() => act(a.type, a.type === 'raise' ? 50 : undefined)}
                className={`px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${a.type === 'fold' ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10' : a.type === 'raise' ? 'border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10' : ''}`}
                style={a.type === 'call' || a.type === 'check' ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)' } : {}}>
                {a.type === 'fold' ? 'Fold' : a.type === 'call' ? 'Call' : a.type === 'check' ? 'Check' : 'Raise $50'}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-yellow-400 animate-pulse">AI is thinking...</div>
        )}
      </div>
    </Table>
  )
}
