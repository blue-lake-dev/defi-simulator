'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ReturnBreakdownProps {
  // ETH yield
  ethYield: number
  ethYieldInEth: number
  // Price impact (broken down)
  priceImpactPrincipal: number
  priceImpactYield: number
  // Stablecoin
  stablecoinYield: number
  // Leverage (broken down)
  leverageDeployYield: number
  leverageBorrowCost: number
  // Hedge
  hedgeReturn: number
  // Total
  totalReturn: number
  // Context
  hasLeverage: boolean
  hasHedge: boolean
}

export function ReturnBreakdown({
  ethYield,
  ethYieldInEth,
  priceImpactPrincipal,
  priceImpactYield,
  stablecoinYield,
  leverageDeployYield,
  leverageBorrowCost,
  hedgeReturn,
  totalReturn,
  hasLeverage,
  hasHedge,
}: ReturnBreakdownProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (row: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(row)) {
      newExpanded.delete(row)
    } else {
      newExpanded.add(row)
    }
    setExpandedRows(newExpanded)
  }

  const formatUsd = (amount: number, showSign = true): string => {
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)
    const sign = showSign ? (amount >= 0 ? '+' : '-') : (isNegative ? '-' : '')

    if (absAmount >= 1000000) {
      return `${sign}$${(absAmount / 1000000).toFixed(2)}M`
    }
    if (absAmount >= 1000) {
      return `${sign}$${Math.round(absAmount).toLocaleString()}`
    }
    return `${sign}$${absAmount.toFixed(0)}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 100) return `${amount.toFixed(1)} ETH`
    if (amount >= 1) return `${amount.toFixed(2)} ETH`
    return `${amount.toFixed(4)} ETH`
  }

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const totalPriceImpact = priceImpactPrincipal + priceImpactYield
  const leverageNet = leverageDeployYield - leverageBorrowCost
  const hasPriceImpactDetails = priceImpactPrincipal !== 0 || priceImpactYield !== 0

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <div className="border border-border rounded-md bg-card">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Return Breakdown</h3>
      </div>

      {/* Table */}
      <div className="divide-y divide-border text-sm">
        {/* ETH Yield */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-muted-foreground">ETH Yield</span>
          <div className="text-right">
            <span className={cn("font-medium", getValueColor(ethYield))}>
              +{formatEth(ethYieldInEth)}
            </span>
            <span className="text-muted-foreground ml-1 text-xs">
              ({formatUsd(ethYield, false)})
            </span>
          </div>
        </div>

        {/* Price Impact - collapsible */}
        <div className="px-4 py-2">
          <button
            onClick={() => hasPriceImpactDetails && toggleRow('price')}
            className={cn(
              "flex items-center justify-between w-full",
              hasPriceImpactDetails && "cursor-pointer hover:text-foreground"
            )}
          >
            <span className="text-muted-foreground flex items-center gap-1">
              Price Impact
              {hasPriceImpactDetails && <ChevronIcon expanded={expandedRows.has('price')} />}
            </span>
            <span className={cn("font-medium", getValueColor(totalPriceImpact))}>
              {formatUsd(totalPriceImpact)}
            </span>
          </button>
          {expandedRows.has('price') && hasPriceImpactDetails && (
            <div className="mt-2 ml-4 space-y-1 text-xs border-l-2 border-border pl-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>On Principal</span>
                <span className={getValueColor(priceImpactPrincipal)}>
                  {formatUsd(priceImpactPrincipal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>On Yield</span>
                <span className={getValueColor(priceImpactYield)}>
                  {formatUsd(priceImpactYield)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stablecoin Yield */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-muted-foreground">Stablecoin Yield</span>
          <span className={cn("font-medium", getValueColor(stablecoinYield))}>
            {formatUsd(stablecoinYield)}
          </span>
        </div>

        {/* Leverage Net - collapsible */}
        {hasLeverage && (
          <div className="px-4 py-2">
            <button
              onClick={() => toggleRow('leverage')}
              className="flex items-center justify-between w-full cursor-pointer hover:text-foreground"
            >
              <span className="text-muted-foreground flex items-center gap-1">
                Leverage Net
                <ChevronIcon expanded={expandedRows.has('leverage')} />
              </span>
              <span className={cn("font-medium", getValueColor(leverageNet))}>
                {formatUsd(leverageNet)}
              </span>
            </button>
            {expandedRows.has('leverage') && (
              <div className="mt-2 ml-4 space-y-1 text-xs border-l-2 border-border pl-3">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Deploy Yield</span>
                  <span className={getValueColor(leverageDeployYield)}>
                    {formatUsd(leverageDeployYield)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Borrow Cost</span>
                  <span className={getValueColor(-leverageBorrowCost)}>
                    {formatUsd(-leverageBorrowCost)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hedge Return */}
        {hasHedge && (
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-muted-foreground">Hedge Return</span>
            <span className={cn("font-medium", getValueColor(hedgeReturn))}>
              {formatUsd(hedgeReturn)}
            </span>
          </div>
        )}

        {/* Total Row */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
          <span className="font-semibold text-foreground">Total Return</span>
          <span className={cn("font-bold", getValueColor(totalReturn))}>
            {formatUsd(totalReturn)}
          </span>
        </div>
      </div>
    </div>
  )
}
