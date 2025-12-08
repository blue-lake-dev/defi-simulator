'use client'

import { useState, ReactNode } from 'react'
import { Sidebar, TabId } from './Sidebar'

interface AppLayoutProps {
  portfolioContent: ReactNode
  ethContent: ReactNode
  stablecoinContent: ReactNode
  hedgeContent: ReactNode
}

export function AppLayout({
  portfolioContent,
  ethContent,
  stablecoinContent,
  hedgeContent,
}: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio')

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return portfolioContent
      case 'eth':
        return ethContent
      case 'stablecoin':
        return stablecoinContent
      case 'hedge':
        return hedgeContent
      default:
        return portfolioContent
    }
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Sidebar - full height */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}
