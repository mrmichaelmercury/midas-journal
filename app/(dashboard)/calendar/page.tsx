'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const mockDayData: Record<string, { pnl: number; trades: number }> = {
  '2024-01-01': { pnl: 840, trades: 2 },
  '2024-01-02': { pnl: -320, trades: 1 },
  '2024-01-03': { pnl: 1240, trades: 3 },
  '2024-01-04': { pnl: 560, trades: 2 },
  '2024-01-07': { pnl: -180, trades: 1 },
  '2024-01-08': { pnl: 920, trades: 2 },
  '2024-01-09': { pnl: 430, trades: 1 },
  '2024-01-10': { pnl: -450, trades: 2 },
  '2024-01-11': { pnl: 1100, trades: 3 },
  '2024-01-14': { pnl: 660, trades: 2 },
  '2024-01-15': { pnl: -230, trades: 1 },
  '2024-01-16': { pnl: 780, trades: 2 },
  '2024-01-17': { pnl: 1350, trades: 3 },
  '2024-01-18': { pnl: -120, trades: 1 },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalPnl = Object.values(mockDayData).reduce((s, d) => s + d.pnl, 0)
  const greenDays = Object.values(mockDayData).filter((d) => d.pnl > 0).length
  const redDays = Object.values(mockDayData).filter((d) => d.pnl < 0).length

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { day: d, key, data: mockDayData[key] }
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Trading Calendar</h1>
          <p className="text-gray-500 mt-1">Your daily P&L at a glance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500/60" />
              Green day
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/60" />
              Red day
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Monthly P&L', value: formatCurrency(totalPnl), color: 'text-emerald-400' },
          { label: 'Green Days', value: greenDays, color: 'text-emerald-400' },
          { label: 'Red Days', value: redDays, color: 'text-red-400' },
          { label: 'Win Rate', value: `${((greenDays / (greenDays + redDays)) * 100).toFixed(0)}%`, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="glass rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-white">{monthName}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(({ day, key, data }) => {
            const isToday = key === new Date().toISOString().split('T')[0]
            return (
              <div
                key={key}
                className={cn(
                  'aspect-square rounded-xl p-1 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105',
                  data
                    ? data.pnl > 0
                      ? 'bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-red-500/20 border border-red-500/30 hover:border-red-500/60'
                    : 'bg-white/3 border border-transparent hover:border-white/10',
                  isToday && 'ring-2 ring-amber-500'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold',
                  data ? (data.pnl > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-600'
                )}>
                  {day}
                </span>
                {data && (
                  <span className={cn(
                    'text-xs font-bold mt-0.5',
                    data.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {data.pnl > 0 ? '+' : ''}{data.pnl > 999 ? `${(data.pnl/1000).toFixed(1)}k` : data.pnl}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
