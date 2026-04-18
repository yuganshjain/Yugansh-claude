'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/snap/logic'
import type { SnapState } from '@/lib/games/snap/logic'

export function SnapBoard() {
  const [state, setState] = useState<SnapState>(() => initGame(['player', 'ai']))
  const [msg, setMsg] = useState('')
  const reset = () => { setState(initGame(['player', 'ai'])); setMsg('') }

  // AI auto-plays
  useEffect(() => {
    if (isGameOver(state) || state.currentPlayer !== 'ai') return
    const delay = 600 + Math.random() * 400
    const t = setTimeout(() => {
      setState(prev => {
        const top2 = prev.centerPile.slice(-2)
        if (top2.length === 2 && top2[0].rank === top2[1].rank && Math.random() > 0.4) {
          setMsg('AI snapped!')
          return applyAction(prev, { type: 'snap' }, 'ai')
        }
        return applyAction(prev, { type: 'play' }, 'ai')
      })
    }, delay)
    return () => clearTimeout(t)
  }, [state])

  const play = () => { if (!isGameOver(state)) setState(prev => applyAction(prev, { type: 'play' }, 'player')) }
  const snap = () => {
    setState(prev => {
      const top2 = prev.centerPile.slice(-2)
      if (top2.length === 2 && top2[0].rank === top2[1].rank) setMsg('SNAP! You got it!')
      else setMsg('Wrong snap! -1 card penalty')
      return applyAction(prev, { type: 'snap' }, 'player')
    })
  }

  const over = isGameOver(state)
  const top = state.centerPile[state.centerPile.length - 1]
  const second = state.centerPile[state.centerPile.length - 2]
  const isMatch = top && second && top.rank === second.rank

  return (
    <Table>
      <div className="text-center">
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">AI</div>
          <div className="text-violet-400 font-bold">{state.piles['ai']?.length ?? 0} cards</div>
        </div>

        <div className="relative w-48 h-36 mx-auto mb-4">
          {second && <div className="absolute left-4 top-2 opacity-70"><Card card={second} size="md" animate={false} /></div>}
          {top && <div className="absolute right-4 top-0"><Card card={top} size="md" animate /></div>}
          {!top && <div className="w-full h-full rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 text-sm">Empty</div>}
        </div>

        {isMatch && (
          <div className="text-yellow-400 font-black text-2xl animate-bounce mb-2">SNAP!</div>
        )}

        {msg && <div className="text-sm text-gray-300 mb-3 h-5">{msg}</div>}

        <div className="mb-4">
          <div className="text-violet-400 font-bold">{state.piles['player']?.length ?? 0} cards</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">You</div>
        </div>

        {over ? (
          <div className="text-center">
            <div className="text-4xl font-black mb-4" style={{ fontFamily: 'Georgia,serif', color: state.winner === 'player' ? '#4ade80' : '#f87171' }}>
              {state.winner === 'player' ? '🎉 You Win!' : '💀 AI Wins!'}
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>Play Again</button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center mt-4">
            <button onClick={play} disabled={state.currentPlayer !== 'player'}
              className="px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              🃏 Flip
            </button>
            <button onClick={snap}
              className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-all hover:scale-105">
              👏 SNAP!
            </button>
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">{state.centerPile.length} cards in center</div>
      </div>
    </Table>
  )
}
