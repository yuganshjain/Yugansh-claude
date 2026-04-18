'use client'

import { useRef, useEffect } from 'react'
import type { Card as CardType } from '@/lib/games/types'

const SUIT_SYMBOLS: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const SUIT_COLORS: Record<string, string> = { hearts: '#ef4444', diamonds: '#ef4444', clubs: '#1e1b4b', spades: '#1e1b4b' }

interface CardProps {
  card?: CardType
  faceDown?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  animate?: boolean
}

const SIZES = { sm: 'w-14 h-20', md: 'w-20 h-28', lg: 'w-24 h-36' }

export function Card({ card, faceDown = false, onClick, className = '', size = 'md', selected = false, animate = true }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animate || !ref.current) return
    // CSS-based entrance — no async dependency, always fires
    ref.current.style.opacity = '0'
    ref.current.style.transform = 'translateY(-20px) rotateY(-15deg)'
    const t = setTimeout(() => {
      if (!ref.current) return
      ref.current.style.transition = 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'translateY(0) rotateY(0deg)'
    }, 30)
    return () => clearTimeout(t)
  }, [animate])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || faceDown) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18
    ref.current.style.transition = 'transform 0.15s ease'
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)'
    ref.current.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  const sizeClass = SIZES[size]
  const color = card ? SUIT_COLORS[card.suit] : '#1e1b4b'

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        ${sizeClass} relative rounded-xl cursor-pointer select-none
        ${selected ? 'ring-2 ring-violet-400 -translate-y-3' : ''}
        ${onClick ? 'hover:shadow-2xl hover:shadow-violet-500/30' : ''}
        ${className}
      `}
      style={{ transformStyle: 'preserve-3d', perspective: '600px' }}
    >
      {faceDown ? (
        <div className="absolute inset-0 rounded-xl border-2 border-violet-700/60 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)' }}>
          <div className="absolute inset-[6px] rounded-lg border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-400 text-2xl opacity-60">★</span>
          </div>
          <div className="absolute inset-0 rounded-xl"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 60%)' }} />
        </div>
      ) : (
        <div className="absolute inset-0 rounded-xl bg-white border border-gray-200 overflow-hidden flex flex-col p-1.5"
          style={{ boxShadow: '0 10px 36px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '0.75rem', pointerEvents: 'none',
            background: 'linear-gradient(135deg,rgba(255,255,255,0.55) 0%,transparent 55%)' }} />
          <div className="flex flex-col h-full relative z-10">
            <div>
              <div className="text-xs font-black leading-none" style={{ color }}>{card?.rank}</div>
              <div className="text-xs leading-none" style={{ color }}>{card ? SUIT_SYMBOLS[card.suit] : ''}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="font-black" style={{ color, fontSize: size === 'lg' ? '2.5rem' : size === 'md' ? '2rem' : '1.4rem', lineHeight: 1 }}>
                {card ? SUIT_SYMBOLS[card.suit] : ''}
              </span>
            </div>
            <div className="rotate-180 self-start">
              <div className="text-xs font-black leading-none" style={{ color }}>{card?.rank}</div>
              <div className="text-xs leading-none" style={{ color }}>{card ? SUIT_SYMBOLS[card.suit] : ''}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
