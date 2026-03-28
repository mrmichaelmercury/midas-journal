'use client'

import { cn } from '@/lib/utils'

interface Badge {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  progressMax?: number
}

const badges: Badge[] = [
  { id: 'first-trade', title: 'First Blood', description: 'Log your first trade', icon: '⚔️', earned: true, earnedDate: '2024-01-01', rarity: 'common' },
  { id: 'first-green', title: 'Green Machine', description: 'Close your first green day', icon: '💚', earned: true, earnedDate: '2024-01-02', rarity: 'common' },
  { id: 'streak-7', title: '7-Day Warrior', description: 'Journal for 7 days in a row', icon: '🔥', earned: true, earnedDate: '2024-01-08', rarity: 'rare' },
  { id: 'streak-30', title: 'Iron Discipline', description: 'Journal for 30 days in a row', icon: '🏋️', earned: false, rarity: 'epic', progress: 14, progressMax: 30 },
  { id: 'first-payout', title: 'Prop Star', description: 'Log your first prop firm payout', icon: '💸', earned: true, earnedDate: '2024-01-15', rarity: 'rare' },
  { id: 'payout-5k', title: 'Five Figure Club', description: 'Total prop payouts reach $5,000', icon: '💎', earned: false, rarity: 'epic', progress: 2100, progressMax: 5000 },
  { id: 'payout-10k', title: 'Midas Touch', description: 'Total prop payouts reach $10,000', icon: '👑', earned: false, rarity: 'legendary', progress: 2100, progressMax: 10000 },
  { id: 'trades-10', title: 'Getting Started', description: 'Log 10 trades', icon: '📝', earned: true, earnedDate: '2024-01-05', rarity: 'common' },
  { id: 'trades-50', title: 'Journaling Pro', description: 'Log 50 trades', icon: '📚', earned: false, rarity: 'rare', progress: 47, progressMax: 50 },
  { id: 'trades-100', title: 'Century Club', description: 'Log 100 trades', icon: '💯', earned: false, rarity: 'epic', progress: 47, progressMax: 100 },
  { id: 'win-rate-60', title: 'Sharp Edge', description: 'Maintain 60%+ win rate over 20 trades', icon: '⚡', earned: true, earnedDate: '2024-01-14', rarity: 'rare' },
  { id: 'win-rate-70', title: 'Elite Trader', description: 'Maintain 70%+ win rate over 20 trades', icon: '🎯', earned: false, rarity: 'epic', progress: 68.4, progressMax: 70 },
  { id: 'green-week', title: 'Green Week', description: 'Finish a full week in profit', icon: '🌿', earned: true, earnedDate: '2024-01-07', rarity: 'rare' },
  { id: 'green-month', title: 'Green Month', description: 'Finish a full month in profit', icon: '🌳', earned: false, rarity: 'epic' },
  { id: 'pf-2x', title: 'Risk Master', description: 'Achieve 2x profit factor over 20 trades', icon: '🛡️', earned: true, earnedDate: '2024-01-16', rarity: 'rare' },
  { id: 'ai-user', title: 'AI Pioneer', description: 'Use the AI assistant for the first time', icon: '🤖', earned: true, earnedDate: '2024-01-10', rarity: 'common' },
]

const rarityConfig = {
  common: { label: 'Common', color: 'text-gray-500', border: 'border-gray-200', bg: 'bg-gray-50', glow: '' },
  rare: { label: 'Rare', color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', glow: 'shadow-blue-100' },
  epic: { label: 'Epic', color: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50', glow: 'shadow-purple-100' },
  legendary: { label: 'Legendary', color: 'text-amber-600', border: 'border-amber-300', bg: 'bg-amber-50', glow: 'shadow-amber-100' },
}

const currentStreak = 14

export default function AchievementsPage() {
  const earned = badges.filter((b) => b.earned)
  const inProgress = badges.filter((b) => !b.earned && b.progress !== undefined)
  const locked = badges.filter((b) => !b.earned && b.progress === undefined)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Achievements</h1>
        <p className="text-gray-500 mt-1">Track your milestones and flex your progress</p>
      </div>

      {/* Streak + Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Streak card */}
        <div className="md:col-span-1 glass-gold rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-2">🔥</div>
            <div className="text-5xl font-black text-amber-500">{currentStreak}</div>
            <div className="text-gray-900 font-bold mt-1">Day Streak</div>
            <div className="text-gray-500 text-sm mt-1">Keep journaling to extend it!</div>
            <div className="mt-4 flex items-center justify-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-xs',
                  i < 7 ? 'bg-amber-100 border border-amber-300 text-amber-600' : 'bg-gray-100 border border-gray-200 text-gray-400'
                )}>
                  {i < 7 ? '✓' : '·'}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">Last 7 days</div>
          </div>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: 'Badges Earned', value: earned.length, total: badges.length, icon: '🏅', color: 'text-amber-600' },
            { label: 'Legendary', value: badges.filter((b) => b.rarity === 'legendary' && b.earned).length, total: badges.filter((b) => b.rarity === 'legendary').length, icon: '👑', color: 'text-amber-600' },
            { label: 'Epic Badges', value: badges.filter((b) => b.rarity === 'epic' && b.earned).length, total: badges.filter((b) => b.rarity === 'epic').length, icon: '💎', color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={cn('text-3xl font-black', s.color)}>{s.value}<span className="text-lg text-gray-300">/{s.total}</span></div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-10">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-amber-500">⏳</span> In Progress
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((badge) => {
              const r = rarityConfig[badge.rarity]
              const pct = badge.progress && badge.progressMax ? (badge.progress / badge.progressMax) * 100 : 0
              return (
                <div key={badge.id} className={cn('glass rounded-2xl p-5 border transition-all hover:shadow-md', r.border)}>
                  <div className="flex items-start gap-4 mb-3">
                    <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center text-2xl', r.bg, r.border)}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{badge.title}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded-full', r.bg, r.color)}>{r.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progress</span>
                      <span className={r.color}>{badge.progress?.toLocaleString()} / {badge.progressMax?.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', badge.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-500 to-orange-400' : badge.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-indigo-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Earned */}
      <div className="mb-10">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-emerald-500">✅</span> Earned Badges ({earned.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {earned.map((badge) => {
            const r = rarityConfig[badge.rarity]
            return (
              <div
                key={badge.id}
                className={cn(
                  'glass rounded-2xl p-4 border text-center transition-all hover:scale-105 cursor-default',
                  r.border,
                  badge.rarity === 'legendary' && 'shadow-md shadow-amber-100'
                )}
              >
                <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl mx-auto mb-3', r.bg, r.border)}>
                  {badge.icon}
                </div>
                <div className="font-bold text-gray-900 text-xs">{badge.title}</div>
                <div className={cn('text-xs mt-1', r.color)}>{r.label}</div>
                {badge.earnedDate && (
                  <div className="text-xs text-gray-400 mt-1">{badge.earnedDate}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Locked */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-gray-400">🔒</span> Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {locked.map((badge) => {
            const r = rarityConfig[badge.rarity]
            return (
              <div key={badge.id} className="glass rounded-2xl p-4 border border-gray-100 text-center opacity-50 hover:opacity-70 transition-all cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl mx-auto mb-3 grayscale">
                  {badge.icon}
                </div>
                <div className="font-bold text-gray-500 text-xs">{badge.title}</div>
                <div className={cn('text-xs mt-1', r.color)}>{r.label}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">{badge.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
