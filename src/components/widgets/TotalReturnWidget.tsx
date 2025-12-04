'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, STABLECOIN_PRODUCTS, getBorrowRate } from '@/lib/constants'

export function TotalReturnWidget() {
  const {
    ethRatio,
    ethPrice,
    priceChangeScenario,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  const currentEthAmount = ethAmount()
  const currentStableAmount = stablecoinAmount()
  const priceMultiplier = 1 + priceChangeScenario / 100
  const projectedEthPrice = ethPrice * priceMultiplier

  // Calculate ETH yield in ETH terms (all ETH products yield in ETH)
  // ETH position in ETH = currentEthAmount / ethPrice
  const ethPositionInEth = ethPrice > 0 ? currentEthAmount / ethPrice : 0

  // Calculate weighted ETH APY
  const ethApy = ethAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // ETH yield in ETH terms
  const ethYieldInEth = ethPositionInEth * (ethApy / 100)

  // ETH yield converted to USD at projected price (yield is also affected by price change)
  const ethYieldInUsd = ethYieldInEth * projectedEthPrice

  // Calculate Stablecoin APY (USD-denominated)
  const stablecoinApy = stablecoinAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // USD yield from stablecoins
  const usdYield = currentStableAmount * (stablecoinApy / 100)

  // Calculate leverage boost (USD-denominated, from stablecoin deployment)
  const leverageYieldUsd = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = currentEthAmount * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const deployTarget = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const borrowRate = getBorrowRate(allocation.leverage.borrowAsset)

      const netYield = borrowed * ((deployApy - borrowRate) / 100)
      return sum + netYield
    }
    return sum
  }, 0)

  // Price appreciation/depreciation on ETH position
  const ethPriceImpactUsd = currentEthAmount * (priceChangeScenario / 100)

  // Total USD return
  const totalUsdReturn = ethYieldInUsd + usdYield + leverageYieldUsd + ethPriceImpactUsd

  // Calculate as percentage of total position
  const totalPosition = currentEthAmount + currentStableAmount + totalBorrowedAmount()
  const totalReturnPercent = totalPosition > 0 ? (totalUsdReturn / totalPosition) * 100 : 0

  // Calculate deployment percentage
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const ethDeployed = (ethRatio / 100) * (ethTotal / 100)
  const stableDeployed = ((100 - ethRatio) / 100) * (stableTotal / 100)
  const deployedPercent = Math.round((ethDeployed + stableDeployed) * 100)
  const isFullyDeployed = deployedPercent === 100

  const isPositive = totalReturnPercent >= 0

  const formatUsd = (amount: number): string => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount.toFixed(0)}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    if (amount >= 1) {
      return `${amount.toFixed(2)} ETH`
    }
    return `${amount.toFixed(4)} ETH`
  }

  return (
    <Card
      title="Total Return"
      subtitle="Annual"
      className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'} h-full`}
    >
      <div className="space-y-3">
        {/* Main return display */}
        <div>
          <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatUsd(totalUsdReturn)}
          </span>
          <span className={`text-lg font-medium text-gray-500 ml-2`}>
            ({isPositive ? '+' : ''}{totalReturnPercent.toFixed(2)}%)
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm">
          {/* ETH Yield */}
          {ethYieldInEth > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">ETH Yield</span>
              <span className="text-gray-900">
                <span className="text-purple-600 font-medium">{formatEth(ethYieldInEth)}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-medium">{formatUsd(ethYieldInUsd)}</span>
              </span>
            </div>
          )}

          {/* ETH Price Impact */}
          {ethPriceImpactUsd !== 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">ETH Price ({priceChangeScenario >= 0 ? '+' : ''}{priceChangeScenario}%)</span>
              <span className={`font-medium ${ethPriceImpactUsd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ethPriceImpactUsd >= 0 ? '+' : ''}{formatUsd(ethPriceImpactUsd)}
              </span>
            </div>
          )}

          {/* USD Yield */}
          {usdYield > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">USD Yield</span>
              <span className="font-medium text-gray-900">{formatUsd(usdYield)}</span>
            </div>
          )}

          {/* Leverage Yield */}
          {leverageYieldUsd !== 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Leverage</span>
              <span className={`font-medium ${leverageYieldUsd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leverageYieldUsd >= 0 ? '+' : ''}{formatUsd(leverageYieldUsd)}
              </span>
            </div>
          )}
        </div>

        {!isFullyDeployed && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 pt-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{deployedPercent}% deployed</span>
          </div>
        )}
      </div>
    </Card>
  )
}
