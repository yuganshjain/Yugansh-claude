'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/go-fish/logic'
import type { GoFishState } from '@/lib/games/go-fish/logic'
import type { Rank } from '@/lib/games/types'

function getAIAction(state: GoFishState) {
  const aiHand = state.hands['ai'] ?? []
  if (!aiHand.length) return null
  const ranks = [...new Set(aiHand.map(c => c.rank))]
  const rank = ranks[Math.floor(Math.random() * ranks.length)]
  return { type: 'ask' as const, targetPlayer: 'player', rank }
}

export function GoFishBoard() {
  const [state, setState] = useState<GoFishState>(() => initGame(['player', 'ai']))
  const [msg, setMsg] = useState('')

  const reset = () => { setState(initGame(['player', 'ai'])); setMsg('') }

  const ask = (rank: Rank) => {
    let s = applyAction(state, { type: 'ask', targetPlayer: 'ai', rank }, 'player')
    setMsg(s.lastAction ?? '')

    // AI turn
    while (s.currentPlayer === 'ai' && !isGameOver(s)) {
      const action = getAIAction(s)
      if (!action) break
      s = applyAction(s, action, 'ai')
      setMsg(s.lastAction ?? '')
    }
    setState(s)
  }

  const over = isGameOver(state)
  const playerHand = state.hands['player'] ?? []
  const playerRanks = [...new Set(playerHand.map(c => c.rank))]
  const playerBooks = state.books['player'] ?? []
  const aiBooks = state.books['ai'] ?? []

  return (
    <Table>
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="flex justify-between mb-6 text-sm">
          <div className="text-gray-400">AI hand: <span className="text-white font-bold">{state.hands['ai']?.length ?? 0}</span> · Books: <span className="text-violet-400 font-bold">{aiBooks.length}</span></div>
          <div className="text-gray-400">Deck: <span className="text-white font-bold">{state.deck.length}</span></div>
        </div>

        {msg && <div className="text-center text-sm text-yellow-300 mb-4 px-4 py-2 rounded-lg bg-yellow-400/10">{msg}</div>}

        {over ? (
          <div className="text-center py-8">
            <div className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia,serif', color: playerBooks.length > aiBooks.length ? '#4ade80' : '#f87171' }}>
              {playerBooks.length > aiBooks.length ? '🎉 You Win!' : playerBooks.length === aiBooks.length ? '🤝 Draw' : '💀 AI Wins!'}
            </div>
            <div className="text-gray-400 mb-4">You: {playerBooks.length} books · AI: {aiBooks.length} books</div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your Hand — ask for a rank:</div>
              <div className="flex flex-wrap gap-3 justify-center mb-4">
                {playerHand.map((c, i) => (
                  <div key={i} onClick={() => state.currentPlayer === 'player' && ask(c.rank)} className="cursor-pointer">
                    <Card card={c} size="sm" animate={false} />
                  </div>
                ))}
                {playerHand.length === 0 && <div className="text-gray-500 text-sm">No cards</div>}
              </div>
            </div>

            {playerBooks.length > 0 && (
              <div className="text-center text-sm text-emerald-400">
                Your books: {playerBooks.join(' ')}
              </div>
            )}

            <div className="text-center mt-4">
              {state.currentPlayer !== 'player' && (
                <div className="text-yellow-400 text-sm animate-pulse">AI is thinking...</div>
              )}
              {state.currentPlayer === 'player' && (
                <div className="text-gray-400 text-sm">Tap a card to ask the AI for that rank</div>
              )}
            </div>
          </>
        )}
      </div>
    </Table>
  )
}
