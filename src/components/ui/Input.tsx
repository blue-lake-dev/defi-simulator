'use client'

import { ChangeEvent, useState, useEffect } from 'react'

interface InputProps {
  label?: string
  value: number | string
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
}

export function Input({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  placeholder,
  className = '',
}: InputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '')
    const numValue = parseFloat(rawValue)

    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) return
      if (max !== undefined && numValue > max) return
      onChange(numValue)
    } else if (rawValue === '' || rawValue === '-') {
      onChange(0)
    }
  }

  const formatDisplayValue = (val: number | string): string => {
    if (typeof val === 'string') return val
    if (val === 0) return ''
    // Format with commas for large numbers
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      )}
      <div className="flex items-center">
        {prefix && (
          <span className="text-gray-900 text-lg font-medium mr-2">{prefix}</span>
        )}
        <input
          type="text"
          value={formatDisplayValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          step={step}
          className="w-full px-3 py-2.5 text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-colors"
        />
        {suffix && (
          <span className="text-gray-500 text-sm ml-2">{suffix}</span>
        )}
      </div>
    </div>
  )
}

// Compact version for smaller inputs (like period)
interface CompactInputProps {
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  max?: number
  step?: number
  width?: string
}

export function CompactInput({
  value,
  onChange,
  suffix,
  min,
  max,
  step = 0.5,
  width = 'w-16',
}: CompactInputProps) {
  const [localValue, setLocalValue] = useState<string>(value.toString())

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value.toString())
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setLocalValue(inputValue)

    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) return
      if (max !== undefined && numValue > max) return
      onChange(numValue)
    }
  }

  const handleBlur = () => {
    // On blur, if empty or invalid, reset to current value
    const numValue = parseFloat(localValue)
    if (isNaN(numValue) || localValue === '') {
      setLocalValue(value.toString())
    } else {
      // Clamp to min/max
      let clamped = numValue
      if (min !== undefined && clamped < min) clamped = min
      if (max !== undefined && clamped > max) clamped = max
      setLocalValue(clamped.toString())
      onChange(clamped)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${width} px-2 py-2 text-center text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-colors`}
      />
      {suffix && (
        <span className="text-gray-500 text-sm">{suffix}</span>
      )}
    </div>
  )
}
