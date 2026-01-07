'use client'

import { useState } from 'react'
import { PROTOCOL_LOGOS } from '@/lib/logos'

export type TabId =
  | 'wallet'
  | 'dashboard'
  | 'lido'
  | 'etherfi'
  | 'aave'
  | 'morpho'
  | 'ethena'
  | 'maple'
  | 'pendle'
  | 'hyperliquid'

interface Tab {
  id: TabId
  label: string
  icon?: React.ReactNode
  logoUrl?: string
  disabled?: boolean
}

// Icons
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
)

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
  </svg>
)

const mainTabs: Tab[] = [
  { id: 'wallet', label: 'Wallet', icon: <WalletIcon /> },
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
]

const protocolTabs: Tab[] = [
  { id: 'lido', label: 'Lido', logoUrl: PROTOCOL_LOGOS['Lido'] },
  { id: 'etherfi', label: 'Ether.fi', logoUrl: PROTOCOL_LOGOS['Ether.fi'] },
  { id: 'aave', label: 'Aave', logoUrl: PROTOCOL_LOGOS['Aave V3'] },
  { id: 'morpho', label: 'Morpho', logoUrl: PROTOCOL_LOGOS['Morpho'] },
  { id: 'ethena', label: 'Ethena', logoUrl: PROTOCOL_LOGOS['Ethena'] },
  { id: 'maple', label: 'Maple', logoUrl: PROTOCOL_LOGOS['Maple'] },
  { id: 'pendle', label: 'Pendle', logoUrl: PROTOCOL_LOGOS['Pendle'] },
  { id: 'hyperliquid', label: 'Hyperliquid', logoUrl: PROTOCOL_LOGOS['Hyperliquid'] },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [lang, setLang] = useState<'en' | 'kr'>('en')

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id
    const isDisabled = tab.disabled
    return (
      <button
        key={tab.id}
        onClick={() => !isDisabled && onTabChange(tab.id)}
        disabled={isDisabled}
        className={`
          flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors text-sm font-medium
          ${isDisabled
            ? 'text-muted-foreground/50 cursor-not-allowed'
            : isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
          }
        `}
      >
        <span className={`w-5 h-5 flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}>
          {tab.logoUrl ? (
            <img src={tab.logoUrl} alt={tab.label} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            tab.icon
          )}
        </span>
        <span className="flex-1">{tab.label}</span>
        {isDisabled && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Soon</span>
        )}
      </button>
    )
  }

  return (
    <nav className="w-[240px] flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      {/* Logo Section */}
      <div className="px-4 pt-4 pb-3">
        <div className="text-lg font-semibold text-foreground">Blue Lake</div>
        <div className="text-sm text-muted-foreground">DeFi Simulator</div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Main Navigation */}
      <div className="px-4 pt-4">
        <div className="flex flex-col gap-1">
          {mainTabs.map(renderTab)}
        </div>
      </div>

      {/* Protocols Section */}
      <div className="px-4 pt-4 flex-1 overflow-y-auto">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
          Protocols
        </div>
        <div className="flex flex-col gap-1">
          {protocolTabs.map(renderTab)}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="px-4 pb-6">
        <div className="flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => setLang('en')}
            className={`flex-1 px-4 py-1.5 text-sm font-medium transition-colors rounded-full ${
              lang === 'en'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('kr')}
            className={`flex-1 px-4 py-1.5 text-sm font-medium transition-colors rounded-full ${
              lang === 'kr'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            KR
          </button>
        </div>
      </div>
    </nav>
  )
}
