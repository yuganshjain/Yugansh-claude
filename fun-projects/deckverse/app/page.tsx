import Link from 'next/link'
import { Nav } from '@/components/ui/Nav'
import { GAME_META, GAME_SLUGS } from '@/lib/games/types'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Nav />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 60% 40%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)',
        }} />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase text-violet-300 border border-violet-500/30"
            style={{ background: 'rgba(124,58,237,0.15)' }}>
            ✦ 10 Games · Solo + Multiplayer · Free Forever
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            The World&apos;s Most<br />
            <span className="text-violet-400" style={{ textShadow: '0 0 60px rgba(168,85,247,0.6)' }}>Beautiful</span><br />
            Card Game Hub
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            All your favourite card games in one place — stunning 3D animations, step-by-step tutorials, and live multiplayer rooms.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/games"
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
              🃏 Start Playing
            </Link>
            <Link href="/room/create"
              className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/10 hover:bg-white/5 transition-all">
              👥 Create Room
            </Link>
          </div>
        </div>

        {/* Floating 3D Cards */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:block" style={{ perspective: '800px' }}>
          {[
            { suit: '♠', label: 'Ace', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: '#c4b5fd', rot: 'rotateY(-25deg) rotateZ(-8deg)' },
            { suit: '♥', label: 'King', bg: '#fff', color: '#ef4444', rot: 'rotateY(-5deg) rotateZ(-2deg)' },
            { suit: '♦', label: 'Jack', bg: '#fff', color: '#ef4444', rot: 'rotateY(15deg) rotateZ(8deg)' },
          ].map((c, i) => (
            <div key={i} className="absolute w-24 h-36 rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl"
              style={{ background: c.bg, borderColor: 'rgba(255,255,255,0.2)', transform: c.rot, top: `${i * 50 - 50}px`, left: `${i * 30}px`, zIndex: i }}>
              <span className="text-4xl font-black" style={{ color: c.color }}>{c.suit}</span>
              <span className="text-xs font-bold mt-1" style={{ color: c.color, opacity: 0.7 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="flex justify-center gap-16 py-8 border-y border-white/5">
        {[['10', 'Card Games'], ['3D', 'Animations'], ['∞', 'Multiplayer Rooms'], ['Free', 'Forever']].map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="text-3xl font-black text-violet-400">{n}</div>
            <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Games Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>Choose Your Game</h2>
          <p className="text-gray-500">Every game includes a full tutorial, solo AI mode, and live multiplayer</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {GAME_SLUGS.map(slug => {
            const m = GAME_META[slug]
            return (
              <Link key={slug} href={`/games/${slug}`}
                className="group relative p-5 rounded-2xl border border-white/5 text-center transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/20"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-4xl mb-3">{m.icon}</div>
                <div className="text-sm font-bold text-gray-200 mb-2">{m.name}</div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {m.hasSolo && <span className="text-[10px] px-2 py-0.5 rounded-full text-violet-300" style={{ background: 'rgba(124,58,237,0.2)' }}>Solo</span>}
                  {m.hasMulti && <span className="text-[10px] px-2 py-0.5 rounded-full text-emerald-300" style={{ background: 'rgba(16,185,129,0.15)' }}>Live</span>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Multiplayer CTA */}
      <section className="max-w-xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-2xl p-10 border border-violet-500/20" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(168,85,247,0.04))' }}>
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>Play with Friends</h2>
          <p className="text-gray-400 mb-6 text-sm">Create a room, share the code — no account needed to join</p>
          <div className="text-5xl font-mono tracking-[0.3em] text-violet-400 font-black mb-2" style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
            DECK42
          </div>
          <p className="text-xs text-gray-600 mb-8">example room code</p>
          <Link href="/room/create"
            className="inline-block px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
            Create Your Room
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-600">
        © 2025 DeckVerse · Built for card game lovers everywhere · Free Forever
      </footer>
    </div>
  )
}
