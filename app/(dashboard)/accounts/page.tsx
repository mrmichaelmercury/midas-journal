'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface BrokerAccount {
  id: string
  platform: string
  nickname: string | null
  environment: string
  status: string
  lastSyncAt: string | null
  tradeCount: number
  createdAt: string
}

type ModalView = 'picker' | 'tradovate-form'

const PLATFORM_INFO = {
  tradovate: {
    name: 'Tradovate',
    description: 'Covers Apex Trader Funding & Tradeify',
    note: 'API access is free and public',
    comingSoon: false,
    logo: '🔷',
  },
  rithmic: {
    name: 'Rithmic',
    description: 'Covers Apex Trader Funding (Rithmic accounts)',
    note: null,
    comingSoon: true,
    logo: '🔶',
  },
  mt45: {
    name: 'MetaTrader 4/5',
    description: 'Covers FTMO & other MT4/MT5 brokers',
    note: null,
    comingSoon: true,
    logo: '📊',
  },
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    connected: {
      label: 'Connected',
      icon: <CheckCircle2 className="w-3 h-3" />,
      cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    },
    disconnected: {
      label: 'Disconnected',
      icon: <WifiOff className="w-3 h-3" />,
      cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    },
    syncing: {
      label: 'Syncing',
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    },
    error: {
      label: 'Error',
      icon: <AlertCircle className="w-3 h-3" />,
      cls: 'bg-red-400/10 text-red-400 border-red-400/20',
    },
  }
  const info = map[status] ?? map.disconnected
  return (
    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium', info.cls)}>
      {info.icon}
      {info.label}
    </span>
  )
}

function AccountCard({
  account,
  onSync,
  onDelete,
}: {
  account: BrokerAccount
  onSync: (id: string) => void
  onDelete: (id: string) => void
}) {
  const platform = PLATFORM_INFO[account.platform as keyof typeof PLATFORM_INFO]
  const logo = platform?.logo ?? '🔌'
  const name = platform?.name ?? account.platform

  return (
    <div className="glass rounded-2xl p-5 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
            {logo}
          </div>
          <div>
            <div className="font-semibold text-white">{account.nickname || name}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {name} · {account.environment === 'demo' ? 'Demo' : 'Live'}
            </div>
          </div>
        </div>
        <StatusBadge status={account.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Trades Synced</div>
          <div className="text-lg font-bold text-white">{account.tradeCount}</div>
        </div>
        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last Sync
          </div>
          <div className="text-sm font-medium text-white">
            {account.lastSyncAt
              ? new Date(account.lastSyncAt).toLocaleDateString()
              : '—'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSync(account.id)}
          disabled={account.status === 'syncing'}
          className="flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {account.status === 'syncing' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Sync Now
        </button>
        <button
          onClick={() => onDelete(account.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>
    </div>
  )
}

function ConnectModal({
  onClose,
  onConnected,
}: {
  onClose: () => void
  onConnected: (account: BrokerAccount) => void
}) {
  const [view, setView] = useState<ModalView>('picker')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [environment, setEnvironment] = useState<'demo' | 'live'>('demo')
  const [loading, setLoading] = useState(false)

  async function handleTradovateConnect() {
    if (!username || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'tradovate', username, password, environment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connection failed')
      toast.success('Account connected!')
      onConnected(data)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            {view === 'picker' ? (
              <h2 className="font-bold text-white">Connect Account</h2>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setView('picker')} className="text-gray-500 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="font-bold text-white">Connect Tradovate</h2>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {view === 'picker' ? 'Choose your trading platform' : 'Enter your Tradovate credentials'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {view === 'picker' && (
            <div className="space-y-3">
              {/* Tradovate */}
              <button
                onClick={() => setView('tradovate-form')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  🔷
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">Tradovate</div>
                  <div className="text-xs text-gray-500 mt-0.5">Covers Apex Trader Funding & Tradeify</div>
                  <div className="text-xs text-emerald-400/80 mt-1">API access is free and public</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
              </button>

              {/* Rithmic */}
              <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  🔶
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Rithmic</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600">
                      Coming Soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Covers Apex Trader Funding (Rithmic accounts)</div>
                </div>
              </div>

              {/* MetaTrader */}
              <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  📊
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">MetaTrader 4/5</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600">
                      Coming Soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Covers FTMO & other MT4/MT5 brokers</div>
                </div>
              </div>
            </div>
          )}

          {view === 'tradovate-form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Tradovate username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your Tradovate password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleTradovateConnect()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['demo', 'live'] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setEnvironment(env)}
                      className={cn(
                        'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize',
                        environment === env
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/15'
                      )}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTradovateConnect}
                disabled={loading || !username || !password}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Connecting…' : 'Connect'}
              </button>

              <p className="text-xs text-gray-600 text-center">
                Your credentials are encrypted and only used to sync your trade data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BrokerAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts')
      if (res.ok) setAccounts(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  async function handleSync(id: string) {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'syncing' } : a))
    )
    try {
      const res = await fetch(`/api/accounts/${id}/sync`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      toast.success(`Synced ${data.tradeCount} trades`)
      await fetchAccounts()
    } catch (err: any) {
      toast.error(err.message || 'Sync failed')
      await fetchAccounts()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Disconnect this account? Your synced trade history will remain.')) return
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to disconnect')
      toast.success('Account disconnected')
      setAccounts((prev) => prev.filter((a) => a.id !== id))
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Connected Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your broker connections and sync trade data</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Connect Account
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Wifi className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No accounts connected yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Connect your first trading account to start syncing trades automatically.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onSync={handleSync}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ConnectModal
          onClose={() => setShowModal(false)}
          onConnected={(account) => setAccounts((prev) => [account, ...prev])}
        />
      )}
    </div>
  )
}
