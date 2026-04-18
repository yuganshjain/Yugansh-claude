'use client'

import { useState } from 'react'
import { Card } from '@/components/games/shared/Card'
import { Table } from '@/components/games/shared/Table'
import { initGame, applyAction, isGameOver } from '@/lib/games/solitaire/logic'
import type { SolitaireState } from '@/lib/games/solitaire/logic'
import type { Suit } from '@/lib/games/types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const SUIT_SYMBOLS: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }

type Selection = { source: 'waste' | 'tableau'; col?: number; cardIndex?: number }

export function SolitaireBoard() {
  const [state, setState] = useState<SolitaireState>(() => initGame(['player']))
  const [sel, setSel] = useState<Selection | null>(null)
  const reset = () => { setState(initGame(['player'])); setSel(null) }

  const act = (action: Parameters<typeof applyAction>[1]) => setState(prev => applyAction(prev, action))

  const clickWaste = () => {
    if (!state.waste.length) return
    if (sel?.source === 'waste') { setSel(null); return }
    setSel({ source: 'waste' })
  }

  const clickTableauCol = (col: number) => {
    const column = state.tableau[col]
    if (sel) {
      if (sel.source === 'waste') {
        act({ type: 'wasteToTableau', col })
        setSel(null)
      } else if (sel.source === 'tableau' && sel.col !== undefined && sel.cardIndex !== undefined) {
        act({ type: 'tableauToTableau', fromCol: sel.col, toCol: col, cardIndex: sel.cardIndex })
        setSel(null)
      }
    } else {
      const topIdx = column.length - 1
      if (topIdx >= 0) setSel({ source: 'tableau', col, cardIndex: topIdx })
    }
  }

  const clickFoundation = (suit: Suit) => {
    if (sel?.source === 'waste') { act({ type: 'wasteToFoundation' }); setSel(null) }
    else if (sel?.source === 'tableau' && sel.col !== undefined) { act({ type: 'tableauToFoundation', fromCol: sel.col }); setSel(null) }
  }

  const over = isGameOver(state)

  return (
    <Table>
      <div className="w-full max-w-xl mx-auto px-2">
        {over && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="text-5xl font-black mb-4" style={{ fontFamily: 'Georgia,serif', color: '#4ade80' }}>🎉 You Won!</div>
              <div className="text-gray-400 mb-4">{state.moves} moves</div>
              <button onClick={reset} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>New Game</button>
            </div>
          </div>
        )}

        {/* Top row: Stock + Waste + Foundations */}
        <div className="flex gap-2 mb-4 justify-between">
          <div className="flex gap-2">
            <div onClick={() => act({ type: 'draw' })} className="cursor-pointer">
              {state.stock.length
                ? <Card faceDown size="sm" animate={false} />
                : <div className="w-14 h-20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-lg cursor-pointer hover:border-violet-400">↺</div>}
            </div>
            <div onClick={clickWaste} className="cursor-pointer">
              {state.waste.length
                ? <Card card={state.waste[state.waste.length - 1]} size="sm" animate={false} selected={sel?.source === 'waste'} />
                : <div className="w-14 h-20 rounded-lg border-2 border-dashed border-white/10" />}
            </div>
          </div>
          <div className="flex gap-1">
            {SUITS.map(suit => (
              <div key={suit} onClick={() => clickFoundation(suit)} className="cursor-pointer">
                {state.foundations[suit].length
                  ? <Card card={state.foundations[suit][state.foundations[suit].length - 1]} size="sm" animate={false} />
                  : <div className="w-14 h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 text-lg">{SUIT_SYMBOLS[suit]}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="flex gap-1 justify-center">
          {state.tableau.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ minWidth: 44 }}>
              {col.length === 0
                ? <div onClick={() => clickTableauCol(ci)} className="w-11 h-16 rounded-lg border-2 border-dashed border-white/10 cursor-pointer hover:border-violet-400/40" />
                : col.map((c, i) => {
                  const isTop = i === col.length - 1
                  const isSelected = sel?.source === 'tableau' && sel.col === ci && sel.cardIndex === i
                  return (
                    <div key={i} onClick={() => isTop && clickTableauCol(ci)}
                      className={`relative ${i > 0 ? '-mt-14' : ''} ${isTop ? 'cursor-pointer' : ''}`}
                      style={{ zIndex: i }}>
                      <Card card={(c as any).faceDown ? undefined : c} faceDown={(c as any).faceDown} size="sm" animate={false} selected={isSelected} />
                    </div>
                  )
                })}
            </div>
          ))}
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">Moves: {state.moves} · Tap stock to draw · Tap cards to move</div>
      </div>
    </Table>
  )
}
