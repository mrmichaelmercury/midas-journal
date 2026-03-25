'use client'

import { useState, useEffect } from 'react'
import { Copy, Power, ChevronDown, Activity, CheckCircle, XCircle, Clock, TrendingUp, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrokerAccount {
  id: string
  nickname: string | null
  platform: string
  environment: string
  status: string
}

interface CopyFollower {
  id: string
  accountId: string
  isEnabled: boolean
  lotMultiplier: number
}

interface CopyTradeLog {
  id: string
  followerAccountId: string
  instrument: string
  direction: string
  quantity: number
  lotMultiplier: number
  status: string
  errorMessage: string | null
  executedAt: string
}

interface Config {
  id?: string
  masterAccountId: string | null
  isActive: boolean
  followers: CopyFollower[]
}

const statusIcon = (status: string) => {
  if (status === 'filled') return <CheckCircle className="w-4 h-4 text-emerald-400" />
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />
  return <Clock className="w-4 h-4 text-amber-400" />
}

const statusColor = (status: string) => {
  if (status === 'filled') return 'text-emerald-400'
  if (status === 'failed') return 'text-red-400'
  return 'text-amber-400'
}

export default function CopyTradingPage() {
  const [accounts, setAccounts] = useState<BrokerAccount[]>([])
  const [config, setConfig] = useState<Config>({ masterAccountId: null, isActive: false, followers: [] })
  const [logs, setLogs] = useState<CopyTradeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [masterOpen, setMasterOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [accRes, cfgRes, logRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/copy-trading/config'),
          fetch('/api/copy-trading/logs'),
        ])
        if (accRes.ok) {
          const data = await accRes.json()
          setAccounts(data.accounts ?? data ?? [])
        }
        if (cfgRes.ok) {
          const data = await cfgRes.json()
          setConfig(data)
        }
        if (logRes.ok) {
          const data = await logRes.json()
          setLogs(data.logs ?? data ?? [])
        }
      } catch (e) {
        // silently handle — page still renders with defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveConfig(next: Config) {
    setSaving(true)
    try {
      const res = await fetch('/api/copy-trading/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } finally {
      setSaving(false)
    }
  }

  function toggleActive() {
    const next = { ...config, isActive: !config.isActive }
    setConfig(next)
    saveConfig(next)
  }

  function setMaster(id: string) {
    // When master changes, rebuild followers from remaining accounts
    const followers = accounts
      .filter((a) => a.id !== id)
      .map((a) => {
        const existing = config.followers.find((f) => f.accountId === a.id)
        return existing ?? { id: '', accountId: a.id, isEnabled: true, lotMultiplier: 1.0 }
      })
    const next = { ...config, masterAccountId: id, followers }
    setConfig(next)
    setMasterOpen(false)
    saveConfig(next)
  }

  function toggleFollower(accountId: string) {
    const followers = config.followers.map((f) =>
      f.accountId === accountId ? { ...f, isEnabled: !f.isEnabled } : f
    )
    const next = { ...config, followers }
    setConfig(next)
    saveConfig(next)
  }

  function setMultiplier(accountId: string, value: number) {
    const followers = config.followers.map((f) =>
      f.accountId === accountId ? { ...f, lotMultiplier: value } : f
    )
    setConfig({ ...config, followers })
  }

  function saveMultiplier(accountId: string) {
    saveConfig(config)
  }

  const masterAccount = accounts.find((a) => a.id === config.masterAccountId)
  const followerAccounts = accounts.filter((a) => a.id !== config.masterAccountId)

  const totalMirrored = logs.length
  const filledCount = logs.filter((l) => l.status === 'filled').length
  const activeFollowers = config.followers.filter((f) => f.isEnabled).length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading copy trading config…</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Copy className="w-6 h-6 text-blue-400" />
            Copy Trading
          </h1>
          <p className="text-gray-500 mt-1">Mirror your trades across multiple prop firm accounts instantly</p>
        </div>

        {/* Master on/off switch */}
        <button
          onClick={toggleActive}
          disabled={!config.masterAccountId || saving}
          className={cn(
            'flex items-center gap-3 px-5 py-3 rounded-xl font-bold transition-all',
            config.isActive
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10',
            (!config.masterAccountId || saving) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Power className={cn('w-5 h-5', config.isActive ? 'text-emerald-400' : 'text-gray-500')} />
          {config.isActive ? 'Engine ON' : 'Engine OFF'}
          {config.isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Followers', value: String(activeFollowers), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Trades Mirrored', value: String(totalMirrored), icon: Copy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Success Rate', value: totalMirrored > 0 ? `${Math.round((filledCount / totalMirrored) * 100)}%` : '—', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <span className="text-gray-500 text-sm">{s.label}</span>
            </div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Master account selector */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">Master Account</h2>
          <p className="text-xs text-gray-500 mb-4">Trades placed here will be mirrored to all enabled follower accounts</p>

          <div className="relative">
            <button
              onClick={() => setMasterOpen(!masterOpen)}
              className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm hover:border-white/20 transition-all"
            >
              {masterAccount ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-white font-medium">{masterAccount.nickname || masterAccount.platform}</span>
                  <span className="text-gray-500 text-xs">{masterAccount.environment}</span>
                </div>
              ) : (
                <span className="text-gray-500">Select master account…</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {masterOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {accounts.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No connected accounts. Add one in Connected Accounts.</div>
                ) : (
                  accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setMaster(a.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-all text-left"
                    >
                      <div className={cn('w-2 h-2 rounded-full', a.status === 'connected' ? 'bg-emerald-400' : 'bg-gray-600')} />
                      <span className="text-white font-medium">{a.nickname || a.platform}</span>
                      <span className="text-gray-500 text-xs ml-auto">{a.environment}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {!config.masterAccountId && (
            <p className="text-xs text-amber-400/70 mt-3">Select a master account to enable copy trading</p>
          )}
        </div>

        {/* How it works */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            How It Works
          </h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Select your master account — the one you actively trade from' },
              { step: '2', text: 'Enable follower accounts and set lot multipliers for each' },
              { step: '3', text: 'Turn the engine ON — every trade on master is mirrored instantly' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 text-xs font-bold">
                  {item.step}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follower accounts */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-white mb-1">Follower Accounts</h2>
        <p className="text-xs text-gray-500 mb-5">These accounts will mirror every trade from the master account</p>

        {!config.masterAccountId ? (
          <div className="text-center py-8 text-gray-600 text-sm">Select a master account first</div>
        ) : followerAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">No other accounts available. Connect more accounts to enable copying.</div>
        ) : (
          <div className="space-y-3">
            {followerAccounts.map((account) => {
              const follower = config.followers.find((f) => f.accountId === account.id)
              const isEnabled = follower?.isEnabled ?? true
              const multiplier = follower?.lotMultiplier ?? 1.0

              return (
                <div
                  key={account.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border transition-all',
                    isEnabled ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/3 border-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2.5 h-2.5 rounded-full', account.status === 'connected' ? 'bg-emerald-400' : 'bg-gray-600')} />
                    <div>
                      <div className="text-sm font-semibold text-white">{account.nickname || account.platform}</div>
                      <div className="text-xs text-gray-500">{account.platform} · {account.environment}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Lot multiplier */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Multiplier</span>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setMultiplier(account.id, parseFloat(e.target.value) || 1)}
                        onBlur={() => saveMultiplier(account.id)}
                        disabled={!isEnabled}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-center disabled:opacity-40"
                      />
                      <span className="text-xs text-gray-500">x</span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleFollower(account.id)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-all',
                        isEnabled ? 'bg-blue-500' : 'bg-white/10'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                          isEnabled ? 'left-5' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Activity Log
        </h2>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">
            No mirrored trades yet. Enable the engine and place a trade on your master account to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Instrument</th>
                  <th className="text-left pb-3 font-medium">Direction</th>
                  <th className="text-right pb-3 font-medium">Qty</th>
                  <th className="text-right pb-3 font-medium">Multiplier</th>
                  <th className="text-left pb-3 font-medium">Follower</th>
                  <th className="text-right pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const acct = accounts.find((a) => a.id === log.followerAccountId)
                  return (
                    <tr key={log.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(log.status)}
                          <span className={cn('text-xs capitalize', statusColor(log.status))}>{log.status}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono font-semibold text-white">{log.instrument}</td>
                      <td className="py-3">
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded', log.direction === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                          {log.direction}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-300">{log.quantity}</td>
                      <td className="py-3 text-right text-gray-400">{log.lotMultiplier}x</td>
                      <td className="py-3 text-gray-400">{acct?.nickname || acct?.platform || log.followerAccountId.slice(0, 8)}</td>
                      <td className="py-3 text-right text-gray-500 text-xs">
                        {new Date(log.executedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
