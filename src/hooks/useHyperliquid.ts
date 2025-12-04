'use client'

import { useState, useEffect, useCallback } from 'react'

interface HyperliquidData {
  fundingRate: number // Annualized funding rate (percentage)
  hourlyRate: number // Raw hourly rate (percentage)
  markPrice: number
  oraclePrice: number
  maxLeverage: number
  openInterest: number
}

interface UseHyperliquidReturn {
  data: HyperliquidData | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  refresh: () => Promise<void>
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// In-memory cache for SSR safety
let cachedData: HyperliquidData | null = null
let cacheTimestamp: number | null = null

export function useHyperliquid(): UseHyperliquidReturn {
  const [data, setData] = useState<HyperliquidData | null>(cachedData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(cacheTimestamp)

  const isCacheValid = useCallback(() => {
    if (!cacheTimestamp) return false
    return Date.now() - cacheTimestamp < CACHE_DURATION
  }, [])

  const fetchData = useCallback(async () => {
    // Don't fetch if cache is valid
    if (isCacheValid() && cachedData) {
      setData(cachedData)
      setLastUpdated(cacheTimestamp)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperliquid')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch Hyperliquid data')
      }

      // Update cache
      cachedData = result.data
      cacheTimestamp = Date.now()

      setData(result.data)
      setLastUpdated(cacheTimestamp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Keep stale data if available
    } finally {
      setIsLoading(false)
    }
  }, [isCacheValid])

  const refresh = useCallback(async () => {
    // Force refresh by invalidating cache
    cacheTimestamp = null
    await fetchData()
  }, [fetchData])

  // Fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, CACHE_DURATION)

    return () => clearInterval(interval)
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  }
}

// Fallback funding rate if API fails (typical rate around 8% annualized)
export const FALLBACK_FUNDING_RATE = 8.0
