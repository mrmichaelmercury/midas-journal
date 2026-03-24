'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, BarChart3, Brain, Shield, Zap, Users, ChevronRight, Star, ArrowRight } from 'lucide-react'

// Candlestick chart component
function AnimatedChart() {
  const [phase, setPhase] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [pnlCount, setPnlCount] = useState(0)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pnlRef = useRef<NodeJS.Timeout | null>(null)

  const candles = [
    { o: 60, h: 70, l: 55, c: 65, green: true },
    { o: 65, h: 72, l: 62, c: 68, green: true },
    { o: 68, h: 75, l: 64, c: 66, green: false },
    { o: 66, h: 69, l: 58, c: 61, green: false },
    { o: 61, h: 65, l: 57, c: 64, green: true },
    { o: 64, h: 74, l: 62, c: 72, green: true },
    { o: 72, h: 80, l: 70, c: 78, green: true },
    { o: 78, h: 85, l: 76, c: 82, green: true },
    { o: 82, h: 88, l: 79, c: 85, green: true },
    { o: 85, h: 92, l: 83, c: 90, green: true },
  ]

  const equityPoints = [20, 28, 24, 22, 26, 35, 45, 55, 62, 70, 75]

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!started) return
    intervalRef.current = setInterval(() => {
      setPhase((p) => Math.min(p + 1, candles.length))
    }, 300)
    return () => clearInterval(intervalRef.current!)
  }, [started])

  useEffect(() => {
    if (phase === candles.length && started) {
      let val = 0
      const target = 4_230
      pnlRef.current = setInterval(() => {
        val = Math.min(val + 127, target)
        setPnlCount(val)
        if (val >= target) clearInterval(pnlRef.current!)
      }, 30)
    }
    return () => clearInterval(pnlRef.current!)
  }, [phase, started])

  const scale = (v: number) => ((100 - v) / 100) * 140 + 10

  const equityPath = equityPoints
    .slice(0, Math.max(1, Math.floor((phase / candles.length) * equityPoints.length)))
    .map((y, i) => {
      const x = (i / (equityPoints.length - 1)) * 340 + 10
      return `${i === 0 ? 'M' : 'L'} ${x} ${scale(y)}`
    })
    .join(' ')

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Chart card */}
      <div className={`relative glass rounded-3xl p-6 border transition-all duration-500 ${hovered ? 'border-amber-500/40 shadow-2xl shadow-amber-500/20' : 'border-white/10'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">NQ Futures · Crazy Horse ORB</div>
            <div className={`text-3xl font-black transition-all duration-300 ${phase === candles.length ? 'text-emerald-400' : 'text-gray-300'}`}>
              {phase === candles.length ? `+$${pnlCount.toLocaleString()}` : 'Loading...'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
        </div>

        {/* SVG Chart */}
        <svg width="100%" viewBox="0 0 360 160" className="overflow-visible">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              y1={160 * f}
              x2="360"
              y2={160 * f}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Equity curve */}
          {phase > 0 && (
            <>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${equityPath} L ${((Math.min(phase, equityPoints.length) - 1) / (equityPoints.length - 1)) * 340 + 10} 160 L 10 160 Z`}
                fill="url(#equityGrad)"
              />
              <path
                d={equityPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }}
              />
            </>
          )}

          {/* Candlesticks */}
          {candles.slice(0, phase).map((c, i) => {
            const x = i * 34 + 22
            const bodyTop = scale(Math.max(c.o, c.c))
            const bodyBot = scale(Math.min(c.o, c.c))
            const bodyH = Math.max(bodyBot - bodyTop, 2)
            const color = c.green ? '#10b981' : '#ef4444'
            return (
              <g key={i} style={{ opacity: 0, animation: `fadeIn 0.3s ease forwards ${i * 0.05}s` }}>
                {/* Wick */}
                <line x1={x} y1={scale(c.h)} x2={x} y2={scale(c.l)} stroke={color} strokeWidth="1.5" opacity="0.7" />
                {/* Body */}
                <rect
                  x={x - 6}
                  y={bodyTop}
                  width={12}
                  height={bodyH}
                  fill={color}
                  opacity={0.85}
                  rx="1"
                  style={{ filter: c.green && i >= 5 ? `drop-shadow(0 0 4px ${color}80)` : 'none' }}
                />
              </g>
            )
          })}
        </svg>

        {/* Bottom stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          {[
            { label: 'Win Rate', value: '71%', color: 'text-amber-400' },
            { label: 'Trades', value: '47', color: 'text-white' },
            { label: 'Profit Factor', value: '2.1x', color: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hover CTA */}
        <div
          className={`absolute inset-0 rounded-3xl flex items-center justify-center transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.1) 0%, transparent 70%)' }}
        />
      </div>

      {/* Floating badges */}
      <div className="absolute -right-4 top-8 animate-float">
        <div className="glass rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20">
          +$1,240 ✓
        </div>
      </div>
      <div className="absolute -left-4 bottom-12" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>
        <div className="glass rounded-xl px-3 py-2 text-xs font-bold text-amber-400 border border-amber-500/20">
          68.4% WR 🏆
        </div>
      </div>
    </div>
  )
}

// Fade-in with delay
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  return (
    <div className="min-h-screen bg-[#0f0f0f] overflow-x-hidden">
      {/* Nav */}
      <FadeIn delay={100}>
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0f0f0f]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">Midas</span>
              <span className="font-bold text-amber-400 text-lg tracking-tight"> Journal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#strategy" className="hover:text-amber-400 transition-colors">Strategy</a>
            <a href="#community" className="hover:text-amber-400 transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/login" className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all">
              Get Access
            </Link>
          </div>
        </nav>
      </FadeIn>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl" style={{ background: 'rgba(245,158,11,0.04)' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <FadeIn delay={200}>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-sm font-medium">The Midas Touch Trading Group · 14.4K Members</span>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
                <span className="text-white block">Journal Your</span>
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent block">
                  Path to Profits
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={600}>
              <p className="text-lg text-gray-400 max-w-lg mb-10 leading-relaxed">
                The premium trading journal built exclusively for the Midas Touch community.
                Track every Crazy Horse ORB trade, analyze your edge, and level up with AI-powered insights.
              </p>
            </FadeIn>

            <FadeIn delay={800}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link href="/login" className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-8 py-4 rounded-xl text-lg hover:shadow-xl hover:shadow-amber-500/40 transition-all transform hover:scale-105">
                  Start Journaling Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-all">
                  Sign In
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={1000}>
              <div className="flex items-center gap-8">
                {[
                  { value: '14.4K', label: 'Members' },
                  { value: '68%+', label: 'Avg Win Rate' },
                  { value: 'AI', label: 'Powered' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black text-amber-400">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right: interactive chart */}
          <FadeIn delay={600} className="w-full">
            <AnimatedChart />
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-gray-400 text-sm">Everything you need to trade better</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Built for Serious Traders</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">Every feature designed around the Crazy Horse ORB strategy</p>
            </FadeIn>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Win rate, profit factor, avg win/loss, drawdown — every metric that matters.', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'hover:border-amber-500/30' },
              { icon: Brain, title: 'AI Post Generator', desc: 'Turn your winning trades into engaging Skool community posts with one click.', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'hover:border-purple-500/30' },
              { icon: Zap, title: 'AI Trading Assistant', desc: 'Chat with your personal AI coach about strategy, setups, and market conditions.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'hover:border-blue-500/30' },
              { icon: TrendingUp, title: 'P&L Calendar', desc: 'Visualize your green and red days. Spot consistency patterns at a glance.', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'hover:border-emerald-500/30' },
              { icon: Shield, title: 'Trade Journal', desc: 'Log trades with screenshots, notes, emotions, and lessons after each session.', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'hover:border-orange-500/30' },
              { icon: Users, title: 'Community Ready', desc: 'Built for the 14.4K member Midas Touch community. Share ideas, not just charts.', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'hover:border-pink-500/30' },
            ].map((feature) => (
              <div key={feature.title} className={`glass rounded-2xl p-6 ${feature.border} transition-all group cursor-default`}>
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy section */}
      <section id="strategy" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Crazy Horse ORB Strategy</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                Built Around the<br />
                <span className="text-amber-400">ORB Setup</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Every field, filter, and metric in Midas Journal is optimized for Opening Range Breakout trading as taught by Mike Trades Daily. No bloat — just what you need to master the setup.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'ORB-specific trade tags', icon: '🏷️' },
                  { label: 'Entry quality scoring', icon: '⭐' },
                  { label: 'Instrument performance breakdown', icon: '📊' },
                  { label: 'AI pattern recognition across trades', icon: '🤖' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-gray-300">
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all">
                Start Tracking Your Edge
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            {/* Mini stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Daily Streak', value: '14 days 🔥', color: 'text-amber-400' },
                { title: 'Best Day', value: '+$2,140', color: 'text-emerald-400' },
                { title: 'Prop Payouts', value: '$8,500', color: 'text-purple-400' },
                { title: 'Community Rank', value: '#47 / 14.4K', color: 'text-blue-400' },
              ].map((card) => (
                <div key={card.title} className="glass rounded-2xl p-5 hover:border-amber-500/20 transition-all">
                  <div className="text-xs text-gray-500 mb-1">{card.title}</div>
                  <div className={`text-xl font-black ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="community" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-gold rounded-3xl p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🏆</div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to <span className="text-amber-400">Touch Gold?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                Join the Midas Touch community&apos;s premium trading journal. Free to start. Built to win.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-12 py-5 rounded-xl text-xl hover:shadow-2xl hover:shadow-amber-500/40 transition-all transform hover:scale-105">
                Get Access Now
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white">Midas Journal</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 The Midas Touch Trading Group. Built for Mike Trades Daily community.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
