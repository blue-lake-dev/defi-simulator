'use client'

import { useState } from 'react'

type TabId = 'portfolio' | 'eth' | 'stablecoin' | 'hedge'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

// Icons matching the image
const EthIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 256 417" fill="currentColor">
    <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity="0.6"/>
    <path d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
  </svg>
)

const CoinsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
  </svg>
)

const PortfolioIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
  </svg>
)

const tabs: Tab[] = [
  { id: 'portfolio', label: 'Portfolio', icon: <PortfolioIcon /> },
  { id: 'eth', label: 'ETH Products', icon: <EthIcon /> },
  { id: 'stablecoin', label: 'Stablecoin Products', icon: <CoinsIcon /> },
  { id: 'hedge', label: 'Hedge', icon: <ShieldIcon /> },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [lang, setLang] = useState<'en' | 'kr'>('en')

  return (
    <nav className="w-[240px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo Section */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-xl font-bold text-[#48104a]">Prism DeFi Labs</div>
        <div className="text-sm text-gray-500">DeFi Yield Simulator</div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200" />

      {/* Navigation */}
      <div className="flex-1 px-4 pt-4">
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-[#f5f0f5] text-[#48104a]'
                    : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <span className={isActive ? 'text-[#48104a]' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="px-4 pb-6">
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setLang('en')}
            className={`flex-1 px-4 py-1.5 text-sm font-medium transition-colors rounded-full ${
              lang === 'en'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('kr')}
            className={`flex-1 px-4 py-1.5 text-sm font-medium transition-colors rounded-full ${
              lang === 'kr'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            KR
          </button>
        </div>
      </div>
    </nav>
  )
}

export type { TabId }
