'use client'

import { DualLogo } from '@/components/ui/Logo'
import { usePortfolioStore } from '@/store/portfolioStore'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'
import { useLiveProducts } from '@/hooks/useLiveApys'

export function StablecoinProductsTab() {
  const {
    stablecoinAllocations,
    toggleStablecoinAllocation,
    updateStablecoinAllocationWeight,
    setStablecoinAllocations,
    stablecoinAmount,
    totalBorrowedAmount,
    ethAllocations,
    ethAmount,
  } = usePortfolioStore()

  // Get live APY data
  const { stablecoinProducts } = useLiveProducts()

  const totalWeight = stablecoinAllocations.reduce((sum, a) => a.selected ? sum + a.weight : sum, 0)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  // Calculate total stablecoin amount
  const totalStablecoinUsd = stablecoinAmount()
  const borrowedTotal = totalBorrowedAmount()

  const handleWeightChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0

    // Calculate sum of other allocations (excluding current product)
    const otherAllocationsSum = stablecoinAllocations.reduce((sum, a) => {
      if (a.productId !== productId && a.selected) {
        return sum + a.weight
      }
      return sum
    }, 0)

    // Max allowed is 100% minus other allocations
    const maxAllowed = 100 - otherAllocationsSum
    const clampedValue = Math.min(maxAllowed, Math.max(0, numValue))

    updateStablecoinAllocationWeight(productId, clampedValue)
  }

  // Calculate leveraged amounts per product from ETH leverage configs
  const getLeveragedDeployments = () => {
    const deployments: { productId: string; productName: string; protocol: string; amount: number; apy: number }[] = []

    ethAllocations.forEach((allocation) => {
      if (allocation.leverage?.enabled && allocation.leverage.deployTargetId) {
        const positionValue = ethAmount() * (allocation.weight / 100)
        const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
        const borrowed = collateralValue * (allocation.leverage.ltv / 100)

        const product = stablecoinProducts.find(p => p.id === allocation.leverage?.deployTargetId)
        if (product && borrowed > 0) {
          // Check if we already have this product
          const existing = deployments.find(d => d.productId === product.id)
          if (existing) {
            existing.amount += borrowed
          } else {
            deployments.push({
              productId: product.id,
              productName: product.name,
              protocol: product.protocol,
              amount: borrowed,
              apy: product.apy,
            })
          }
        }
      }
    })

    return deployments
  }

  const leveragedDeployments = getLeveragedDeployments()
  const hasLeveragedFunds = borrowedTotal > 0

  const handleReset = () => {
    setStablecoinAllocations(
      stablecoinAllocations.map((a) => ({
        ...a,
        selected: false,
        weight: 0,
      }))
    )
  }

  const hasSelectedItems = stablecoinAllocations.some((a) => a.selected)

  return (
    <div className="space-y-2">
      {/* Card 1: Base Allocation */}
      <div className="border border-border rounded-md bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-xs font-medium text-foreground">Stablecoin Products</h3>
          {hasSelectedItems && (
            <button
              onClick={handleReset}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Summary bar */}
        <div className="px-3 py-2 border-b border-border flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatUsd(totalStablecoinUsd)}</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${totalWeight}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right">{totalWeight}%</span>
          </div>
        </div>

        {/* Product Table */}
        <div className="text-xs">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left font-normal py-2 px-3 w-1/3">Product</th>
                <th className="text-right font-normal py-2 px-3 w-1/3">APY</th>
                <th className="text-right font-normal py-2 px-3 w-1/3">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stablecoinProducts.map((product) => {
                const allocation = stablecoinAllocations.find((a) => a.productId === product.id)
                const weight = allocation?.weight ?? 0
                const isSelected = allocation?.selected ?? false

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-muted/30' : 'opacity-50'
                    }`}
                  >
                    {/* Product (with checkbox) */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStablecoinAllocation(product.id)}
                          className="w-4 h-4 text-foreground border-border rounded focus:ring-1 focus:ring-ring cursor-pointer"
                        />
                        <DualLogo
                          tokenSrc={getTokenLogo(product.name)}
                          protocolSrc={getProtocolLogo(product.protocol)}
                          tokenAlt={product.name}
                          protocolAlt={product.protocol}
                          size={24}
                        />
                        <div>
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-[10px] text-muted-foreground">{product.protocol}</div>
                        </div>
                      </div>
                    </td>

                    {/* APY */}
                    <td className="text-right py-2.5 px-3 text-muted-foreground">
                      {product.apy.toFixed(2)}%
                    </td>

                    {/* Weight */}
                    <td className="text-right py-2.5 px-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <input
                          type="number"
                          value={isSelected ? (weight || '') : ''}
                          onChange={(e) => handleWeightChange(product.id, e.target.value)}
                          placeholder="—"
                          disabled={!isSelected}
                          className="w-12 px-2 py-1 text-xs text-center font-medium text-foreground bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] text-muted-foreground">%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 2: Leveraged Funds (only if leverage active) */}
      {hasLeveragedFunds && (
        <div className="border border-border rounded-md bg-card">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-xs font-medium text-foreground">Leveraged Funds</h3>
          </div>

          {/* Deployed funds table */}
          <div className="text-xs">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-normal py-2 px-3 w-1/3">Product</th>
                  <th className="text-right font-normal py-2 px-3 w-1/3">Amount</th>
                  <th className="text-right font-normal py-2 px-3 w-1/3">APY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leveragedDeployments.map((deployment) => (
                  <tr key={deployment.productId}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <DualLogo
                          tokenSrc={getTokenLogo(deployment.productName)}
                          protocolSrc={getProtocolLogo(deployment.protocol)}
                          tokenAlt={deployment.productName}
                          protocolAlt={deployment.protocol}
                          size={24}
                        />
                        <div>
                          <div className="font-medium text-foreground">{deployment.productName}</div>
                          <div className="text-[10px] text-muted-foreground">{deployment.protocol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-3 text-foreground font-medium">
                      {formatUsd(deployment.amount)}
                    </td>
                    <td className="text-right py-2.5 px-3 text-muted-foreground">
                      {deployment.apy.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-muted/30">
                  <td className="py-2 px-3 text-muted-foreground">Total Borrowed</td>
                  <td className="text-right py-2 px-3 text-foreground font-medium">{formatUsd(borrowedTotal)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
