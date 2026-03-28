'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check, Tag, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface PropFirm {
  id: string
  name: string
  tagline: string
  description: string
  discount: string
  discountLabel: string
  affiliateUrl: string
  logo: string
  highlight: string
  badge?: string
  border: string
  headerBg: string
}

const propFirms: PropFirm[] = [
  {
    id: 'ftmo',
    name: 'FTMO',
    tagline: 'The World\'s #1 Prop Firm',
    description: 'Trade up to $200K in funded capital. Industry-leading payouts up to 90%. The gold standard in prop trading with strict evaluation process.',
    discount: 'MIDAS10',
    discountLabel: '10% OFF',
    affiliateUrl: 'https://ftmo.com/?affiliates=PLACEHOLDER',
    logo: '🏦',
    highlight: 'Up to $200K funded',
    badge: 'Most Popular',
    border: 'border-blue-200 hover:border-blue-400',
    headerBg: 'bg-blue-50',
  },
  {
    id: 'apex',
    name: 'Apex Trader Funding',
    tagline: 'Best Value Futures Prop',
    description: 'Pay once evaluation. No monthly fees once funded. Best for futures traders — NQ, ES, and all the instruments you trade daily.',
    discount: 'MIDAS20',
    discountLabel: '20% OFF',
    affiliateUrl: 'https://apextraderfunding.com/?ref=PLACEHOLDER',
    logo: '⚡',
    highlight: 'One-time evaluation fee',
    badge: 'Best Value',
    border: 'border-orange-200 hover:border-orange-400',
    headerBg: 'bg-orange-50',
  },
  {
    id: 'tradeify',
    name: 'Tradeify',
    tagline: 'Modern Prop Firm for Futures',
    description: 'Fast funding, simple rules. Tradeify is built for modern futures traders. Combine accounts, no minimum trading days.',
    discount: 'MIDASVIP',
    discountLabel: 'VIP ACCESS',
    affiliateUrl: 'https://tradeify.co/?ref=PLACEHOLDER',
    logo: '🚀',
    highlight: 'No minimum trading days',
    border: 'border-purple-200 hover:border-purple-400',
    headerBg: 'bg-purple-50',
  },
  {
    id: 'topstep',
    name: 'Topstep',
    tagline: 'Trade Your Way to Funded',
    description: 'The original funded trading combine. Consistent rules, strong community, and reliable payouts. Great for new prop traders.',
    discount: 'MIDAS15',
    discountLabel: '15% OFF',
    affiliateUrl: 'https://topstep.com/?ref=PLACEHOLDER',
    logo: '📈',
    highlight: 'Industry pioneer since 2012',
    border: 'border-teal-200 hover:border-teal-400',
    headerBg: 'bg-teal-50',
  },
  {
    id: 'mff',
    name: 'My Funded Futures',
    tagline: 'Simple. Fast. Funded.',
    description: 'One of the fastest-growing prop firms for futures. Quick evaluation, low drawdown limits, and fast payouts. Great for scalpers.',
    discount: 'MIDAS25',
    discountLabel: '25% OFF',
    affiliateUrl: 'https://myfundedfutures.com/?ref=PLACEHOLDER',
    logo: '💰',
    highlight: 'Fastest growing in 2024',
    badge: 'New',
    border: 'border-emerald-200 hover:border-emerald-400',
    headerBg: 'bg-emerald-50',
  },
  {
    id: 'e8',
    name: 'E8 Funding',
    tagline: 'Professional Trading Capital',
    description: 'E8 offers generous account sizes and scaling plans. 8% profit target, 8% max loss — simple rules, professional funding.',
    discount: 'MIDAS8',
    discountLabel: '8% OFF',
    affiliateUrl: 'https://e8funding.com/?ref=PLACEHOLDER',
    logo: '8️⃣',
    highlight: 'Scaling to $400K possible',
    border: 'border-indigo-200 hover:border-indigo-400',
    headerBg: 'bg-indigo-50',
  },
]

function PropFirmCard({ firm }: { firm: PropFirm }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(firm.discount)
    setCopied(true)
    toast.success(`Copied "${firm.discount}" to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      'glass rounded-2xl overflow-hidden border transition-all duration-300 group',
      firm.border
    )}>
      {/* Header */}
      <div className={cn('p-5 border-b border-gray-100', firm.headerBg)}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            {firm.logo}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900 text-lg">{firm.name}</h3>
              {firm.badge && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {firm.badge}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{firm.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-amber-600 text-xs font-semibold">{firm.highlight}</span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{firm.description}</p>

        {/* Discount code */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-gray-500 font-medium">Discount Code</span>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {firm.discountLabel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-gray-900 text-lg tracking-widest">{firm.discount}</span>
            <button
              onClick={copyCode}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all',
                copied
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* CTA */}
        <a
          href={firm.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          Get Funded with {firm.name}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

export default function PropDealsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Prop Firm Deals</h1>
            <p className="text-gray-500 text-sm">Exclusive discounts for Midas Touch members</p>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3 max-w-2xl">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-amber-700 text-sm font-medium">Mike Trades Daily Approved</p>
            <p className="text-gray-600 text-xs mt-0.5">These are the prop firms Mike personally uses and recommends for the Crazy Horse ORB strategy. Use the codes below for exclusive community discounts.</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {propFirms.map((firm) => (
          <PropFirmCard key={firm.id} firm={firm} />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-8 max-w-2xl">
        * Affiliate links help support the Midas Touch Trading Group. Discount codes are subject to change. Always read each firm&apos;s rules carefully before trading.
      </p>
    </div>
  )
}
