'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DualLogo } from '@/components/ui/Logo'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'

type TabId = 'all' | 'eth' | 'stablecoin' | 'hedge'

interface EthPosition {
  id: string
  name: string
  protocol: string
  allocation: number // percentage of portfolio
  positionValue: number
  positionInEth: number
  apy: number
  yield: number
  yieldInEth: number
  // Leverage info (optional)
  leverage?: {
    ltv: number
    borrowed: number
    healthFactor: number
    liquidationPrice: number
  }
}

interface StablecoinPosition {
  id: string
  name: string
  protocol: string
  allocation: number // percentage of portfolio
  positionValue: number
  apy: number
  yield: number
}

interface HedgePosition {
  allocation: number // percentage of portfolio
  positionSize: number
  collateral: number
  leverage: number
  fundingRate: number
  fundingIncome: number
  hedgePnL: number
}

interface PositionTableProps {
  ethPositions: EthPosition[]
  stablecoinPositions: StablecoinPosition[]
  hedgePosition: HedgePosition | null
}

export function PositionTable({
  ethPositions,
  stablecoinPositions,
  hedgePosition,
}: PositionTableProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all')

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

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    return `${amount.toFixed(2)} ETH`
  }

  const formatEthSigned = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '-'
    const absAmount = Math.abs(amount)
    if (absAmount >= 1000) {
      return `${sign}${absAmount.toFixed(1)} ETH`
    }
    return `${sign}${absAmount.toFixed(2)} ETH`
  }

  const getHfColor = (hf: number) => {
    if (hf >= 1.5) return 'bg-green-100 text-green-700'
    if (hf >= 1.2) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const getYieldColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'eth', label: 'ETH' },
    { id: 'stablecoin', label: 'Stablecoin' },
    { id: 'hedge', label: 'Hedge' },
  ]

  const showEth = activeTab === 'all' || activeTab === 'eth'
  const showStablecoin = activeTab === 'all' || activeTab === 'stablecoin'
  const showHedge = activeTab === 'all' || activeTab === 'hedge'

  const hasPositions = ethPositions.length > 0 || stablecoinPositions.length > 0 || hedgePosition !== null

  return (
    <div className="border border-border rounded-md bg-card">
      {/* Header with tabs */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Positions</h3>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                activeTab === tab.id
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="text-xs">
        {!hasPositions ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No positions configured
          </div>
        ) : (
          <table className="w-full">
            {/* Header Row */}
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left font-normal py-2 px-3">Product</th>
                <th className="text-right font-normal py-2 px-3">Alloc</th>
                <th className="text-right font-normal py-2 px-3">Value</th>
                <th className="text-right font-normal py-2 px-3">APY</th>
                <th className="text-right font-normal py-2 px-3">Yield</th>
                <th className="text-left font-normal py-2 px-3">Leverage</th>
                <th className="text-left font-normal py-2 px-3">Health</th>
                <th className="text-right font-normal py-2 px-3">Liq Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* ETH Positions */}
              {showEth && ethPositions.map((position) => (
                <tr key={position.id} className="hover:bg-muted/20">
                  {/* Logo + Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <DualLogo
                        tokenSrc={getTokenLogo(position.name)}
                        protocolSrc={getProtocolLogo(position.protocol)}
                        tokenAlt={position.name}
                        protocolAlt={position.protocol}
                        size={24}
                      />
                      <div>
                        <div className="font-medium text-foreground">{position.name}</div>
                        <div className="text-[10px] text-muted-foreground">{position.protocol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Allocation */}
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {position.allocation.toFixed(0)}%
                  </td>

                  {/* Value - ETH first */}
                  <td className="text-right py-2.5 px-3">
                    <div className="text-foreground">{formatEth(position.positionInEth)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatUsd(position.positionValue)}</div>
                  </td>

                  {/* APY */}
                  <td className="text-right py-2.5 px-3 text-foreground">
                    {formatPercent(position.apy)}
                  </td>

                  {/* Yield - ETH first */}
                  <td className="text-right py-2.5 px-3">
                    <div className={cn("font-medium", getYieldColor(position.yield))}>
                      {formatEthSigned(position.yieldInEth)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ({formatUsd(position.yield)})
                    </div>
                  </td>

                  {/* Leverage info */}
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {position.leverage ? (
                      <span>{position.leverage.ltv}% · {formatUsd(position.leverage.borrowed)}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>

                  {/* Health Factor */}
                  <td className="py-2.5 px-3">
                    {position.leverage ? (
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getHfColor(position.leverage.healthFactor))}>
                        {position.leverage.healthFactor.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>

                  {/* Liquidation Price */}
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {position.leverage ? (
                      <span>${position.leverage.liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Stablecoin Positions */}
              {showStablecoin && stablecoinPositions.map((position) => (
                <tr key={position.id} className="hover:bg-muted/20">
                  {/* Logo + Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <DualLogo
                        tokenSrc={getTokenLogo(position.name)}
                        protocolSrc={getProtocolLogo(position.protocol)}
                        tokenAlt={position.name}
                        protocolAlt={position.protocol}
                        size={24}
                      />
                      <div>
                        <div className="font-medium text-foreground">{position.name}</div>
                        <div className="text-[10px] text-muted-foreground">{position.protocol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Allocation */}
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {position.allocation.toFixed(0)}%
                  </td>

                  {/* Value */}
                  <td className="text-right py-2.5 px-3 text-foreground">
                    {formatUsd(position.positionValue)}
                  </td>

                  {/* APY */}
                  <td className="text-right py-2.5 px-3 text-foreground">
                    {formatPercent(position.apy)}
                  </td>

                  {/* Yield */}
                  <td className={cn("text-right py-2.5 px-3 font-medium", getYieldColor(position.yield))}>
                    {formatUsdSigned(position.yield)}
                  </td>

                  {/* Empty leverage columns */}
                  <td className="py-2.5 px-3 text-muted-foreground/50">—</td>
                  <td className="py-2.5 px-3 text-muted-foreground/50">—</td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground/50">—</td>
                </tr>
              ))}

              {/* Hedge Position */}
              {showHedge && hedgePosition && (
                <tr className="hover:bg-muted/20">
                  {/* Logo + Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">HL</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">ETH Short</div>
                        <div className="text-[10px] text-muted-foreground">Hyperliquid</div>
                      </div>
                    </div>
                  </td>

                  {/* Allocation */}
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {hedgePosition.allocation.toFixed(0)}%
                  </td>

                  {/* Position Size */}
                  <td className="text-right py-2.5 px-3">
                    <div className="text-foreground">{formatUsd(hedgePosition.positionSize)}</div>
                    <div className="text-[10px] text-muted-foreground">{hedgePosition.leverage}x</div>
                  </td>

                  {/* Funding Rate */}
                  <td className="text-right py-2.5 px-3 text-green-600">
                    +{formatPercent(hedgePosition.fundingRate)}
                  </td>

                  {/* Total Return */}
                  <td className={cn("text-right py-2.5 px-3 font-medium", getYieldColor(hedgePosition.fundingIncome + hedgePosition.hedgePnL))}>
                    {formatUsdSigned(hedgePosition.fundingIncome + hedgePosition.hedgePnL)}
                  </td>

                  {/* Empty leverage columns */}
                  <td className="py-2.5 px-3 text-muted-foreground/50">—</td>
                  <td className="py-2.5 px-3 text-muted-foreground/50">—</td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground/50">—</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
