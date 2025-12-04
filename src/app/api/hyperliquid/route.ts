import { NextResponse } from 'next/server'

// Hyperliquid API endpoint
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info'

interface HyperliquidAssetCtx {
  funding: string
  openInterest: string
  prevDayPx: string
  dayNtlVlm: string
  premium: string
  oraclePx: string
  markPx: string
  midPx: string
  impactPxs: [string, string]
  dayBaseVlm: string
}

interface HyperliquidAsset {
  szDecimals: number
  name: string
  maxLeverage: number
  marginTableId: number
}

interface HyperliquidResponse {
  universe: HyperliquidAsset[]
}

export interface HyperliquidApiResponse {
  success: boolean
  data?: {
    fundingRate: number // Annualized funding rate
    hourlyRate: number // Raw hourly rate
    markPrice: number
    oraclePrice: number
    maxLeverage: number
    openInterest: number
  }
  error?: string
}

export async function GET() {
  try {
    const response = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`)
    }

    const data = await response.json()

    // Find ETH in the response
    const meta = data[0] as HyperliquidResponse
    const contexts = data[1] as HyperliquidAssetCtx[]

    const ethIndex = meta.universe.findIndex((asset: HyperliquidAsset) => asset.name === 'ETH')

    if (ethIndex === -1) {
      throw new Error('ETH not found in Hyperliquid response')
    }

    const ethAsset = meta.universe[ethIndex]
    const ethCtx = contexts[ethIndex]

    // Convert hourly funding rate to annualized
    // Funding is paid hourly at 1/8 of the 8-hour rate
    const hourlyRate = parseFloat(ethCtx.funding)
    const annualizedRate = hourlyRate * 24 * 365 * 100 // Convert to percentage

    return NextResponse.json({
      success: true,
      data: {
        fundingRate: annualizedRate,
        hourlyRate: hourlyRate * 100, // Convert to percentage
        markPrice: parseFloat(ethCtx.markPx),
        oraclePrice: parseFloat(ethCtx.oraclePx),
        maxLeverage: ethAsset.maxLeverage,
        openInterest: parseFloat(ethCtx.openInterest),
      },
    } as HyperliquidApiResponse)
  } catch (error) {
    console.error('Hyperliquid API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Hyperliquid data',
      } as HyperliquidApiResponse,
      { status: 500 }
    )
  }
}
