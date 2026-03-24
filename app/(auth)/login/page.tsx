'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
    if (session) router.push('/dashboard')
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid credentials. Use password: midas2024')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-[#0f0f0f] to-orange-900/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse-gold">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-2xl text-white tracking-tight">Midas Journal</div>
              <div className="text-xs text-amber-400/70 tracking-widest uppercase">Midas Touch Trading Group</div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="space-y-4 mb-16">
            {[
              { icon: '📊', title: 'Full Analytics Suite', desc: 'Win rate, P&L, profit factor & more' },
              { icon: '🤖', title: 'AI Trading Assistant', desc: 'Get insights on your trades instantly' },
              { icon: '✍️', title: 'Skool Post Generator', desc: 'Turn wins into community content' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass rounded-xl p-4 flex items-center gap-4 hover:border-amber-500/30 transition-all"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{item.title}</div>
                  <div className="text-gray-400 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="glass-gold rounded-xl p-6">
            <p className="text-amber-200 text-sm italic leading-relaxed">
              &quot;The Crazy Horse ORB strategy has transformed how our community trades. Now journal it like a pro.&quot;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">M</div>
              <div>
                <div className="text-white text-sm font-medium">Mike Trades Daily</div>
                <div className="text-gray-400 text-xs">Founder, Midas Touch Trading Group</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-xl text-white">Midas Journal</span>
          </div>

          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 mb-8">Sign in to your trading journal</p>

            {/* Demo hint */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-amber-300 text-xs">Demo: use any email + password <strong>midas2024</strong></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                ← Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
