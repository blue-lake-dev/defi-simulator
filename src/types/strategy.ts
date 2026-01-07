// Strategy & Virtual Wallet Type Definitions
// Part of P0: Virtual Wallet UI

// ============================================
// TOKEN DEFINITIONS (merged with Product concept)
// ============================================

export type TokenCategory = 'native' | 'lst' | 'stablecoin' | 'yield'

export interface Token {
  id: string
  symbol: string
  name: string
  category: TokenCategory
  decimals: number
  // Yield-bearing tokens
  apy?: number
  apySource?: 'defillama' | 'manual'
  poolId?: string // DeFiLlama pool UUID
  // PT tokens
  maturity?: string // ISO date
  underlyingTokenId?: string
  // Collateral eligibility (for lending)
  collateralParams?: {
    maxLtv: number
    liquidationThreshold: number
  }
}

// ============================================
// POSITION TYPES (Discriminated Union)
// ============================================

// Base position fields shared by all
interface BasePosition {
  id: string
  createdAt: number
}

// --- LENDING (Aave, Morpho, future: Compound, Spark) ---
export interface LendingPosition extends BasePosition {
  type: 'lending'
  protocol: 'aave-v3' | 'morpho'
  collateral: { tokenId: string; amount: number }[]
  borrows: { tokenId: string; amount: number; borrowRate: number }[]
  // Morpho-specific (required when protocol === 'morpho')
  marketId?: string
  lltv?: number
}

// --- STAKING (Lido, Ether.fi) ---
export interface StakePosition extends BasePosition {
  type: 'stake'
  protocol: 'lido' | 'etherfi'
  inputTokenId: string // ETH
  outputTokenId: string // stETH, weETH
  amount: number // Amount of output token held
  apy: number
}

// --- YIELD (Ethena, Maple) ---
export interface YieldPosition extends BasePosition {
  type: 'yield'
  protocol: 'ethena' | 'maple'
  inputTokenId: string // USDC, USDe
  outputTokenId: string // sUSDe, syrupUSDC
  amount: number
  apy: number
}

// --- PENDLE PT (Fixed yield, maturity) ---
export interface PendlePosition extends BasePosition {
  type: 'pendle'
  protocol: 'pendle'
  ptTokenId: string // PT-wstETH, PT-sUSDe, etc.
  underlyingTokenId: string
  amount: number
  maturity: string // ISO date
  impliedApy: number // Fixed yield locked at purchase
  purchasePrice: number // Price paid (discount to face value)
}

// --- PERP (Hyperliquid, future: GMX, dYdX) ---
// Supports long/short for any asset - enables delta-neutral strategies
export interface PerpPosition extends BasePosition {
  type: 'perp'
  protocol: 'hyperliquid' // Extensible: 'gmx' | 'dydx' | 'vertex'
  asset: string // ETH, BTC, SOL, etc.
  direction: 'long' | 'short'
  marginTokenId: string // USDC
  marginAmount: number
  positionSize: number // Notional size in USD
  leverage: number
  entryPrice: number
  fundingRate: number // Hourly funding rate
}

// Discriminated union of all positions
export type Position =
  | LendingPosition
  | StakePosition
  | YieldPosition
  | PendlePosition
  | PerpPosition

// ============================================
// WALLET
// ============================================

export interface TokenBalance {
  tokenId: string
  amount: number
}

export interface Wallet {
  id: string
  name: string
  balances: TokenBalance[]
  positions: Position[]
}

// ============================================
// STRATEGY
// ============================================

export interface Strategy {
  id: string
  name: string
  createdAt: number // Immutable - when strategy was created
  updatedAt: number
  wallet: Wallet
  // Simulation parameters
  initialInvestmentUsd: number
  ethPriceAtCreation: number // Editable - reference price for P&L calculations
}
