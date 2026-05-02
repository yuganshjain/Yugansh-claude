import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-violet-700">
          <span>🌙</span> Lumio
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Sign in
          </Link>
          <Link href="/register"
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          ✨ AI-powered mental wellness journaling
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your thoughts deserve
          <span className="text-violet-600"> to be understood</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Write your daily journal and get a thoughtful AI response, weekly mood reports, and monthly emotional insights — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register"
            className="bg-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-violet-700 transition shadow-lg shadow-violet-200">
            Start journaling free
          </Link>
          <span className="text-sm text-gray-400">Free to get started · No credit card</span>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "✍️", title: "Write freely", desc: "Type your thoughts in a distraction-free editor. Your safe space." },
            { icon: "🤖", title: "AI responds daily", desc: "After every entry, get a warm, therapist-style insight and a follow-up question." },
            { icon: "📊", title: "Weekly reports", desc: "Mood trends, emotional triggers, and growth patterns delivered every Sunday." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { step: "1", title: "Write daily", desc: "Spend 5 minutes journaling your thoughts and mood" },
            { step: "2", title: "Get insight", desc: "AI analyzes your entry and responds with empathy" },
            { step: "3", title: "See patterns", desc: "Weekly reports reveal your emotional trends" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100">
        © 2026 Lumio · Built with care
      </footer>
    </div>
  );
}
