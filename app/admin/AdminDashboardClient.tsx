'use client'

import { useState, useRef } from 'react'
import { Users, Key, BarChart3, Search, Plus, ToggleLeft, ToggleRight, Trash2, TrendingUp, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'

type User = {
  id: string
  email: string | null
  name: string | null
  role: string
  isActive: boolean
  createdAt: Date
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

type Props = {
  initialUsers: User[]
  initialInviteCodes: InviteCode[]
  stats: Stats
}

export default function AdminDashboardClient({ initialUsers, initialInviteCodes, stats }: Props) {
  const [tab, setTab] = useState<'users' | 'invites' | 'stats'>('users')
  const [users, setUsers] = useState(initialUsers)
  const [inviteCodes, setInviteCodes] = useState(initialInviteCodes)
  const [search, setSearch] = useState('')
  const [newCodeDays, setNewCodeDays] = useState(30)
  const [creatingCode, setCreatingCode] = useState(false)
  const [csvError, setCsvError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredUsers = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleUser = async (userId: string, currentActive: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActive: !currentActive }),
    })
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
      )
    }
  }

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

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError('')

    const text = await file.text()
    const emails = text
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.includes('@'))

    if (!emails.length) {
      setCsvError('No valid emails found in CSV.')
      return
    }

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk-deactivate', emails }),
    })

    if (res.ok) {
      const { deactivated } = await res.json()
      setUsers((prev) =>
        prev.map((u) => (emails.includes(u.email?.toLowerCase() ?? '') ? { ...u, isActive: false } : u))
      )
      alert(`Deactivated ${deactivated} user(s).`)
    } else {
      setCsvError('Failed to process CSV.')
    }

    if (fileRef.current) fileRef.current.value = ''
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

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">User Management</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:border-amber-500/30 transition-all">
                  <Users className="w-4 h-4" />
                  Bulk Deactivate (CSV)
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {csvError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {csvError}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">User</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Role</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Joined</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm text-white">{user.name || '—'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleUser(user.id, user.isActive)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <><ToggleRight className="w-4 h-4 text-emerald-400" /> Deactivate</>
                          ) : (
                            <><ToggleLeft className="w-4 h-4 text-gray-500" /> Activate</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">No users found.</div>
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
