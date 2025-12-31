'use client'

import { cn } from '@/lib/utils'

interface CompactSummaryProps {
  // Expected balance
  expectedBalanceUsd: number
  expectedBalanceEth: number
  // Total return
  totalReturn: number
  returnPercent: number
  // APYs
  ethApy: number
  stablecoinApy: number
}

export function CompactSummary({
  expectedBalanceUsd,
  expectedBalanceEth,
  totalReturn,
  returnPercent,
  ethApy,
  stablecoinApy,
}: CompactSummaryProps) {

  const formatUsd = (amount: number): string => {
    const absAmount = Math.abs(amount)
    if (absAmount >= 1000000) {
      return `$${(absAmount / 1000000).toFixed(2)}M`
    }
    if (absAmount >= 1000) {
      return `$${Math.round(absAmount).toLocaleString()}`
    }
    return `$${absAmount.toFixed(0)}`
  }

  const formatUsdSigned = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '-'
    const absAmount = Math.abs(amount)
    if (absAmount >= 1000000) {
      return `${sign}$${(absAmount / 1000000).toFixed(2)}M`
    }
    if (absAmount >= 1000) {
      return `${sign}$${Math.round(absAmount).toLocaleString()}`
    }
    return `${sign}$${absAmount.toFixed(0)}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    return `${amount.toFixed(2)} ETH`
  }

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`
  }

  const formatPercentNoSign = (value: number): string => {
    return `${Math.abs(value).toFixed(1)}%`
  }

  const getReturnColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {/* Expected Balance */}
      <div className="border border-border rounded-md bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground mb-1">Expected Balance</div>
        <div className="text-xl font-semibold text-foreground">
          {formatUsd(expectedBalanceUsd)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatEth(expectedBalanceEth)}
        </div>
      </div>

      {/* Total Return */}
      <div className="border border-border rounded-md bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground mb-1">Total Return</div>
        <div className={cn("text-xl font-semibold", getReturnColor(totalReturn))}>
          {formatUsdSigned(totalReturn)} <span className="text-base font-medium">({formatPercentNoSign(returnPercent)})</span>
        </div>
      </div>

      {/* ETH APY */}
      <div className="border border-border rounded-md bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground mb-1">ETH APY</div>
        <div className="text-xl font-semibold text-foreground">
          {formatPercent(ethApy)}
        </div>
      </div>

      {/* Stablecoin APY */}
      <div className="border border-border rounded-md bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground mb-1">Stablecoin APY</div>
        <div className="text-xl font-semibold text-foreground">
          {formatPercent(stablecoinApy)}
        </div>
      </div>
    </div>
  )
}
