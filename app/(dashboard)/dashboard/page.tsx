'use client'

import { useSession } from 'next-auth/react'
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Plus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency, getPnlColor } from '@/lib/utils'

const mockTrades = [
  { id: 1, instrument: 'NQ', direction: 'LONG', pnl: 1240, date: '2024-01-15', strategy: 'Crazy Horse ORB' },
  { id: 2, instrument: 'ES', direction: 'SHORT', pnl: -320, date: '2024-01-16', strategy: 'Crazy Horse ORB' },
  { id: 3, instrument: 'NQ', direction: 'LONG', pnl: 860, date: '2024-01-17', strategy: 'Crazy Horse ORB' },
  { id: 4, instrument: 'MNQ', direction: 'SHORT', pnl: 430, date: '2024-01-18', strategy: 'Crazy Horse ORB' },
  { id: 5, instrument: 'ES', direction: 'LONG', pnl: -180, date: '2024-01-19', strategy: 'Crazy Horse ORB' },
]

const stats = [
  { label: 'Total P&L', value: '+$4,230', change: '+12.4%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Win Rate', value: '68.4%', change: '+3.2%', up: true, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Total Trades', value: '47', change: '+8 this week', up: true, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Avg Win', value: '$843', change: 'vs $312 loss', up: true, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const name = session?.user?.name?.split(' ')[0] || 'Trader'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Good morning, <span className="text-amber-500">{name}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your trading performance overview</p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Trade
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className={cn('text-xs', stat.up ? 'text-emerald-600' : 'text-red-500')}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* P&L chart + Recent trades */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* P&L Chart */}
        <div className="lg:col-span-3 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">P&L Curve</h2>
            <div className="flex gap-2">
              {['1W', '1M', '3M', 'YTD'].map((p) => (
                <button key={p} className={cn(
                  'text-xs px-2.5 py-1 rounded-lg transition-all',
                  p === '1M' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-400 hover:text-gray-700'
                )}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-40 flex items-end gap-1">
            {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100, 92, 110, 105, 120, 115, 130].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-sm bg-gradient-to-t from-amber-500 to-amber-300 transition-all hover:from-amber-600 hover:to-amber-400"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-gray-400">Jan 1</span>
            <span className="text-xs text-gray-400">Jan 18</span>
          </div>
        </div>

        {/* Recent trades */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Recent Trades</h2>
            <Link href="/trades" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    trade.direction === 'LONG' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  )}>
                    {trade.direction === 'LONG' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{trade.instrument}</div>
                    <div className="text-xs text-gray-400">{trade.date}</div>
                  </div>
                </div>
                <div className={cn('text-sm font-bold', trade.pnl > 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { href: '/trades/new', label: 'Log New Trade', icon: '📝', border: 'hover:border-amber-300' },
          { href: '/ai-assistant', label: 'Ask AI Assistant', icon: '🤖', border: 'hover:border-purple-300' },
          { href: '/calendar', label: 'View Calendar', icon: '📅', border: 'hover:border-blue-300' },
          { href: '/analytics', label: 'Deep Analytics', icon: '📊', border: 'hover:border-emerald-300' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className={cn(
            'glass rounded-xl p-4 flex items-center gap-3 transition-all hover:bg-gray-50',
            action.border
          )}>
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
