'use client'

import { cn } from '@/lib/utils'

const stats = [
  { label: 'Total P&L', value: '+$8,430', accent: true, color: 'text-emerald-400' },
  { label: 'Win Rate', value: '68%', color: 'text-amber-400' },
  { label: 'Avg Win', value: '$843', color: 'text-emerald-400' },
  { label: 'Avg Loss', value: '$312', color: 'text-red-400' },
  { label: 'Profit Factor', value: '2.14', color: 'text-white' },
  { label: 'Best Day', value: '+$2,140', color: 'text-emerald-400' },
  { label: 'Worst Day', value: '-$890', color: 'text-red-400' },
]

const dailyPnl = [120, -80, 200, 150, -50, 300, 180, -120, 250, 90, -40, 180, 320, -90, 200, 140, 280, -60, 190, 240, -110, 300, 180, -70, 220, 160, 290, -80, 340, 200]
const maxVal = Math.max(...dailyPnl.map(Math.abs))

const instruments = [
  { name: 'NQ', trades: 21, pnl: 5430, winRate: 71 },
  { name: 'ES', trades: 14, pnl: 1840, winRate: 64 },
  { name: 'MNQ', trades: 8, pnl: 780, winRate: 63 },
  { name: 'MES', trades: 4, pnl: 380, winRate: 75 },
]
const maxPnl = Math.max(...instruments.map((d) => d.pnl))

export default function AnalyticsPage() {
  const wins = 32
  const losses = 15
  const total = wins + losses

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">Your performance at a glance</p>
      </div>

      {/* Key metrics — bigger, cleaner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              'glass rounded-2xl p-5',
              s.accent && 'border-amber-500/20'
            )}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{s.label}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Win/Loss */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">Win / Loss</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 text-center py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
              <div className="text-3xl font-black text-emerald-400">{wins}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Wins</div>
            </div>
            <div className="flex-1 text-center py-4 rounded-xl bg-red-500/10 border border-red-500/15">
              <div className="text-3xl font-black text-red-400">{losses}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Losses</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                style={{ width: `${(wins / total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="text-emerald-400 font-medium">{Math.round((wins / total) * 100)}% win rate</span>
              <span>{total} total trades</span>
            </div>
          </div>

          {/* Daily P&L bar chart */}
          <div className="mt-7">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Daily P&L — Last 30 Days</h3>
            <div className="h-28 flex items-center gap-px">
              {dailyPnl.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col justify-center h-full">
                  {v > 0 ? (
                    <div className="flex flex-col justify-end" style={{ height: '50%' }}>
                      <div
                        className="bg-emerald-500/60 hover:bg-emerald-400 transition-colors rounded-t-sm"
                        style={{ height: `${(v / maxVal) * 100}%` }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col justify-start" style={{ height: '50%' }}>
                      <div
                        className="bg-red-500/60 hover:bg-red-400 transition-colors rounded-b-sm"
                        style={{ height: `${(Math.abs(v) / maxVal) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By instrument */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">By Instrument</h2>
          <div className="space-y-5">
            {instruments.map((inst) => (
              <div key={inst.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white w-10">{inst.name}</span>
                    <span className="text-xs text-gray-600">{inst.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-amber-400 font-medium">{inst.winRate}%</span>
                    <span className="text-sm font-bold text-emerald-400">+${inst.pnl.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    style={{ width: `${(inst.pnl / maxPnl) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
