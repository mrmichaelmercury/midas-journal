'use client'

import { cn, formatCurrency } from '@/lib/utils'

const metrics = [
  { label: 'Total P&L', value: '+$8,430', sub: 'All time', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Win Rate', value: '68.4%', sub: '32 of 47 trades', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Profit Factor', value: '2.14', sub: 'Gross profit / loss', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Avg Win', value: '$843', sub: 'Per winning trade', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Avg Loss', value: '$312', sub: 'Per losing trade', color: 'text-red-400', bg: 'bg-red-400/10' },
  { label: 'Largest Win', value: '$2,140', sub: 'NQ LONG Jan 12', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Max Drawdown', value: '$890', sub: 'Consecutive losses', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { label: 'Avg RR', value: '2.7:1', sub: 'Risk-to-reward ratio', color: 'text-teal-400', bg: 'bg-teal-400/10' },
]

const instrumentData = [
  { name: 'NQ', trades: 21, pnl: 5430, winRate: 71 },
  { name: 'ES', trades: 14, pnl: 1840, winRate: 64 },
  { name: 'MNQ', trades: 8, pnl: 780, winRate: 63 },
  { name: 'MES', trades: 4, pnl: 380, winRate: 75 },
]

const maxPnl = Math.max(...instrumentData.map((d) => d.pnl))

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into your trading performance</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="glass rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{m.label}</div>
            <div className={cn('text-2xl font-black', m.color)}>{m.value}</div>
            <div className="text-xs text-gray-600 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Win/Loss distribution */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">Win/Loss Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Wins (32)</span>
                <span className="text-emerald-400 font-bold">68.4%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '68.4%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Losses (15)</span>
                <span className="text-red-400 font-bold">31.6%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: '31.6%' }} />
              </div>
            </div>
          </div>

          {/* Simulated P&L bar chart */}
          <h3 className="font-semibold text-gray-300 mt-8 mb-4 text-sm">Daily P&L (Last 30 Days)</h3>
          <div className="h-32 flex items-center gap-0.5">
            {[120, -80, 200, 150, -50, 300, 180, -120, 250, 90, -40, 180, 320, -90, 200, 140, 280, -60, 190, 240, -110, 300, 180, -70, 220, 160, 290, -80, 340, 200].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col justify-center h-full">
                {v > 0 ? (
                  <div className="flex flex-col justify-end" style={{ height: '50%' }}>
                    <div
                      className="bg-emerald-500/60 hover:bg-emerald-500 transition-colors rounded-t-sm"
                      style={{ height: `${(v / 340) * 100}%` }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-start" style={{ height: '50%' }}>
                    <div
                      className="bg-red-500/60 hover:bg-red-500 transition-colors rounded-b-sm"
                      style={{ height: `${(Math.abs(v) / 120) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* By instrument */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">Performance by Instrument</h2>
          <div className="space-y-5">
            {instrumentData.map((inst) => (
              <div key={inst.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white w-10">{inst.name}</span>
                    <span className="text-xs text-gray-500">{inst.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-amber-400">{inst.winRate}% WR</span>
                    <span className="text-sm font-bold text-emerald-400">+{formatCurrency(inst.pnl)}</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                    style={{ width: `${(inst.pnl / maxPnl) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strategy breakdown */}
          <h3 className="font-semibold text-gray-300 mt-8 mb-4 text-sm">Strategy Breakdown</h3>
          <div className="space-y-3">
            {[
              { name: 'Crazy Horse ORB', count: 38, pnl: 7200 },
              { name: 'Continuation', count: 6, pnl: 840 },
              { name: 'Reversal', count: 3, pnl: 390 },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="text-sm text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.count} trades</div>
                </div>
                <div className="text-sm font-bold text-emerald-400">+{formatCurrency(s.pnl)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
