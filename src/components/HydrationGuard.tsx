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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-semibold text-foreground">Blue Lake</div>
          <div className="text-sm text-muted-foreground">DeFi Simulator</div>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
