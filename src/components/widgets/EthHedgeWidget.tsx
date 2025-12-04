'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'

export function EthHedgeWidget() {
  const {
    hedgeConfig,
    toggleHedge,
    setHedgeAllocation,
    setHedgeLeverage,
    hedgeCollateral,
    hedgePositionSize,
    investmentAmount,
    ethRatio,
    stablecoinAmount,
  } = usePortfolioStore()

  const { data: hlData, isLoading, refresh, lastUpdated } = useHyperliquid()

  const fundingRate = hlData?.fundingRate ?? FALLBACK_FUNDING_RATE
  const maxLeverage = hlData?.maxLeverage ?? 25

  const collateral = hedgeCollateral()
  const positionSize = hedgePositionSize()

  // Total stablecoin portion (before hedge)
  const stablecoinTotal = investmentAmount * ((100 - ethRatio) / 100)

  // Annual funding cost (positive rate = longs pay shorts = we receive)
  // When shorting: positive funding = we receive, negative = we pay
  const annualFundingPnl = positionSize * (fundingRate / 100)

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card
      title="ETH Short Hedge"
      subtitle="Hyperliquid Perpetual"
      className="h-full"
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Enable Hedge</span>
          <button
            onClick={toggleHedge}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              hedgeConfig.enabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                hedgeConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {hedgeConfig.enabled && (
          <>
            {/* Allocation Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">% of Stablecoin</span>
                <span className="text-xs font-medium text-gray-700">
                  {hedgeConfig.allocationPercent}% ({formatAmount(collateral)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hedgeConfig.allocationPercent}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value)
                  if (newValue === 0) {
                    toggleHedge() // Disable hedge when allocation is 0
                  } else {
                    setHedgeAllocation(newValue)
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Leverage Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Leverage</span>
                <span className="text-xs font-medium text-gray-700">{hedgeConfig.leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max={maxLeverage}
                value={hedgeConfig.leverage}
                onChange={(e) => setHedgeLeverage(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1x</span>
                <span>{maxLeverage}x</span>
              </div>
            </div>

            {/* Position Summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Position Size</span>
                <span className="font-medium text-gray-900">{formatAmount(positionSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collateral</span>
                <span className="font-medium text-gray-900">{formatAmount(collateral)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining Portfolio</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(investmentAmount - collateral)}
                </span>
              </div>
            </div>

            {/* Funding Rate */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Funding Rate (Annual)</span>
                <button
                  onClick={refresh}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Refresh funding rate"
                >
                  <svg
                    className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${
                    fundingRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {fundingRate >= 0 ? '+' : ''}
                  {fundingRate.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-400">
                  {fundingRate >= 0 ? '(shorts receive)' : '(shorts pay)'}
                </span>
              </div>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">Updated {formatTime(lastUpdated)}</p>
              )}
            </div>

            {/* Annual Funding PnL */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Est. Annual Funding</span>
              <span
                className={`font-medium ${annualFundingPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {annualFundingPnl >= 0 ? '+' : ''}
                {formatAmount(Math.abs(annualFundingPnl))}
              </span>
            </div>
          </>
        )}

        {!hedgeConfig.enabled && (
          <p className="text-xs text-gray-400">
            Enable to hedge ETH exposure with a short position on Hyperliquid
          </p>
        )}
      </div>
    </Card>
  )
}
