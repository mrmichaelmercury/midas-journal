'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, Bot, PlusCircle, TrendingUp, Clock, Globe, Newspaper, BarChart2 } from 'lucide-react'

function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const economicEvents = [
  { time: '8:30 AM ET', event: 'Initial Jobless Claims', impact: 'high', forecast: '210K', prior: '215K' },
  { time: '9:45 AM ET', event: 'S&P Global PMI (Flash)', impact: 'medium', forecast: '52.1', prior: '52.5' },
  { time: '10:00 AM ET', event: 'Existing Home Sales', impact: 'medium', forecast: '4.15M', prior: '4.08M' },
  { time: '11:00 AM ET', event: 'Kansas City Fed Mfg.', impact: 'low', forecast: '-5', prior: '-2' },
  { time: '1:00 PM ET', event: '7-Year Note Auction', impact: 'medium', forecast: '—', prior: '4.31%' },
]

const impactColor: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-gray-500 bg-gray-50 border-gray-200',
}

export default function MarketOverviewPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'Trader'

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <p className="text-gray-400 text-sm mb-1">{getTodayLabel()}</p>
        <h1 className="text-3xl font-black text-gray-900">
          {getGreeting()}, <span className="text-amber-500">{firstName}</span> 👋
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Briefing */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Today&apos;s Briefing</h2>
                <p className="text-xs text-gray-400">Live news feed — coming soon</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { tag: 'Macro', headline: 'Fed speakers on deck — Powell remarks at 2 PM ET could move rates markets', time: '6:12 AM' },
                { tag: 'Equities', headline: 'Nasdaq futures up 0.4% pre-market; mega-cap tech leading bid', time: '6:45 AM' },
                { tag: 'Futures', headline: 'NQ gapping above Wednesday highs — watch for ORB setup at open', time: '7:01 AM' },
              ].map((item) => (
                <div key={item.headline} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 text-gray-500 whitespace-nowrap mt-0.5">{item.tag}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-snug">{item.headline}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
              Live feed integration coming soon
            </div>
          </div>

          {/* Pre-Session Analysis */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Pre-Session Analysis</h2>
                <p className="text-xs text-gray-400">AI brief — coming soon</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Your personalized AI pre-session brief will appear here.</p>
              <p className="text-gray-400 text-xs mt-1">Analyzes your recent trades, key levels, and today&apos;s economic events.</p>
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask AI Assistant now
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Economic Calendar */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Economic Calendar</h2>
                <p className="text-xs text-gray-400">Today&apos;s data releases</p>
              </div>
            </div>
            <div className="space-y-2">
              {economicEvents.map((ev) => (
                <div key={ev.event} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${impactColor[ev.impact]}`}>
                      {ev.impact}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{ev.event}</p>
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                    <span>Forecast: <span className="text-gray-700">{ev.forecast}</span></span>
                    <span>Prior: <span className="text-gray-700">{ev.prior}</span></span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-3 h-3" />
              Live calendar integration coming soon
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: '/trades/new', icon: PlusCircle, label: 'Log Trade', color: 'text-amber-600', bg: 'bg-amber-50' },
                { href: '/calendar', icon: Calendar, label: 'View Calendar', color: 'text-blue-600', bg: 'bg-blue-50' },
                { href: '/ai-assistant', icon: Bot, label: 'Ask AI Assistant', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
