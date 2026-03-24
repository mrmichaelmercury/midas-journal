'use client'

import { useState } from 'react'
import { Plus, Wallet, X } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Payout {
  id: string
  firm: string
  amount: number
  date: string
  notes: string
  proof?: string
}

const initialPayouts: Payout[] = [
  { id: '1', firm: 'Apex Trader Funding', amount: 1240, date: '2024-01-15', notes: 'First payout! NQ wins this week 🔥' },
  { id: '2', firm: 'FTMO', amount: 3200, date: '2024-01-08', notes: 'Smashed the ORB all week' },
  { id: '3', firm: 'Tradeify', amount: 800, date: '2023-12-28', notes: 'Last payout of the year' },
  { id: '4', firm: 'Apex Trader Funding', amount: 2100, date: '2023-12-10', notes: 'December run 🚀' },
  { id: '5', firm: 'FTMO', amount: 1500, date: '2023-11-22', notes: 'Consistent execution' },
]

const firms = ['FTMO', 'Apex Trader Funding', 'Tradeify', 'Topstep', 'My Funded Futures', 'E8 Funding', 'Other']

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firm: 'Apex Trader Funding', amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)

  const total = payouts.reduce((s, p) => s + p.amount, 0)
  const thisMonth = payouts
    .filter((p) => {
      const d = new Date(p.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, p) => s + p.amount, 0)
  const largest = Math.max(...payouts.map((p) => p.amount))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    const newPayout: Payout = {
      id: Date.now().toString(),
      firm: form.firm,
      amount: parseFloat(form.amount),
      date: form.date,
      notes: form.notes,
    }
    setPayouts([newPayout, ...payouts])
    setForm({ firm: 'Apex Trader Funding', amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowForm(false)
    setSaving(false)
    toast.success('Payout logged! 🎉')
  }

  const firmColors: Record<string, string> = {
    'FTMO': 'from-blue-500 to-blue-600',
    'Apex Trader Funding': 'from-orange-500 to-orange-600',
    'Tradeify': 'from-purple-500 to-purple-600',
    'Topstep': 'from-teal-500 to-teal-600',
    'My Funded Futures': 'from-emerald-500 to-emerald-600',
    'E8 Funding': 'from-indigo-500 to-indigo-600',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Payout Tracker</h1>
          <p className="text-gray-500 mt-1">Log and celebrate your prop firm payouts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Payout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Payouts', value: formatCurrency(total), icon: '💰', color: 'text-emerald-400' },
          { label: 'This Month', value: formatCurrency(thisMonth), icon: '📅', color: 'text-amber-400' },
          { label: 'Largest Single', value: formatCurrency(largest), icon: '🏆', color: 'text-purple-400' },
          { label: 'Total Count', value: `${payouts.length} payouts`, icon: '✅', color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Total banner */}
      <div className="glass-gold rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-sm text-amber-400 font-medium mb-1">🏆 Lifetime Earnings from Prop Firms</div>
            <div className="text-5xl font-black text-white">{formatCurrency(total)}</div>
            <div className="text-gray-400 text-sm mt-2">Keep going. The Midas Touch is real. 🔥</div>
          </div>
          <div className="hidden md:block">
            <Wallet className="w-20 h-20 text-amber-400/20" />
          </div>
        </div>
      </div>

      {/* Payout list */}
      <div className="space-y-3">
        {payouts.map((payout, i) => (
          <div key={payout.id} className="glass rounded-2xl p-5 flex items-center gap-5 hover:border-white/10 transition-all">
            {/* Firm badge */}
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg flex-shrink-0',
              firmColors[payout.firm] || 'from-gray-500 to-gray-600'
            )}>
              {payout.firm[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white">{payout.firm}</div>
              <div className="text-sm text-gray-500">{formatDate(payout.date)}</div>
              {payout.notes && <div className="text-xs text-gray-500 mt-1 truncate">{payout.notes}</div>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black text-emerald-400">+{formatCurrency(payout.amount)}</div>
              {i === 0 && <div className="text-xs text-amber-400 mt-0.5">Latest 🎉</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Payout Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-7 w-full max-w-md border border-amber-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-white text-xl">Log New Payout</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prop Firm</label>
                <select value={form.firm} onChange={(e) => setForm({...form, firm: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/40">
                  {firms.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Payout Amount ($)</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})}
                  placeholder="1,000.00" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Celebrate! What went well this week?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/40 resize-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Logging...' : 'Log Payout 🎉'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
