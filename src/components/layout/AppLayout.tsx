'use client'

import { useState, ReactNode, cloneElement, isValidElement } from 'react'
import { Sidebar, TabId } from './Sidebar'

interface AppLayoutProps {
  overviewContent: ReactNode
  ethContent: ReactNode
  stablecoinContent: ReactNode
  hedgeContent: ReactNode
}

export function AppLayout({
  overviewContent,
  ethContent,
  stablecoinContent,
  hedgeContent,
}: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // Pass navigation function to overview content
        if (isValidElement(overviewContent)) {
          return cloneElement(overviewContent as React.ReactElement<{ onNavigate?: (tab: TabId) => void }>, {
            onNavigate: setActiveTab
          })
        }
        return overviewContent
      case 'eth':
        return ethContent
      case 'stablecoin':
        return stablecoinContent
      case 'hedge':
        return hedgeContent
      case 'backtest':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Backtest Coming Soon</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Analyze historical performance of your portfolio strategy across different market conditions.
              </p>
            </div>
          </div>
        )
      default:
        return overviewContent
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - full height */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <main className="flex-1 p-2 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export type { TabId }
