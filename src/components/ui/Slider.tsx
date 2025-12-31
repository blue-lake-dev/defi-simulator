'use client'

import { ChangeEvent, useRef, useCallback } from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #48104a ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />
    </div>
  )
}

// Three-segment allocation slider with shadcn styling
interface ThreeSegmentSliderProps {
  ethPercent: number
  stablePercent: number
  hedgePercent: number
  onEthChange: (value: number) => void
  onHedgeChange: (value: number) => void
  ethAmount?: number
  stableAmount?: number
  hedgeAmount?: number
  ethPrice?: number
}

export function ThreeSegmentSlider({
  ethPercent,
  stablePercent,
  hedgePercent,
  onEthChange,
  onHedgeChange,
  ethAmount,
  stableAmount,
  hedgeAmount,
  ethPrice,
}: ThreeSegmentSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toFixed(0)}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 100) return `${amount.toFixed(0)} ETH`
    if (amount >= 1) return `${amount.toFixed(2)} ETH`
    return `${amount.toFixed(4)} ETH`
  }

  const getPercentFromMouseEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    return Math.round(percent)
  }, [])

  // Handle dragging the ETH/Stable divider (first handle)
  const handleEthDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newEth = getPercentFromMouseEvent(moveEvent)
      const maxEth = 100 - hedgePercent
      const clampedEth = Math.max(0, Math.min(maxEth, newEth))
      onEthChange(clampedEth)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [getPercentFromMouseEvent, hedgePercent, onEthChange])

  // Handle dragging the Stable/Hedge divider (second handle)
  const handleHedgeDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const onMouseMove = (moveEvent: MouseEvent) => {
      const pos = getPercentFromMouseEvent(moveEvent)
      const newHedge = 100 - pos
      const maxHedge = 100 - ethPercent
      const clampedHedge = Math.max(0, Math.min(maxHedge, newHedge))
      onHedgeChange(clampedHedge)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [getPercentFromMouseEvent, ethPercent, onHedgeChange])

  // Calculate ETH in base currency
  const ethInEth = ethAmount && ethPrice && ethPrice > 0 ? ethAmount / ethPrice : 0

  return (
    <div className="w-full">
      {/* Slider Track - shadcn style (thin, rounded) */}
      <div ref={trackRef} className="relative h-2 mb-4">
        {/* Background track with segments */}
        <div className="absolute inset-0 rounded-full overflow-hidden flex">
          {/* ETH segment - Dark (foreground) */}
          <div
            className="h-full bg-foreground transition-all duration-75"
            style={{ width: `${ethPercent}%` }}
          />
          {/* Stablecoin segment - Medium (muted-foreground) */}
          <div
            className="h-full bg-muted-foreground transition-all duration-75"
            style={{ width: `${stablePercent}%` }}
          />
          {/* Hedge segment - Light but visible */}
          <div
            className="h-full bg-muted-foreground/40 transition-all duration-75"
            style={{ width: `${hedgePercent}%` }}
          />
        </div>

        {/* ETH/Stable handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-foreground shadow cursor-ew-resize z-10 hover:scale-110 transition-transform"
          style={{ left: `${ethPercent}%` }}
          onMouseDown={handleEthDrag}
        />

        {/* Stable/Hedge handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-muted-foreground shadow cursor-ew-resize z-10 hover:scale-110 transition-transform"
          style={{ left: `${100 - hedgePercent}%` }}
          onMouseDown={handleHedgeDrag}
        />
      </div>

      {/* Labels below slider */}
      <div className="flex justify-between text-[10px]">
        {/* ETH label - left */}
        <div>
          <div className="font-medium text-foreground">ETH {ethPercent}%</div>
          {ethAmount !== undefined && (
            <div className="text-muted-foreground">
              {formatUsd(ethAmount)}
              {ethInEth > 0 && ` (${formatEth(ethInEth)})`}
            </div>
          )}
        </div>

        {/* Stablecoin label - center */}
        <div className="text-center">
          <div className="font-medium text-muted-foreground">Stablecoin {stablePercent}%</div>
          {stableAmount !== undefined && (
            <div className="text-muted-foreground">{formatUsd(stableAmount)}</div>
          )}
        </div>

        {/* Hedge label - right */}
        <div className="text-right">
          <div className="font-medium text-muted-foreground">Hedge {hedgePercent}%</div>
          {hedgeAmount !== undefined && (
            <div className="text-muted-foreground">{formatUsd(hedgeAmount)}</div>
          )}
        </div>
      </div>
    </div>
  )
}
