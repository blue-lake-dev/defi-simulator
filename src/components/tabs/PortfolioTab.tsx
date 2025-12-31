'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLiveProducts, useLiveBorrowRate } from '@/hooks/useLiveApys'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'
import { COLLATERAL_PARAMS } from '@/lib/constants'
import { ThreeSegmentSlider } from '@/components/ui/Slider'
import { CompactSummary } from '@/components/widgets/CompactSummary'
import { ReturnBreakdown } from '@/components/widgets/ReturnBreakdown'
import { PositionTable } from '@/components/widgets/PositionTable'

type TabId = 'overview' | 'eth' | 'stablecoin' | 'hedge' | 'backtest'

interface PortfolioTabProps {
  onNavigate?: (tab: TabId) => void
}

export function PortfolioTab({ onNavigate }: PortfolioTabProps) {
  const {
    investmentAmount,
    investmentPeriod,
    ethRatio,
    ethPrice,
    priceChangeScenario,
    hedgeConfig,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
    setInvestmentAmount,
    setEthRatio,
    setHedgeConfig,
    setEthPrice,
    setPriceChangeScenario,
  } = usePortfolioStore()

  const { ethProducts, stablecoinProducts } = useLiveProducts()
  const { data: hlData } = useHyperliquid()

  // Get borrow rates for leverage calculations
  const usdcBorrowRate = useLiveBorrowRate('USDC')
  const usdeBorrowRate = useLiveBorrowRate('USDe')

  const fundingRate = hlData?.fundingRate ?? FALLBACK_FUNDING_RATE

  // Local state for formatted inputs
  const [localAmount, setLocalAmount] = useState(investmentAmount.toLocaleString())
  const [localEthPrice, setLocalEthPrice] = useState(ethPrice.toLocaleString())
  const [localScenario, setLocalScenario] = useState(
    priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`
  )
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  // Sync local state with store
  useEffect(() => {
    setLocalAmount(investmentAmount.toLocaleString())
  }, [investmentAmount])

  useEffect(() => {
    setLocalEthPrice(ethPrice.toLocaleString())
  }, [ethPrice])

  useEffect(() => {
    setLocalScenario(priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`)
  }, [priceChangeScenario])

  // Input handlers
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    setLocalAmount(e.target.value)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0) setInvestmentAmount(num)
  }

  const handleAmountBlur = () => {
    const raw = localAmount.replace(/,/g, '')
    const num = parseFloat(raw)
    if (isNaN(num) || num < 0) {
      setLocalAmount(investmentAmount.toLocaleString())
    } else {
      setLocalAmount(num.toLocaleString())
      setInvestmentAmount(num)
    }
  }

  const handleEthPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    setLocalEthPrice(e.target.value)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0) setEthPrice(num)
  }

  const handleEthPriceBlur = () => {
    const raw = localEthPrice.replace(/,/g, '')
    const num = parseFloat(raw)
    if (isNaN(num) || num < 0) {
      setLocalEthPrice(ethPrice.toLocaleString())
    } else {
      setLocalEthPrice(num.toLocaleString())
      setEthPrice(num)
    }
  }

  const handleScenarioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalScenario(e.target.value)
    const num = parseFloat(e.target.value.replace('+', ''))
    if (!isNaN(num)) setPriceChangeScenario(num)
  }

  const handleScenarioBlur = () => {
    const num = parseFloat(localScenario.replace('+', ''))
    if (isNaN(num)) {
      setLocalScenario(priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`)
    } else {
      setLocalScenario(num >= 0 ? `+${num}` : `${num}`)
      setPriceChangeScenario(num)
    }
  }

  const fetchLivePrice = async () => {
    setIsLoadingPrice(true)
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )
      if (!response.ok) throw new Error('API request failed')
      const data = await response.json()
      if (data.ethereum?.usd) setEthPrice(data.ethereum.usd)
    } catch (err) {
      console.error('Failed to fetch ETH price:', err)
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const handleEthChange = (newEthPercent: number) => {
    setEthRatio(newEthPercent)
  }

  const handleHedgeChange = (newHedgePercent: number) => {
    setHedgeConfig({
      ...hedgeConfig,
      enabled: newHedgePercent > 0,
      allocationPercent: newHedgePercent,
    })
  }

  // ============ EMPTY STATE CHECKS ============
  const hasEthSelected = ethAllocations.some(a => a.selected && a.weight > 0)
  const hasStablecoinSelected = stablecoinAllocations.some(a => a.selected && a.weight > 0)

  // ============ CALCULATIONS ============

  // Base amounts
  const ethTotal = ethAmount()
  const stableTotal = stablecoinAmount()
  const borrowedTotal = totalBorrowedAmount()

  // Hedge amounts
  const hedgeAllocationPercent = hedgeConfig.allocationPercent
  const hedgeAmount = investmentAmount * (hedgeAllocationPercent / 100)
  const fundAllocation = hedgeConfig.fundAllocation ?? 80
  const deployedHedgeAmount = hedgeAmount * (fundAllocation / 100)
  const hedgeLeverage = hedgeConfig.leverage
  const hedgePositionSize = deployedHedgeAmount * hedgeLeverage

  // ETH in base currency
  const ethInEth = ethTotal / ethPrice

  // Calculate ETH yield per product
  const ethYieldDetails = ethAllocations
    .filter(a => a.selected && a.weight > 0)
    .map(allocation => {
      const product = ethProducts.find(p => p.id === allocation.productId)
      if (!product) return null
      const positionValue = ethTotal * (allocation.weight / 100)
      const positionInEth = positionValue / ethPrice
      const yieldValue = positionValue * (product.apy / 100) * investmentPeriod
      const yieldInEth = yieldValue / ethPrice
      return {
        id: product.id,
        name: product.name,
        protocol: product.protocol,
        apy: product.apy,
        positionValue,
        positionInEth,
        yieldValue,
        yieldInEth,
        weight: allocation.weight,
      }
    })
    .filter(Boolean) as Array<{
      id: string
      name: string
      protocol: string
      apy: number
      positionValue: number
      positionInEth: number
      yieldValue: number
      yieldInEth: number
      weight: number
    }>

  // Total ETH yield
  const totalEthYield = ethYieldDetails.reduce((sum, d) => sum + d.yieldValue, 0)
  const totalEthYieldInEth = ethYieldDetails.reduce((sum, d) => sum + d.yieldInEth, 0)

  // Weighted ETH APY
  const weightedEthApy = ethYieldDetails.reduce((sum, d) => sum + (d.apy * d.weight / 100), 0)

  // ETH price impact (on principal and yield)
  const ethPriceChange = priceChangeScenario / 100
  const newEthPrice = ethPrice * (1 + ethPriceChange)
  const ethPrincipalImpact = ethTotal * ethPriceChange
  const ethYieldImpact = totalEthYield * ethPriceChange
  const ethPriceImpact = ethPrincipalImpact + ethYieldImpact

  // Calculate stablecoin yield per product (base allocation only)
  const stablecoinYieldDetails = stablecoinAllocations
    .filter(a => a.selected && a.weight > 0)
    .map(allocation => {
      const product = stablecoinProducts.find(p => p.id === allocation.productId)
      if (!product) return null
      const positionValue = stableTotal * (allocation.weight / 100)
      const yieldValue = positionValue * (product.apy / 100) * investmentPeriod
      return {
        id: product.id,
        name: product.name,
        protocol: product.protocol,
        apy: product.apy,
        positionValue,
        yieldValue,
        weight: allocation.weight,
      }
    })
    .filter(Boolean) as Array<{
      id: string
      name: string
      protocol: string
      apy: number
      positionValue: number
      yieldValue: number
      weight: number
    }>

  // Total stablecoin yield (base)
  const totalStablecoinYield = stablecoinYieldDetails.reduce((sum, d) => sum + d.yieldValue, 0)

  // Weighted stablecoin APY
  const stablecoinTotalWeight = stablecoinYieldDetails.reduce((sum, d) => sum + d.weight, 0)
  const weightedStablecoinApy = stablecoinTotalWeight > 0
    ? stablecoinYieldDetails.reduce((sum, d) => sum + (d.apy * d.weight / stablecoinTotalWeight), 0)
    : 0

  // Leverage calculations
  const leverageDetails = ethAllocations
    .filter(a => a.leverage?.enabled)
    .map(allocation => {
      const product = ethProducts.find(p => p.id === allocation.productId)
      if (!product || !allocation.leverage) return null

      const positionValue = ethTotal * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const borrowRate = allocation.leverage.borrowAsset === 'USDC' ? usdcBorrowRate : usdeBorrowRate
      const borrowCost = borrowed * (borrowRate / 100) * investmentPeriod

      const deployTarget = stablecoinProducts.find(p => p.id === allocation.leverage?.deployTargetId)
      const deployYield = deployTarget ? borrowed * (deployTarget.apy / 100) * investmentPeriod : 0

      const netYield = deployYield - borrowCost

      return {
        productName: product.name,
        productProtocol: product.protocol,
        deployTargetName: deployTarget?.name ?? 'Unknown',
        deployTargetProtocol: deployTarget?.protocol ?? '',
        borrowed,
        borrowRate,
        borrowCost,
        deployYield,
        netYield,
      }
    })
    .filter(Boolean) as Array<{
      productName: string
      productProtocol: string
      deployTargetName: string
      deployTargetProtocol: string
      borrowed: number
      borrowRate: number
      borrowCost: number
      deployYield: number
      netYield: number
    }>

  const totalLeverageYield = leverageDetails.reduce((sum, d) => sum + d.deployYield, 0)
  const totalBorrowCost = leverageDetails.reduce((sum, d) => sum + d.borrowCost, 0)
  const totalLeverageNet = totalLeverageYield - totalBorrowCost

  // Hedge calculations
  const hedgeFundingIncome = hedgePositionSize * (fundingRate / 100) * investmentPeriod
  // Hedge P&L from price change (short position profits when price drops)
  const hedgePnL = hedgePositionSize * (-ethPriceChange)
  const hedgeNetReturn = hedgeFundingIncome + hedgePnL

  // Total returns
  const totalReturn = totalEthYield + ethPriceImpact + totalStablecoinYield + totalLeverageNet + (hedgeConfig.enabled ? hedgeNetReturn : 0)
  const expectedBalance = investmentAmount + totalReturn

  // ETH balance after yield and price change
  const finalEthInEth = ethInEth + totalEthYieldInEth
  const finalEthValue = finalEthInEth * newEthPrice

  // USD portion (stablecoins + borrowed deployed)
  const finalUsdValue = stableTotal + totalStablecoinYield + borrowedTotal + totalLeverageNet

  // Portfolio APY (yield only, excluding price change)
  const yieldOnlyReturn = totalEthYield + totalStablecoinYield + totalLeverageNet + (hedgeConfig.enabled ? hedgeFundingIncome : 0)
  const portfolioApy = investmentPeriod > 0 ? (yieldOnlyReturn / investmentAmount) / investmentPeriod * 100 : 0

  // Health Factor calculation
  const calculateHealthFactor = () => {
    let totalCollateralValue = 0
    let totalBorrowValue = 0

    ethAllocations.forEach(allocation => {
      if (allocation.leverage?.enabled) {
        const positionValue = ethTotal * (allocation.weight / 100)
        const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
        const borrowed = collateralValue * (allocation.leverage.ltv / 100)

        const params = COLLATERAL_PARAMS[allocation.productId]
        const liqThreshold = params?.liquidationThreshold ?? 80

        totalCollateralValue += collateralValue * (liqThreshold / 100)
        totalBorrowValue += borrowed
      }
    })

    if (totalBorrowValue === 0) return null
    return totalCollateralValue / totalBorrowValue
  }

  const healthFactor = calculateHealthFactor()

  // Liquidation price calculation
  const calculateLiquidationPrice = () => {
    if (!healthFactor || healthFactor === null) return null

    const dropPercent = 1 - (1 / healthFactor)
    return {
      price: ethPrice * (1 - dropPercent),
      dropPercent: dropPercent * 100,
    }
  }

  const liquidationData = calculateLiquidationPrice()

  // ============ POSITION TABLE DATA ============

  // Build ETH positions with leverage info
  const ethPositionsForTable = ethYieldDetails.map(detail => {
    const allocation = ethAllocations.find(a => a.productId === detail.id)
    const leverage = allocation?.leverage

    // Calculate allocation as percentage of total portfolio
    const allocationPercent = (detail.positionValue / investmentAmount) * 100

    let leverageInfo = undefined
    if (leverage?.enabled) {
      const positionValue = ethTotal * (detail.weight / 100)
      const collateralValue = positionValue * (leverage.collateralPercent / 100)
      const borrowed = collateralValue * (leverage.ltv / 100)

      const params = COLLATERAL_PARAMS[detail.id]
      const liqThreshold = params?.liquidationThreshold ?? 80

      const hf = borrowed > 0 ? (collateralValue * (liqThreshold / 100)) / borrowed : 0
      const dropPercent = hf > 0 ? 1 - (1 / hf) : 0
      const liqPrice = ethPrice * (1 - dropPercent)

      leverageInfo = {
        ltv: leverage.ltv,
        borrowed,
        healthFactor: hf,
        liquidationPrice: liqPrice,
      }
    }

    return {
      id: detail.id,
      name: detail.name,
      protocol: detail.protocol,
      allocation: allocationPercent,
      positionValue: detail.positionValue,
      positionInEth: detail.positionInEth,
      apy: detail.apy,
      yield: detail.yieldValue,
      yieldInEth: detail.yieldInEth,
      leverage: leverageInfo,
    }
  })

  // Build stablecoin positions
  const stablecoinPositionsForTable = stablecoinYieldDetails.map(detail => {
    const allocationPercent = (detail.positionValue / investmentAmount) * 100
    return {
      id: detail.id,
      name: detail.name,
      protocol: detail.protocol,
      allocation: allocationPercent,
      positionValue: detail.positionValue,
      apy: detail.apy,
      yield: detail.yieldValue,
    }
  })

  // Build hedge position
  const hedgePositionForTable = hedgeConfig.enabled && hedgePositionSize > 0
    ? {
        allocation: hedgeAllocationPercent,
        positionSize: hedgePositionSize,
        collateral: deployedHedgeAmount,
        leverage: hedgeLeverage,
        fundingRate: fundingRate,
        fundingIncome: hedgeFundingIncome,
        hedgePnL: hedgePnL,
      }
    : null

  // ============ RENDER ============

  // Computed values for slider
  const hedgePercent = hedgeConfig.allocationPercent
  const stablePercent = 100 - ethRatio - hedgePercent
  const ethAmountCalc = investmentAmount * (ethRatio / 100)
  const stableAmountCalc = investmentAmount * (stablePercent / 100)
  const hedgeAmountCalc = investmentAmount * (hedgePercent / 100)
  const projectedPrice = ethPrice * (1 + priceChangeScenario / 100)

  // Reset handlers for individual cards
  const handlePortfolioReset = () => {
    setInvestmentAmount(1000000)
    setEthRatio(70)
    setHedgeConfig({
      enabled: false,
      allocationPercent: 0,
      fundAllocation: 80,
      leverage: 5,
    })
  }

  const handleEthPriceCardReset = () => {
    setEthPrice(3500)
    setPriceChangeScenario(0)
  }

  return (
    <div className="space-y-2">
      {/* Top row: Portfolio + ETH Price side by side */}
      <div className="flex gap-2">
        {/* Card 1: Portfolio */}
        <div className="flex-[3] border border-border rounded-md bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-xs font-medium text-foreground">Portfolio</h3>
          <button
            onClick={handlePortfolioReset}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex items-start gap-6">
          {/* Investment Input */}
          <div className="shrink-0">
            <label className="block text-[10px] text-muted-foreground mb-1">Investment</label>
            <div className="relative w-32">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <input
                type="text"
                value={localAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                className="w-full pl-5 pr-2 py-1.5 text-xs font-medium text-foreground bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Allocation Slider */}
          <div className="flex-1">
            <label className="block text-[10px] text-muted-foreground mb-1">Allocation</label>
            <ThreeSegmentSlider
              ethPercent={ethRatio}
              stablePercent={stablePercent}
              hedgePercent={hedgePercent}
              onEthChange={handleEthChange}
              onHedgeChange={handleHedgeChange}
              ethAmount={ethAmountCalc}
              stableAmount={stableAmountCalc}
              hedgeAmount={hedgeAmountCalc}
              ethPrice={ethPrice}
            />
          </div>
        </div>
        </div>

        {/* Card 2: ETH Price */}
        <div className="flex-[2] border border-border rounded-md bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-xs font-medium text-foreground">ETH Price</h3>
          <button
            onClick={handleEthPriceCardReset}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start gap-6">
            {/* Price Input */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-[10px] text-muted-foreground">Price</label>
                <button
                  onClick={fetchLivePrice}
                  disabled={isLoadingPrice}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  title="Fetch live price"
                >
                  {isLoadingPrice ? (
                    <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                <input
                  type="text"
                  value={localEthPrice}
                  onChange={handleEthPriceChange}
                  onBlur={handleEthPriceBlur}
                  className="w-24 pl-5 pr-2 py-1.5 text-xs font-medium text-foreground bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Change Input */}
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">Change</label>
              <div className="relative">
                <input
                  type="text"
                  value={localScenario}
                  onChange={handleScenarioChange}
                  onBlur={handleScenarioBlur}
                  className="w-16 pl-2 pr-5 py-1.5 text-xs font-medium text-foreground bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                ${projectedPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Empty State Toast Banners */}
      {!hasEthSelected && (
        <button
          onClick={() => onNavigate?.('eth')}
          className="w-full bg-muted border border-border rounded-md px-3 py-2 flex items-center justify-between hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-muted-foreground">
              <svg className="w-2.5 h-4" viewBox="0 0 256 417" fill="currentColor">
                <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity="0.6"/>
                <path d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                <path d="M127.961 312.187l-127.96-75.637 127.96 180.373 127.96-180.373z" fillOpacity="0.6"/>
                <path d="M0 236.55l127.962 75.637V154.158z"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">No ETH products allocated</span>
          </div>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {!hasStablecoinSelected && (
        <button
          onClick={() => onNavigate?.('stablecoin')}
          className="w-full bg-muted border border-border rounded-md px-3 py-2 flex items-center justify-between hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-muted-foreground">
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.15"/>
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
                <path d="M16.5 8v2.05c2.25.26 3.5 1.55 3.5 3.45h-2c0-1.1-.7-2-2-2-1.5 0-2 .8-2 1.5 0 .9.5 1.4 2.2 1.8 2.3.5 3.8 1.3 3.8 3.5 0 1.9-1.35 3.05-3.5 3.2V24h-1v-2.55c-2.15-.35-3.5-1.75-3.5-3.95h2c0 1.5 1 2.5 2.5 2.5 1.3 0 2-.6 2-1.5 0-.8-.4-1.4-2.2-1.8-2.5-.6-3.8-1.5-3.8-3.5 0-1.7 1.25-2.95 3.5-3.15V8h1z" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">No stablecoin products allocated</span>
          </div>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Compact Summary */}
      <CompactSummary
        expectedBalanceUsd={expectedBalance}
        expectedBalanceEth={finalEthInEth}
        totalReturn={totalReturn}
        returnPercent={(totalReturn / investmentAmount) * 100}
        ethApy={weightedEthApy}
        stablecoinApy={weightedStablecoinApy}
      />

      {/* Return Breakdown - full width */}
      <ReturnBreakdown
        ethYield={totalEthYield}
        ethYieldInEth={totalEthYieldInEth}
        priceImpactPrincipal={ethPrincipalImpact}
        priceImpactYield={ethYieldImpact}
        stablecoinYield={totalStablecoinYield}
        leverageDeployYield={totalLeverageYield}
        leverageBorrowCost={totalBorrowCost}
        hedgeReturn={hedgeConfig.enabled ? hedgeNetReturn : 0}
        totalReturn={totalReturn}
        hasLeverage={borrowedTotal > 0}
        hasHedge={hedgeConfig.enabled}
      />

      {/* Position Table */}
      <PositionTable
        ethPositions={ethPositionsForTable}
        stablecoinPositions={stablecoinPositionsForTable}
        hedgePosition={hedgePositionForTable}
      />
    </div>
  )
}
