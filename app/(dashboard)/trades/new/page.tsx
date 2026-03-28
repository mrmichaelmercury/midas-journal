'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, CheckSquare, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const instruments = ['NQ', 'ES', 'MNQ', 'MES']

const emotions = [
  { value: 'confident', label: 'Confident', emoji: '💪' },
  { value: 'excited', label: 'Excited', emoji: '🔥' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', emoji: '😬' },
  { value: 'fearful', label: 'Fearful', emoji: '😨' },
]

function EmotionSelector({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
      <div className="flex gap-2">
        {emotions.map((e) => (
          <button
            key={e.value}
            type="button"
            onClick={() => onChange(e.value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all',
              value === e.value
                ? 'bg-amber-50 border-amber-300 scale-105'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            <span className="text-xl">{e.emoji}</span>
            <span className={cn('text-xs font-medium', value === e.value ? 'text-amber-600' : 'text-gray-500')}>
              {e.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NewTradePage() {
  const router = useRouter()
  const [saving, setIsSaving] = useState(false)
  const [committed, setCommitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [aiFeedback, setAiFeedback] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startingBalance: '',
    instrument: 'NQ',
    outcome: '' as 'WIN' | 'LOSS' | '',
    dollarAmount: '',
    notes: '',
    emotionBefore: 'neutral',
    emotionDuring: 'neutral',
    emotionAfter: 'neutral',
  })

  const endingBalance =
    form.startingBalance && form.dollarAmount && form.outcome
      ? parseFloat(form.startingBalance) +
        (form.outcome === 'WIN' ? parseFloat(form.dollarAmount) : -parseFloat(form.dollarAmount))
      : null

  const isWin = form.outcome === 'WIN'
  const isLoss = form.outcome === 'LOSS'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setScreenshots((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleGetFeedback = async () => {
    if (!form.outcome || !form.dollarAmount) {
      toast.error('Fill in the result and dollar amount first')
      return
    }
    setLoadingFeedback(true)
    setAiFeedback('')
    try {
      const res = await fetch('/api/ai/trade-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument: form.instrument,
          outcome: form.outcome,
          dollarAmount: parseFloat(form.dollarAmount),
          startingBalance: form.startingBalance ? parseFloat(form.startingBalance) : undefined,
          endingBalance: endingBalance ?? undefined,
          emotionBefore: form.emotionBefore,
          emotionDuring: form.emotionDuring,
          emotionAfter: form.emotionAfter,
          notes: form.notes,
          committed,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get feedback')
      setAiFeedback(data.feedback)
    } catch (err: any) {
      toast.error(err.message || 'Failed to get AI feedback')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.outcome) {
      toast.error('Please select WIN or LOSS')
      return
    }
    if (!form.dollarAmount) {
      toast.error('Please enter the dollar amount')
      return
    }
    setIsSaving(true)
    try {
      const pnl = form.outcome === 'WIN' ? parseFloat(form.dollarAmount) : -parseFloat(form.dollarAmount)
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument: form.instrument,
          direction: 'LONG',
          entryPrice: 0,
          exitPrice: 0,
          quantity: 1,
          pnl,
          date: form.date,
          notes: form.notes,
          outcome: form.outcome,
          dollarAmount: parseFloat(form.dollarAmount),
          startingBalance: form.startingBalance ? parseFloat(form.startingBalance) : undefined,
          endingBalance: endingBalance ?? undefined,
          emotionBefore: form.emotionBefore,
          emotionDuring: form.emotionDuring,
          emotionAfter: form.emotionAfter,
          committed,
          screenshots,
        }),
      })
      toast.success('Trade logged!')
      router.push('/trades')
    } catch {
      toast.error('Failed to save trade')
      setIsSaving(false)
    }
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all text-sm'

  const sectionClass = 'glass rounded-2xl p-6 space-y-5'

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/trades" className="p-2 rounded-xl glass hover:border-gray-300 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Log Trade</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Track your session and emotions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Step 1 — Date & Balance */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-bold">1</span>
            <h2 className="font-bold text-gray-900">Session Info</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Balance</label>
              <input
                type="number"
                step="0.01"
                value={form.startingBalance}
                onChange={(e) => setForm({ ...form, startingBalance: e.target.value })}
                placeholder="50,000.00"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrument</label>
            <select
              value={form.instrument}
              onChange={(e) => setForm({ ...form, instrument: e.target.value })}
              className={inputClass}
            >
              {instruments.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2 — Win or Loss */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-bold">2</span>
            <h2 className="font-bold text-gray-900">Result</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setForm({ ...form, outcome: 'WIN' }); setCommitted(false) }}
              className={cn(
                'py-5 rounded-2xl font-black text-xl border-2 transition-all',
                isWin
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-600 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500'
              )}
            >
              ✅ WIN
            </button>
            <button
              type="button"
              onClick={() => { setForm({ ...form, outcome: 'LOSS' }); setCommitted(false) }}
              className={cn(
                'py-5 rounded-2xl font-black text-xl border-2 transition-all',
                isLoss
                  ? 'bg-red-50 border-red-400 text-red-600 shadow-lg shadow-red-500/10 scale-[1.02]'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
              )}
            >
              ❌ LOSS
            </button>
          </div>

          {form.outcome && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isWin ? 'Amount Won' : 'Amount Lost'} ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.dollarAmount}
                  onChange={(e) => setForm({ ...form, dollarAmount: e.target.value })}
                  placeholder="500.00"
                  className={cn(
                    inputClass,
                    isWin && form.dollarAmount ? 'border-emerald-300 text-emerald-700' : '',
                    isLoss && form.dollarAmount ? 'border-red-300 text-red-700' : ''
                  )}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ending Balance</label>
                <div className={cn(
                  'w-full rounded-xl px-4 py-3 text-sm font-bold border',
                  endingBalance !== null
                    ? isWin
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                )}>
                  {endingBalance !== null
                    ? `$${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'Auto-calculated'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3 — Emotions */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-bold">3</span>
            <h2 className="font-bold text-gray-900">Emotion Check-In</h2>
          </div>
          <EmotionSelector
            label="How were you feeling BEFORE the trade?"
            value={form.emotionBefore}
            onChange={(v) => setForm({ ...form, emotionBefore: v })}
          />
          <EmotionSelector
            label="How were you feeling DURING the trade?"
            value={form.emotionDuring}
            onChange={(v) => setForm({ ...form, emotionDuring: v })}
          />
          <EmotionSelector
            label="How are you feeling AFTER the trade?"
            value={form.emotionAfter}
            onChange={(v) => setForm({ ...form, emotionAfter: v })}
          />
        </div>

        {/* Commitment Card */}
        {form.outcome && (
          <div
            className={cn(
              'rounded-2xl p-5 border-2 transition-all cursor-pointer select-none',
              committed
                ? 'bg-amber-50 border-amber-400 shadow-lg shadow-amber-500/10'
                : 'bg-white border-amber-200 hover:border-amber-300'
            )}
            onClick={() => setCommitted(!committed)}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                committed ? 'bg-amber-500 border-amber-500' : 'border-amber-300'
              )}>
                {committed && <CheckSquare className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">
                  {isWin ? 'Protect Your Green Day' : 'Protect Yourself From Going Deeper'}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {isWin
                    ? 'I will NOT revenge trade or overtrade. I am protecting my green day and walking away a winner.'
                    : 'I will NOT turn a losing day into a worse day. I am waiting for a clean setup and protecting my account.'}
                </p>
              </div>
            </div>
            {!committed && (
              <p className="text-xs text-amber-500 mt-3 ml-10">Click to commit to this promise →</p>
            )}
            {committed && (
              <p className="text-xs text-amber-600 mt-3 ml-10 font-semibold">Committed ✓</p>
            )}
          </div>
        )}

        {/* Step 4 — Notes */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-bold">4</span>
            <h2 className="font-bold text-gray-900">Reflection</h2>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="What did you learn today? What would you do differently? What went well?"
            rows={6}
            className={cn(inputClass, 'resize-none text-base leading-relaxed')}
          />
          <p className="text-xs text-gray-400">The most important part of your journal — be honest with yourself.</p>
        </div>

        {/* AI Feedback */}
        {form.outcome && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bold text-gray-900 text-sm">AI Trade Coach</h2>
              </div>
              <button
                type="button"
                onClick={handleGetFeedback}
                disabled={loadingFeedback}
                className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-xl hover:shadow-md hover:shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {loadingFeedback ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {loadingFeedback ? 'Analyzing...' : 'Get AI Feedback'}
              </button>
            </div>

            {!aiFeedback && !loadingFeedback && (
              <p className="text-gray-400 text-sm">
                Get personalized feedback on this trade from your Midas Edge AI coach.
              </p>
            )}

            {loadingFeedback && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">Analyzing your trade...</span>
              </div>
            )}

            {aiFeedback && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {aiFeedback}
              </div>
            )}
          </div>
        )}

        {/* Screenshot upload */}
        <div className="glass rounded-2xl p-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Add screenshot (optional)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {screenshots.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {screenshots.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="screenshot" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshots((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Log Trade'}
          </button>
          <Link href="/trades" className="text-gray-400 hover:text-gray-600 px-4 py-3.5 transition-colors text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
