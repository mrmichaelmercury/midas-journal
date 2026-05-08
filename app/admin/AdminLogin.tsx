'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      window.location.reload()
      return
    }
    const data = await res.json().catch(() => ({}))
    setError(data.error ?? 'Incorrect password')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-[#111111] border border-white/5 rounded-2xl p-8 space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-black" />
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">Midas Edge Admin</div>
            <div className="text-sm text-gray-500">Enter admin password</div>
          </div>
        </div>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!password || submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-4 py-3 rounded-xl transition-all"
        >
          {submitting ? 'Verifying…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
