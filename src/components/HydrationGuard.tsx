'use client'

import { useHydration } from '@/store/portfolioStore'
import { ReactNode } from 'react'

interface HydrationGuardProps {
  children: ReactNode
}

export function HydrationGuard({ children }: HydrationGuardProps) {
  const hydrated = useHydration()

  if (!hydrated) {
    // Show a minimal loading state that matches the layout
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-[#48104a]">Juicy Yield</h1>
              <span className="text-sm text-gray-500">
                Institutional DeFi Portfolio Simulator
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
