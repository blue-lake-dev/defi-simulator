'use client'

import { ChangeEvent } from 'react'

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

// Two-tone slider for ETH/Stablecoin allocation
interface AllocationSliderProps {
  value: number // ETH percentage (0-100)
  onChange: (value: number) => void
  leftLabel?: string
  rightLabel?: string
  leftAmount?: number
  rightAmount?: number
  ethPrice?: number // ETH price for converting left amount to ETH
}

export function AllocationSlider({
  value,
  onChange,
  leftLabel = 'ETH',
  rightLabel = 'Stablecoin',
  leftAmount,
  rightAmount,
  ethPrice,
}: AllocationSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
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

  // Calculate ETH amount from USD
  const ethAmount = (leftAmount && ethPrice && ethPrice > 0) ? leftAmount / ethPrice : 0

  return (
    <div className="w-full">
      {/* Slider Track */}
      <div className="relative h-2 mb-3">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-purple-900 transition-all duration-150"
            style={{ width: `${value}%` }}
          />
          <div
            className="h-full bg-gray-300 transition-all duration-150"
            style={{ width: `${100 - value}%` }}
          />
        </div>

        {/* Range input (invisible, for interaction) */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Draggable circle handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-purple-900 rounded-full shadow-md pointer-events-none transition-all duration-150"
          style={{ left: `calc(${value}% - 10px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="font-medium text-gray-900">{value}% {leftLabel}</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="font-medium text-gray-900">{100 - value}% {rightLabel}</span>
        </div>
      </div>

      {/* Amounts */}
      {(leftAmount !== undefined && rightAmount !== undefined) && (
        <div className="text-xs text-gray-500 mt-1">
          {ethPrice && ethPrice > 0 ? (
            <>
              <span className="text-purple-600 font-medium">{formatEth(ethAmount)}</span>
              <span className="text-gray-400"> ({formatUsd(leftAmount)})</span>
            </>
          ) : (
            <>{formatUsd(leftAmount)} {leftLabel}</>
          )}
          <span className="mx-1">|</span>
          {formatUsd(rightAmount)} {rightLabel}
        </div>
      )}
    </div>
  )
}
