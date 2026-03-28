'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'Analyze my recent NQ trades and identify patterns',
  'How can I improve my Crazy Horse ORB entries?',
  'What time of day am I most profitable?',
  'Help me write a post about my winning trade today',
  'What is my biggest area for improvement?',
]

const demoResponses: Record<string, string> = {
  default: `I'm your AI trading assistant, powered by the Midas Touch framework. I can help you:

• **Analyze your trading patterns** — identify what's working and what isn't
• **Review specific trades** — get feedback on your Crazy Horse ORB setups
• **Generate Skool posts** — turn your wins into engaging community content
• **Answer strategy questions** — deep dives on ORB theory, risk management, and more

What would you like to explore today?`,
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: demoResponses.default },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content) return

    setMessages((prev) => [...prev, { role: 'user', content }])
    setInput('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 1500))

    const response = `Great question! Based on your trading data, here's what I can see:

**Pattern Analysis:**
Your Crazy Horse ORB setups on NQ are performing at a **71% win rate** — well above your overall average of 68.4%. Your best setups occur in the first 30 minutes of the New York open.

**Key Observations:**
• You're most profitable on Tuesday and Wednesday mornings
• Your average winner (2.7R) significantly outpaces your average loser (1R) — excellent discipline
• Fakeout trades (tagged 'stopped-out') account for 85% of your losses

**Recommendation:**
Consider adding a confirmation filter for fakeouts — perhaps waiting for a candle close above/below the ORB level before entering. This could reduce your loss count by ~40% based on your historical data.

Would you like me to go deeper on any of these insights?`

    setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    setLoading(false)
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-bold text-gray-900 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: boldLine }} />
      }
      if (line.startsWith('•')) {
        return <li key={i} className="text-gray-700 ml-4 list-disc" dangerouslySetInnerHTML={{ __html: boldLine.slice(2) }} />
      }
      if (line === '') return <br key={i} />
      return <p key={i} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-900">AI Trading Assistant</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600">Online · Powered by Claude</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          <TrendingUp className="w-3 h-3 text-amber-500" />
          Midas Touch AI
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-4', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={cn(
              'max-w-2xl rounded-2xl px-5 py-4',
              msg.role === 'assistant'
                ? 'glass border border-purple-100'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
            )}>
              <div className="space-y-1">
                {renderContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass rounded-2xl border border-purple-100">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-8 pb-4">
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:border-amber-300 hover:text-amber-600 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-8 py-5 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-50 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your trades, strategy, or request a post..."
            className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center disabled:opacity-40 hover:shadow-md hover:shadow-amber-500/25 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">AI responses are for educational purposes. Always do your own analysis.</p>
      </div>
    </div>
  )
}
