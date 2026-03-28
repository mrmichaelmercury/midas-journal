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
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Trade Dashboard' },
  { href: '/trades/new', icon: PlusCircle, label: 'Add Trade' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/trades', icon: BookOpen, label: 'Trade Journal' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { href: '/market-overview', icon: Globe, label: 'Market Overview' },
  { href: '/weekly-review', icon: Sparkles, label: 'Weekly Review' },
  { href: '/prop-deals', icon: Tag, label: 'Prop Firm Deals' },
  { href: '/payouts', icon: Wallet, label: 'Payout Tracker' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
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
      'relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-black text-gray-900 text-sm tracking-tight whitespace-nowrap">Midas Edge</div>
            <div className="text-amber-600 text-xs whitespace-nowrap">Midas Touch</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/market-overview' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                active
                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                'w-4 h-4 flex-shrink-0 transition-colors',
                active ? 'text-amber-600' : 'group-hover:text-gray-700'
              )} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && session?.user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'M'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">{session.user.name || 'Trader'}</div>
              <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all',
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
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-300 transition-all z-10 shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
