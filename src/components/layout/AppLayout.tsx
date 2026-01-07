'use client'

import { useState } from 'react'
import { Sidebar, TabId } from './Sidebar'
import { Header } from './Header'

// Map tab IDs to display names
const TAB_TITLES: Record<TabId, string> = {
  wallet: 'Wallet',
  dashboard: 'Dashboard',
  lido: 'Lido',
  etherfi: 'Ether.fi',
  aave: 'Aave',
  morpho: 'Morpho',
  ethena: 'Ethena',
  maple: 'Maple',
  pendle: 'Pendle',
  hyperliquid: 'Hyperliquid',
}

export function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('wallet')

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Wallet</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                View and manage your virtual token balances.
              </p>
            </div>
          </div>
        )
      case 'dashboard':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Overview of your portfolio performance and positions.
              </p>
            </div>
          </div>
        )
      case 'lido':
      case 'etherfi':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🥩</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{TAB_TITLES[activeTab]}</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Stake ETH and receive liquid staking tokens.
              </p>
            </div>
          </div>
        )
      case 'aave':
      case 'morpho':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{TAB_TITLES[activeTab]}</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Supply collateral and borrow assets.
              </p>
            </div>
          </div>
        )
      case 'ethena':
      case 'maple':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💵</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{TAB_TITLES[activeTab]}</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Deposit stablecoins and earn yield.
              </p>
            </div>
          </div>
        )
      case 'pendle':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Pendle</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Trade yield and lock in fixed rates with PT tokens.
              </p>
            </div>
          </div>
        )
      case 'hyperliquid':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📉</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Hyperliquid</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Open perpetual positions for hedging or speculation.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - full height */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area with Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={TAB_TITLES[activeTab]} />
        <main className="flex-1 p-4 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export type { TabId }
