'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, STABLECOIN_PRODUCTS, getBorrowRate } from '@/lib/constants'

export function ApyWidget() {
  const {
    ethRatio,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  // Calculate ETH APY (weighted average of selected products)
  const ethApy = ethAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // Calculate Stablecoin APY (weighted average of selected products)
  const stablecoinApy = stablecoinAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // Calculate leverage boost
  // Leverage_Boost = ((Borrowed × Deploy_APY) - (Borrowed × Borrow_Rate)) / Total_Position
  const leverageBoost = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = ethAmount() * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const deployTarget = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const borrowRate = getBorrowRate(allocation.leverage.borrowAsset)

      // Net yield from leverage = borrowed * (deployAPY - borrowRate)
      const netYield = borrowed * ((deployApy - borrowRate) / 100)
      return sum + netYield
    }
    return sum
  }, 0)

  // Total position value (base + borrowed)
  const totalPosition = ethAmount() + stablecoinAmount() + totalBorrowedAmount()

  // Base portfolio APY (without leverage)
  const baseApy = (ethRatio / 100) * ethApy + ((100 - ethRatio) / 100) * stablecoinApy

  // Leverage boost as percentage of total position
  const leverageBoostPercent = totalPosition > 0 ? (leverageBoost / totalPosition) * 100 : 0

  // Final portfolio APY
  const portfolioApy = baseApy + leverageBoostPercent

  // Check if allocations are valid (both sum to 100%)
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const isValid = ethTotal === 100 && stableTotal === 100

  return (
    <Card title="Portfolio APY" className="border-l-4 border-l-purple-900 h-full">
      <div className="space-y-4">
        {/* Main APY Display */}
        <div>
          <span className={`text-4xl font-bold ${isValid ? 'text-purple-900' : 'text-gray-400'}`}>
            {isValid ? portfolioApy.toFixed(2) : '—'}
          </span>
          <span className={`text-2xl font-medium ${isValid ? 'text-purple-900' : 'text-gray-400'}`}>
            %
          </span>
        </div>

        {/* APY Breakdown */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ETH Yield</span>
            <span className={`font-medium ${isValid ? 'text-gray-900' : 'text-gray-400'}`}>
              {isValid ? `${ethApy.toFixed(2)}%` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stablecoin Yield</span>
            <span className={`font-medium ${isValid ? 'text-gray-900' : 'text-gray-400'}`}>
              {isValid ? `${stablecoinApy.toFixed(2)}%` : '—'}
            </span>
          </div>
          {isValid && leverageBoostPercent !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Leverage Boost</span>
              <span className={`font-medium ${leverageBoostPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leverageBoostPercent >= 0 ? '+' : ''}{leverageBoostPercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
