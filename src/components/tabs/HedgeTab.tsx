'use client'

import { usePortfolioStore } from '@/store/portfolioStore'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'

export function HedgeTab() {
  const {
    hedgeConfig,
    setHedgeConfig,
    investmentAmount,
    ethAmount,
  } = usePortfolioStore()

  const { data: hlData, isLoading, refresh } = useHyperliquid()

  const fundingRate = hlData?.fundingRate ?? FALLBACK_FUNDING_RATE
  const maxLeverage = hlData?.maxLeverage ?? 25

  // Hedge amount from global allocation
  const hedgeAllocationPercent = hedgeConfig.allocationPercent
  const hedgeAmount = investmentAmount * (hedgeAllocationPercent / 100)

  // Fund allocation (percentage of hedge funds to deploy as margin)
  const fundAllocation = hedgeConfig.fundAllocation ?? 80
  const deployedAmount = hedgeAmount * (fundAllocation / 100)

  // Leverage
  const leverage = hedgeConfig.leverage

  // Position calculations
  const collateral = deployedAmount
  const positionSize = collateral * leverage

  // Annual funding income (positive rate = shorts receive)
  const annualFundingIncome = positionSize * (fundingRate / 100)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const handleFundAllocationChange = (value: number) => {
    setHedgeConfig({
      ...hedgeConfig,
      fundAllocation: value,
    })
  }

  const handleLeverageChange = (value: number) => {
    setHedgeConfig({
      ...hedgeConfig,
      leverage: value,
    })
  }

  // Empty state when hedge allocation is 0
  if (hedgeAllocationPercent === 0) {
    return (
      <div className="border border-border rounded-md bg-card">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-xs font-medium text-foreground">ETH Hedge</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-8 h-8 mb-2 text-muted-foreground">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground mb-1">No Hedge Allocation</div>
          <p className="text-[10px] text-muted-foreground max-w-xs">
            Adjust the hedge slider in Overview to enable hedging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Card 1: Hedge Configuration + Position Details */}
      <div className="border border-border rounded-md bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-xs font-medium text-foreground">ETH Hedge</h3>
        </div>

        {/* Summary bar */}
        <div className="px-3 py-2 border-b border-border">
          <div className="text-xs text-muted-foreground">
            Allocation: <span className="font-medium text-foreground">{formatUsd(hedgeAmount)}</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="p-3 space-y-4">
          {/* Fund Allocation Slider */}
          <div className="max-w-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Fund Allocation</span>
              <span className="text-xs font-medium text-foreground">
                {fundAllocation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fundAllocation}
              onChange={(e) => handleFundAllocationChange(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--foreground) 0%, var(--foreground) ${fundAllocation}%, var(--muted) ${fundAllocation}%, var(--muted) 100%)`
              }}
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Leverage Multiplier Slider */}
          <div className="max-w-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Leverage</span>
              <span className="text-xs font-medium text-foreground">{leverage}x</span>
            </div>
            <input
              type="range"
              min="1"
              max={maxLeverage}
              value={leverage}
              onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--foreground) 0%, var(--foreground) ${((leverage - 1) / (maxLeverage - 1)) * 100}%, var(--muted) ${((leverage - 1) / (maxLeverage - 1)) * 100}%, var(--muted) 100%)`
              }}
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>1x</span>
              <span>10x</span>
              <span>{maxLeverage}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Grid: Position & Income */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Collateral */}
        <div className="border border-border rounded-md bg-card px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">Collateral</div>
          <div className="text-xl font-semibold text-foreground">{formatUsd(collateral)}</div>
        </div>

        {/* Position */}
        <div className="border border-border rounded-md bg-card px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">Position</div>
          <div className="text-xl font-semibold text-foreground">{formatUsd(positionSize)}</div>
        </div>

        {/* Funding Rate */}
        <div className="border border-border rounded-md bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Funding Rate</span>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {isLoading ? '...' : 'Refresh'}
            </button>
          </div>
          <div className="text-xl font-semibold text-foreground">+{fundingRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-1">+{formatUsd(annualFundingIncome)}/yr</div>
        </div>
      </div>
    </div>
  )
}
