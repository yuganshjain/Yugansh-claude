import type { ReactNode } from 'react'

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, #1a4a2a 0%, #0f2d1a 60%, #081a0f 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px),
                            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)`,
        }}
      />
      <div className="absolute inset-0 rounded-none"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)' }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        {children}
      </div>
    </div>
  )
}
