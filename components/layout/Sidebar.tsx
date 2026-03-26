'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
  Wallet,
  Trophy,
  Link2,
  Copy,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/trades', icon: BookOpen, label: 'Trade Journal' },
  { href: '/trades/new', icon: PlusCircle, label: 'Add Trade' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/weekly-review', icon: Sparkles, label: 'Weekly Review' },
  { href: '/prop-deals', icon: Tag, label: 'Prop Firm Deals' },
  { href: '/payouts', icon: Wallet, label: 'Payout Tracker' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { href: '/copy-trading', icon: Copy, label: 'Copy Trading' },
  { href: '/accounts', icon: Link2, label: 'Connected Accounts' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'relative flex flex-col bg-[#111111] border-r border-white/5 transition-all duration-300 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
          <TrendingUp className="w-4 h-4 text-black" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-black text-white text-sm tracking-tight whitespace-nowrap">Midas AI</div>
            <div className="text-amber-400/60 text-xs whitespace-nowrap">Midas Touch</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                active
                  ? 'bg-amber-500/15 border border-amber-500/25 text-amber-400'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                active ? 'text-amber-400' : 'group-hover:text-gray-200'
              )} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        {!collapsed && session?.user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'M'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-medium text-white truncate">{session.user.name || 'Trader'}</div>
              <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500/30 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
