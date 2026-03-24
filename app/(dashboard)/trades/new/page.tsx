'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const instruments = ['NQ', 'MNQ', 'ES', 'MES', 'YM', 'MYM', 'RTY', 'M2K', 'CL', 'GC', 'NQ_FUTURES']
const strategies = ['Crazy Horse ORB', 'ORB Long', 'ORB Short', 'Continuation', 'Reversal', 'Custom']

export default function NewTradePage() {
  const router = useRouter()
  const [saving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    instrument: 'NQ',
    direction: 'LONG',
    entryPrice: '',
    exitPrice: '',
    quantity: '1',
    date: new Date().toISOString().split('T')[0],
    strategy: 'Crazy Horse ORB',
    notes: '',
    tags: '',
    mood: 'GOOD',
  })

  const pnl = form.entryPrice && form.exitPrice && form.quantity
    ? (() => {
        const entry = parseFloat(form.entryPrice)
        const exit = parseFloat(form.exitPrice)
        const qty = parseFloat(form.quantity)
        const diff = form.direction === 'LONG' ? exit - entry : entry - exit
        return diff * qty
      })()
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800)) // Simulate save
    toast.success('Trade logged successfully!')
    router.push('/trades')
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      {children}
    </div>
  )

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/40 focus:bg-amber-500/5 transition-all text-sm"

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/trades" className="p-2 rounded-xl glass hover:border-white/10 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Log New Trade</h1>
          <p className="text-gray-500 mt-0.5">Record your Crazy Horse ORB setup</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core trade info */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
            Trade Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instrument">
              <select value={form.instrument} onChange={(e) => setForm({...form, instrument: e.target.value})} className={inputClass}>
                {instruments.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Direction">
              <div className="flex gap-2">
                {['LONG', 'SHORT'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({...form, direction: d})}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-sm font-bold transition-all border',
                      form.direction === d
                        ? d === 'LONG'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                    )}
                  >
                    {d === 'LONG' ? '↑ LONG' : '↓ SHORT'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Entry Price">
              <input type="number" step="0.01" value={form.entryPrice} onChange={(e) => setForm({...form, entryPrice: e.target.value})} placeholder="17850.00" className={inputClass} required />
            </Field>
            <Field label="Exit Price">
              <input type="number" step="0.01" value={form.exitPrice} onChange={(e) => setForm({...form, exitPrice: e.target.value})} placeholder="17920.00" className={inputClass} required />
            </Field>
            <Field label="Quantity / Contracts">
              <input type="number" step="0.01" min="0.01" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className={inputClass} required />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} required />
            </Field>
          </div>

          {/* P&L Preview */}
          {pnl !== null && (
            <div className={cn(
              'mt-4 p-4 rounded-xl border flex items-center justify-between',
              pnl >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
            )}>
              <span className="text-sm text-gray-400">Calculated P&L</span>
              <span className={cn('text-xl font-black', pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} pts
              </span>
            </div>
          )}
        </div>

        {/* Strategy & Notes */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
            Strategy & Notes
          </h2>
          <div className="space-y-4">
            <Field label="Strategy">
              <select value={form.strategy} onChange={(e) => setForm({...form, strategy: e.target.value})} className={inputClass}>
                {strategies.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Trade Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                placeholder="What happened? What did you do well? What would you improve?"
                rows={4}
                className={cn(inputClass, 'resize-none')}
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input type="text" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="ORB, clean-setup, partial-fill" className={inputClass} />
            </Field>
            <Field label="Mood">
              <div className="flex gap-2">
                {[
                  { v: 'GREAT', e: '🚀' }, { v: 'GOOD', e: '😊' }, { v: 'NEUTRAL', e: '😐' },
                  { v: 'BAD', e: '😞' }, { v: 'TERRIBLE', e: '🤬' }
                ].map(({ v, e }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({...form, mood: v})}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-lg transition-all border',
                      form.mood === v ? 'bg-amber-500/20 border-amber-500/40 scale-110' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    )}
                    title={v}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Log Trade'}
          </button>
          <button type="button" className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-5 py-3.5 rounded-xl hover:bg-purple-500/20 transition-all font-medium">
            <Sparkles className="w-4 h-4" />
            Generate Post After Save
          </button>
          <Link href="/trades" className="text-gray-500 hover:text-gray-300 px-4 py-3.5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
