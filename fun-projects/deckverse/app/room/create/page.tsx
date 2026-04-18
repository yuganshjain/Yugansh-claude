'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS } from '@/lib/games/types'

export default function CreateRoomPage() {
  const params = useSearchParams()
  const defaultGame = params.get('game') ?? 'blackjack'
  const [game, setGame] = useState(defaultGame)
  const [name, setName] = useState('')

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />
      <div className="max-w-lg mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>Create a Room</h1>
          <p className="text-gray-400">Share the code — friends can join without an account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Your Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Choose Game</label>
            <div className="grid grid-cols-2 gap-2">
              {GAME_SLUGS.filter(s => GAME_META[s].hasMulti).map(slug => {
                const m = GAME_META[slug]
                return (
                  <button key={slug} onClick={() => setGame(slug)}
                    className={`p-3 rounded-xl border text-left transition-all ${game === slug ? 'border-violet-500 text-white' : 'border-white/5 text-gray-400 hover:border-white/10'}`}
                    style={{ background: game === slug ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)' }}>
                    <span className="mr-2">{m.icon}</span>
                    <span className="text-sm font-medium">{m.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            Create Room
          </button>
        </div>
      </div>
    </div>
  )
}
