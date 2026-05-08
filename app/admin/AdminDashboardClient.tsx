'use client'

import { useMemo, useState } from 'react'
import { Users, Key, BarChart3, Search, Plus, Trash2, TrendingUp, LogOut, Activity } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'

type ExtensionUser = {
  memberKey: string
  memberName: string | null
  tradeCount: number
  lastTradeDate: string
  totalPnl: number
  winRate: number
}

type InviteCode = {
  id: string
  code: string
  expiresAt: Date | null
  isUsed: boolean
  usedBy: string | null
  createdAt: Date
}

type Stats = {
  total: number
  active: number
  newThisMonth: number
}

type ExtensionTrade = {
  id: string
  memberKey: string
  memberName: string | null
  date: string
  instrument: string
  outcome: string
  dollarAmount: number
  source: string
  broker: string | null
}

type Period = 'today' | 'week' | 'month' | 'year' | 'all'

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
]

function periodStart(period: Period, now = new Date()): Date {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (period) {
    case 'today':
      return startOfDay
    case 'week': {
      // Week starts Monday (trading-week friendly).
      const dow = startOfDay.getDay()
      const offset = dow === 0 ? 6 : dow - 1
      const d = new Date(startOfDay)
      d.setDate(d.getDate() - offset)
      return d
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'year':
      return new Date(now.getFullYear(), 0, 1)
    case 'all':
      return new Date(0)
  }
}

type Props = {
  initialExtensionUsers: ExtensionUser[]
  initialInviteCodes: InviteCode[]
  stats: Stats
  initialTrades: ExtensionTrade[]
}

export default function AdminDashboardClient({
  initialExtensionUsers,
  initialInviteCodes,
  stats,
  initialTrades,
}: Props) {
  const [tab, setTab] = useState<'users' | 'invites' | 'stats' | 'trades'>('trades')
  const [trades] = useState(initialTrades)
  const [period, setPeriod] = useState<Period>('week')
  const maskKey = (k: string) => (k.length <= 8 ? k : `${k.slice(0, 4)}…${k.slice(-4)}`)
  const [extensionUsers] = useState(initialExtensionUsers)
  const [inviteCodes, setInviteCodes] = useState(initialInviteCodes)
  const [search, setSearch] = useState('')
  const [newCodeDays, setNewCodeDays] = useState(30)
  const [creatingCode, setCreatingCode] = useState(false)

  const filteredExtensionUsers = extensionUsers.filter((u) =>
    !search ||
    u.memberKey.toLowerCase().includes(search.toLowerCase()) ||
    u.memberName?.toLowerCase().includes(search.toLowerCase())
  )

  const periodView = useMemo(() => {
    const now = new Date()
    const start = periodStart(period, now)
    const inPeriod = trades.filter((t) => new Date(t.date) >= start)

    let wins = 0
    let losses = 0
    let totalPnl = 0
    const memberSet = new Set<string>()
    const dailyPnl = new Map<string, number>()

    for (const t of inPeriod) {
      memberSet.add(t.memberKey)
      const day = t.date.slice(0, 10) // ISO date prefix
      const sign = t.outcome === 'WIN' ? 1 : -1
      const pnl = sign * Math.abs(t.dollarAmount)
      totalPnl += pnl
      dailyPnl.set(day, (dailyPnl.get(day) ?? 0) + pnl)
      if (t.outcome === 'WIN') wins++
      else losses++
    }

    // Streak from most-recent-first run of WINs in the filtered set.
    const recentSorted = [...inPeriod].sort((a, b) => (a.date < b.date ? 1 : -1))
    let streak = 0
    for (const t of recentSorted) {
      if (t.outcome === 'WIN') streak++
      else break
    }

    const totalTrades = wins + losses
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const tradesToday = inPeriod.filter((t) => new Date(t.date) >= startOfDay).length
    const tradesThisMonth = inPeriod.filter((t) => new Date(t.date) >= startOfMonth).length

    const chartDays = Array.from(dailyPnl.entries())
      .map(([day, pnl]) => ({ day, pnl }))
      .sort((a, b) => (a.day < b.day ? -1 : 1))

    return {
      start,
      inPeriod: recentSorted,
      stats: {
        totalTrades,
        winRate,
        wins,
        losses,
        streak,
        uniqueMembers: memberSet.size,
        tradesToday,
        tradesThisMonth,
        totalPnl,
      },
      chartDays,
    }
  }, [trades, period])

  const createInviteCode = async () => {
    setCreatingCode(true)
    const res = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: newCodeDays }),
    })
    if (res.ok) {
      const { inviteCode } = await res.json()
      setInviteCodes((prev) => [inviteCode, ...prev])
    }
    setCreatingCode(false)
  }

  const deactivateCode = async (codeId: string) => {
    const res = await fetch(`/api/admin/invite-codes?id=${codeId}`, { method: 'DELETE' })
    if (res.ok) {
      setInviteCodes((prev) => prev.filter((c) => c.id !== codeId))
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#111111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-bold text-white">Midas Edge</span>
            <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">Admin</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-8">
          {[
            { key: 'trades', label: 'Live Trades', icon: Activity },
            { key: 'stats', label: 'Stats', icon: BarChart3 },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'invites', label: 'Invite Codes', icon: Key },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Live Trades */}
        {tab === 'trades' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Live Trades from Chrome Extension</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="period" className="text-xs text-gray-500">Period</label>
                <select
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Trades', value: periodView.stats.totalTrades, color: 'text-white' },
                { label: 'Win Rate', value: `${periodView.stats.winRate}%`, color: 'text-emerald-400' },
                {
                  label: 'Record (W/L)',
                  value: `${periodView.stats.wins} / ${periodView.stats.losses}`,
                  color: 'text-white',
                },
                { label: 'Current Streak', value: periodView.stats.streak, color: 'text-amber-400' },
                { label: 'Active Members', value: periodView.stats.uniqueMembers, color: 'text-white' },
                { label: 'Trades Today', value: periodView.stats.tradesToday, color: 'text-emerald-400' },
                { label: 'Trades This Month', value: periodView.stats.tradesThisMonth, color: 'text-amber-400' },
                {
                  label: 'Net P&L',
                  value: `${periodView.stats.totalPnl >= 0 ? '+' : '-'}$${Math.abs(
                    periodView.stats.totalPnl
                  ).toLocaleString()}`,
                  color: periodView.stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400',
                },
              ].map((s) => (
                <div key={s.label} className="bg-[#111111] border border-white/5 rounded-2xl p-5">
                  <div className="text-gray-500 text-xs mb-2">{s.label}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <DailyPnlChart days={periodView.chartDays} />

            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">Recent Trades</h3>
                <span className="text-xs text-gray-500">
                  {periodView.inPeriod.length} trade{periodView.inPeriod.length === 1 ? '' : 's'} in period
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Date</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Member</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Instrument</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Outcome</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {periodView.inPeriod.slice(0, 100).map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-gray-300">
                        {format(new Date(t.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-white">{t.memberName || '—'}</div>
                        <code className="text-xs text-gray-500 font-mono">{maskKey(t.memberKey)}</code>
                      </td>
                      <td className="px-5 py-3 text-sm text-white font-medium">{t.instrument}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.outcome === 'WIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.outcome}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 text-sm text-right font-mono ${
                          t.outcome === 'WIN' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {t.outcome === 'WIN' ? '+' : '-'}${Math.abs(t.dollarAmount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{t.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {periodView.inPeriod.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No trades in this period.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {tab === 'stats' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black">Platform Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'Total Users', value: stats.total, color: 'text-white' },
                { label: 'Active Users', value: stats.active, color: 'text-emerald-400' },
                { label: 'New This Month', value: stats.newThisMonth, color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                  <div className="text-gray-500 text-sm mb-2">{s.label}</div>
                  <div className={`text-4xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users — distinct extension members */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Extension Users</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Distinct Whop members syncing trades from the Midas Edge Chrome extension.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {extensionUsers.length} member{extensionUsers.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by member name or key..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Member</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium text-right">Trades</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Last Trade</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium text-right">Win Rate</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium text-right">Total P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExtensionUsers.map((u) => (
                    <tr key={u.memberKey} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm text-white">{u.memberName || '—'}</div>
                        <code className="text-xs text-gray-500 font-mono">{maskKey(u.memberKey)}</code>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-white font-mono">{u.tradeCount}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {format(new Date(u.lastTradeDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-sm font-mono ${
                          u.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {u.winRate}%
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right text-sm font-mono ${
                        u.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {u.totalPnl >= 0 ? '+' : '-'}${Math.abs(u.totalPnl).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExtensionUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  {extensionUsers.length === 0
                    ? 'No extension users yet. Members appear here once they sync their first trade.'
                    : 'No members match your search.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invite Codes */}
        {tab === 'invites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">Invite Codes</h2>

            {/* Create new code */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Create New Invite Code</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400">Expires in</label>
                  <select
                    value={newCodeDays}
                    onChange={(e) => setNewCodeDays(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
                <button
                  onClick={createInviteCode}
                  disabled={creatingCode}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {creatingCode ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Generate Code
                </button>
              </div>
            </div>

            {/* List of codes */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Code</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Created</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Expires</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteCodes.map((code) => {
                    const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()
                    return (
                      <tr key={code.id} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-4">
                          <code className="font-mono text-sm text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {code.code}
                          </code>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {format(new Date(code.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {code.expiresAt ? format(new Date(code.expiresAt), 'MMM d, yyyy') : 'Never'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            code.isUsed
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : isExpired
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {code.isUsed ? 'Used' : isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {!code.isUsed && (
                            <button
                              onClick={() => deactivateCode(code.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                              title="Delete code"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {inviteCodes.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">No invite codes yet. Generate one above.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DailyPnlChart({ days }: { days: { day: string; pnl: number }[] }) {
  const visible = days.slice(-60)
  const maxAbs = Math.max(1, ...visible.map((d) => Math.abs(d.pnl)))

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Daily P&amp;L</h3>
        <span className="text-xs text-gray-500">
          {visible.length} day{visible.length === 1 ? '' : 's'}
          {days.length > visible.length ? ` (latest ${visible.length} of ${days.length})` : ''}
        </span>
      </div>
      {visible.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-gray-500">
          No trades to chart in this period.
        </div>
      ) : (
        <div className="flex items-end gap-1 h-40">
          {visible.map((d) => {
            const heightPct = (Math.abs(d.pnl) / maxAbs) * 100
            const positive = d.pnl >= 0
            return (
              <div
                key={d.day}
                className="flex-1 flex items-end h-full group relative"
                title={`${format(new Date(d.day), 'MMM d, yyyy')} • ${
                  positive ? '+' : '-'
                }$${Math.abs(d.pnl).toLocaleString()}`}
              >
                <div
                  className={`w-full rounded-t ${
                    positive ? 'bg-emerald-500/70' : 'bg-red-500/70'
                  } transition-opacity group-hover:opacity-100 opacity-80`}
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
