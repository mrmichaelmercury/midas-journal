'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, BarChart3, Brain, Shield, Zap, Users, ChevronRight, Star, ArrowRight, Copy, DollarSign } from 'lucide-react'

// Animated dashboard mockup
function DashboardMockup() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhase(p => Math.min(p + 1, 10)), 250)
    return () => clearInterval(t)
  }, [])

  const bars = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95]

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main card */}
      <div className="glass rounded-2xl p-5 shadow-xl border-gray-200">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">NQ Futures · Crazy Horse ORB</div>
            <div className="text-2xl font-black text-gray-900">
              {phase >= 10 ? <span className="text-emerald-500">+$4,230</span> : <span className="text-gray-300">Loading...</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">LIVE</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="h-28 flex items-end gap-1 mb-3">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className={`rounded-sm transition-all duration-300 ${i < phase ? 'bg-gradient-to-t from-amber-500 to-amber-300' : 'bg-gray-100'}`}
                style={{ height: `${i < phase ? h : 0}%` }}
              />
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {[
            { label: 'Win Rate', value: '71%', color: 'text-amber-500' },
            { label: 'Trades', value: '47', color: 'text-gray-700' },
            { label: 'Profit Factor', value: '2.1x', color: 'text-emerald-500' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -right-4 top-8 animate-float">
        <div className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 shadow-md">
          +$1,240 ✓
        </div>
      </div>
      <div className="absolute -left-4 bottom-12" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>
        <div className="bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 shadow-md">
          68.4% WR 🏆
        </div>
      </div>

      {/* Emotion card below */}
      <div className="glass rounded-xl p-4 mt-3 flex items-center justify-between shadow-sm">
        <div className="text-xs text-gray-500">Today&apos;s Emotional Check-In</div>
        <div className="flex gap-1.5">
          {['😤', '😐', '😊', '🔥', '💪'].map((e, i) => (
            <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${i === 4 ? 'bg-amber-100 border border-amber-300 scale-110' : 'bg-gray-50 border border-gray-100'}`}>
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        opacity: 0,
        animation: 'fadeSlideUp 0.7s ease-out forwards',
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/market-overview')
  }, [session, router])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <FadeIn delay={100}>
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">Midas</span>
              <span className="font-bold text-amber-500 text-lg tracking-tight"> Edge</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#strategy" className="hover:text-amber-500 transition-colors">Platform</a>
            <a href="#community" className="hover:text-amber-500 transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
              Sign In
            </Link>
            <a
              href="https://www.skool.com/midas-touch-challenge-5991/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-5 py-2 rounded-lg hover:shadow-md hover:shadow-amber-500/25 transition-all"
            >
              Join Midas Touch
            </a>
          </div>
        </nav>
      </FadeIn>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 bg-white">
        {/* Subtle background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <FadeIn delay={200}>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-700 text-sm font-medium">Included with Midas Touch Membership</span>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
                <span className="text-gray-900 block">Your Edge in</span>
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 bg-clip-text text-transparent block">
                  Every Trade.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={600}>
              <p className="text-lg text-gray-600 max-w-lg mb-10 leading-relaxed">
                Midas Edge is your complete trading toolkit — journal every trade, track emotions, get AI coaching, and analyze your performance. Built exclusively for the Midas Touch community.
              </p>
            </FadeIn>

            <FadeIn delay={800}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <a
                  href="https://www.skool.com/midas-touch-challenge-5991/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-xl text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all transform hover:scale-105"
                >
                  Join Midas Touch
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link href="/login" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl text-lg hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                  Sign In
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={900}>
              <p className="text-xs text-gray-400 mb-8">
                Midas Edge is included with your Midas Touch membership — no separate subscription needed.
              </p>
            </FadeIn>

            <FadeIn delay={1000}>
              <div className="flex items-center gap-8">
                {[
                  { value: '14.4K', label: 'Members' },
                  { value: '68%+', label: 'Avg Win Rate' },
                  { value: 'AI', label: 'Powered' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black text-amber-500">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right: dashboard mockup */}
          <FadeIn delay={600} className="w-full">
            <DashboardMockup />
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-gray-600 text-sm">The complete trading toolkit</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Everything in One Platform</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Journal, get AI coaching, track payouts — all built for the Midas Touch community</p>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Trade Journal', desc: 'Log every trade with emotional check-ins, notes, and commitment cards. Full session review every time.', color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-300' },
              { icon: Copy, title: 'Copy Trading', desc: 'Connect multiple prop firm accounts and mirror trades across all of them instantly. One trade, every account.', color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-300' },
              { icon: Brain, title: 'AI Trade Coach', desc: 'Your personal AI trading coach powered by Claude. Get feedback on every trade based on your strategy and emotions.', color: 'text-purple-500', bg: 'bg-purple-50', border: 'hover:border-purple-300' },
              { icon: BarChart3, title: 'Clean Analytics', desc: 'Win rate, profit factor, avg win/loss, drawdown — every metric that matters, beautifully presented.', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'hover:border-emerald-300' },
              { icon: Users, title: 'Community Posts', desc: 'Turn your winning trades into engaging Skool posts with one click. Built-in templates for the community.', color: 'text-pink-500', bg: 'bg-pink-50', border: 'hover:border-pink-300' },
              { icon: DollarSign, title: 'Payout Tracker', desc: 'Track your prop firm challenge progress and payouts. Know exactly where you stand at all times.', color: 'text-orange-500', bg: 'bg-orange-50', border: 'hover:border-orange-300' },
            ].map((feature) => (
              <div key={feature.title} className={`glass rounded-2xl p-6 ${feature.border} transition-all group cursor-default`}>
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform section */}
      <section id="strategy" className="py-28 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 mb-8">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700 text-sm font-medium">Built for Midas Touch Members</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                Your Edge.<br />
                <span className="text-amber-500">Tracked and Sharpened.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Midas Edge is not a generic trading journal. Every feature is designed around how the Midas Touch community trades — Crazy Horse ORB, prop firm challenges, and the push toward consistent funded payouts.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'ORB-specific trade tags and filters', icon: '🏷️' },
                  { label: 'Prop firm challenge progress tracking', icon: '🎯' },
                  { label: 'Instrument performance breakdown (NQ, ES, MNQ)', icon: '📊' },
                  { label: 'AI pattern recognition across your trades', icon: '🤖' },
                  { label: 'Emotional check-ins to protect discipline', icon: '🧠' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-gray-700">
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://www.skool.com/midas-touch-challenge-5991/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-amber-500/25 transition-all"
              >
                Join Midas Touch to Get Access
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
            {/* Mini stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Daily Streak', value: '14 days 🔥', color: 'text-amber-500' },
                { title: 'Best Day', value: '+$2,140', color: 'text-emerald-500' },
                { title: 'Prop Payouts', value: '$8,500', color: 'text-purple-500' },
                { title: 'Community Rank', value: '#47 / 14.4K', color: 'text-blue-500' },
              ].map((card) => (
                <div key={card.title} className="glass rounded-2xl p-5 hover:border-amber-200 transition-all shadow-sm">
                  <div className="text-xs text-gray-400 mb-1">{card.title}</div>
                  <div className={`text-xl font-black ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="community" className="py-28 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-gold rounded-3xl p-16 text-center overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🏆</div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Ready to <span className="text-amber-500">Touch Gold?</span>
              </h2>
              <p className="text-gray-600 text-lg mb-4 max-w-lg mx-auto">
                Midas Edge is included with your Midas Touch membership. Join the community and get instant access to the full platform.
              </p>
              <p className="text-amber-600/70 text-sm mb-10">Already a member? Sign in below.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.skool.com/midas-touch-challenge-5991/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-12 py-5 rounded-xl text-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all transform hover:scale-105"
                >
                  Join Midas Touch
                  <ArrowRight className="w-6 h-6" />
                </a>
                <Link href="/login" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-5 rounded-xl text-lg hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Midas Edge</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 The Midas Touch Trading Group. Built for the Midas Touch community.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
