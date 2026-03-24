'use client'

import { useSession } from 'next-auth/react'
import { User, Bell, Shield, Link2, Palette, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data & Export', icon: Database },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-sm',
                  activeSection === s.id
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeSection === 'profile' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="font-bold text-white text-lg">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-amber-500/30">
                  {session?.user?.name?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <button className="text-sm bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-600 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Fields */}
              {[
                { label: 'Display Name', value: session?.user?.name || '', placeholder: 'Your name' },
                { label: 'Email', value: session?.user?.email || '', placeholder: 'your@email.com' },
                { label: 'Trading Username', value: '@midastrader', placeholder: '@username' },
                { label: 'Skool Profile URL', value: '', placeholder: 'https://skool.com/...' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{field.label}</label>
                  <input
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/40 transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Default Strategy</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all">
                  <option>Crazy Horse ORB</option>
                  <option>ORB Long</option>
                  <option>ORB Short</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                className={cn(
                  'px-6 py-3 rounded-xl font-semibold text-sm transition-all',
                  saved
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/30'
                )}
              >
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-white text-lg">Integrations</h2>
              <p className="text-gray-400 text-sm">Connect your trading platforms and community tools.</p>
              {[
                { name: 'Skool Community', icon: '🏫', desc: 'Auto-post trade ideas to Midas Touch group', connected: false },
                { name: 'TradeStation', icon: '📊', desc: 'Sync trades automatically', connected: false },
                { name: 'TradingView', icon: '📈', desc: 'Import chart screenshots', connected: false },
                { name: 'Discord', icon: '💬', desc: 'Share wins to the community Discord', connected: false },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <div className="font-medium text-white text-sm">{integration.name}</div>
                      <div className="text-xs text-gray-500">{integration.desc}</div>
                    </div>
                  </div>
                  <button className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl hover:bg-amber-500/20 transition-all">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}

          {(activeSection !== 'profile' && activeSection !== 'integrations') && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-white text-lg capitalize mb-4">
                {sections.find((s) => s.id === activeSection)?.label} Settings
              </h2>
              <p className="text-gray-500 text-sm">This section is coming soon. We&apos;re building it out!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
