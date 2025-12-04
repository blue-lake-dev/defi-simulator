'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { getCollateralParams } from '@/lib/constants'
import { useLiveProducts } from '@/hooks/useLiveApys'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'

// Hyperliquid maintenance margin rate (typically 0.5% for ETH)
const HYPERLIQUID_MAINTENANCE_MARGIN = 0.005

export function LeverageRiskMetricsWidget() {
  const { ethAllocations, ethAmount, ethPrice, hedgeConfig, hedgeCollateral, hedgePositionSize, priceChangeScenario } =
    usePortfolioStore()
  const { ethProducts } = useLiveProducts()
  const { data: hlData } = useHyperliquid()

  // Calculate Aave leverage stats
  const aaveLeverageStats = ethAllocations.reduce(
    (acc, allocation) => {
      if (allocation.leverage?.enabled) {
        const product = ethProducts.find((p) => p.id === allocation.productId)
        const collateralParams = getCollateralParams(allocation.productId)

        if (product && collateralParams) {
          const positionValue = ethAmount() * (allocation.weight / 100)
          const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
          const borrowedValue = collateralValue * (allocation.leverage.ltv / 100)

          acc.totalCollateral += collateralValue
          acc.totalBorrowed += borrowedValue
          acc.weightedThreshold += collateralValue * (collateralParams.liquidationThreshold / 100)
        }
      }
      return acc
    },
    { totalCollateral: 0, totalBorrowed: 0, weightedThreshold: 0 }
  )

  const hasAaveLeverage = aaveLeverageStats.totalBorrowed > 0
  const hasHedge = hedgeConfig.enabled

  // Aave Health Factor
  const aaveHealthFactor = hasAaveLeverage
    ? aaveLeverageStats.weightedThreshold / aaveLeverageStats.totalBorrowed
    : 0

  // Aave Liquidation Price
  const aaveLiquidationPrice = hasAaveLeverage
    ? ethPrice * (aaveLeverageStats.totalBorrowed / aaveLeverageStats.weightedThreshold)
    : 0

  const aaveDropPercent = hasAaveLeverage ? ((ethPrice - aaveLiquidationPrice) / ethPrice) * 100 : 0

  // Hyperliquid Hedge calculations
  const hedgeCollateralAmount = hedgeCollateral()
  const hedgePosition = hedgePositionSize()

  // Hedge liquidation: when losses exceed (collateral - maintenance margin)
  // For a short position, liquidation happens when price rises
  // Liquidation Price = Entry Price × (1 + (Collateral - Maintenance) / Position)
  // Simplified: Liq Price = Entry × (1 + (1/leverage) - maintenance_rate)
  const hedgeLiquidationPrice = hasHedge
    ? ethPrice * (1 + (hedgeCollateralAmount - hedgePosition * HYPERLIQUID_MAINTENANCE_MARGIN) / hedgePosition)
    : 0

  const hedgeRisePercent = hasHedge ? ((hedgeLiquidationPrice - ethPrice) / ethPrice) * 100 : 0

  // Hedge Health Factor approximation
  // HF = Collateral / (Unrealized Loss + Maintenance Margin Required)
  // At current price (no loss), HF is high
  // We simulate with the price change scenario
  const priceChangeRatio = priceChangeScenario / 100
  const unrealizedLoss = hedgePosition * Math.max(0, priceChangeRatio) // Short loses when price rises
  const maintenanceRequired = hedgePosition * HYPERLIQUID_MAINTENANCE_MARGIN
  const hedgeHealthFactor = hasHedge && (unrealizedLoss + maintenanceRequired) > 0
    ? hedgeCollateralAmount / (unrealizedLoss + maintenanceRequired)
    : hasHedge ? 99 : 0

  // Get status styling
  const getHealthStatus = (hf: number): { label: string; color: string; bgColor: string } => {
    if (hf >= 1.5) return { label: 'Safe', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (hf >= 1.2) return { label: 'Moderate', color: 'text-amber-600', bgColor: 'bg-amber-50' }
    return { label: 'Risky', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const hasAnyLeverage = hasAaveLeverage || hasHedge

  if (!hasAnyLeverage) {
    return (
      <Card title="Leverage Risk Metrics" className="h-full">
        <div className="flex items-center justify-center h-full min-h-[120px]">
          <p className="text-sm text-gray-400">No leverage or hedge active</p>
        </div>
      </Card>
    )
  }

  const aaveStatus = getHealthStatus(aaveHealthFactor)
  const hedgeStatus = getHealthStatus(hedgeHealthFactor)

  return (
    <Card title="Leverage Risk Metrics" className="h-full">
      <div className="space-y-4">
        {/* Aave Leverage Section */}
        {hasAaveLeverage && (
          <div className={`rounded-lg p-3 ${aaveStatus.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Aave V3 Leverage</span>
              <span className={`text-xs font-medium ${aaveStatus.color}`}>{aaveStatus.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Health Factor</p>
                <p className={`text-xl font-bold ${aaveStatus.color}`}>
                  {aaveHealthFactor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Liquidation Price</p>
                <p className="text-xl font-bold text-red-600">{formatPrice(aaveLiquidationPrice)}</p>
                <p className="text-xs text-red-500">-{aaveDropPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Hyperliquid Hedge Section */}
        {hasHedge && (
          <div className={`rounded-lg p-3 ${hedgeStatus.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Hyperliquid Short</span>
              <span className={`text-xs font-medium ${hedgeStatus.color}`}>{hedgeStatus.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Health Factor</p>
                <p className={`text-xl font-bold ${hedgeStatus.color}`}>
                  {hedgeHealthFactor > 10 ? '>10' : hedgeHealthFactor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Liquidation Price</p>
                <p className="text-xl font-bold text-red-600">{formatPrice(hedgeLiquidationPrice)}</p>
                <p className="text-xs text-red-500">+{hedgeRisePercent.toFixed(0)}% rise</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
