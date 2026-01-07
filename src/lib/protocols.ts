// Protocol Definitions
// Part of P0: Virtual Wallet UI

export type ProtocolCategory = 'lending' | 'staking' | 'yield' | 'pendle' | 'perp'

// Pool/Vault/Market definition
export interface Pool {
  id: string
  name: string
  inputToken: string // Token you deposit
  outputToken?: string // Receipt token (if applicable)
  apy: number // Fallback APY
  poolId?: string // DeFiLlama UUID for live APY
  // Pendle-specific
  underlyingToken?: string
  maturity?: string // ISO date
  // Morpho market-specific
  lltv?: number
}

export interface Protocol {
  id: string
  name: string
  category: ProtocolCategory
  description: string
  // For lending: collateral tokens accepted
  // For others: input tokens for deposit
  supportedTokens: string[]
  pools?: Pool[]
  // Lending-specific
  borrowableAssets?: string[]
  borrowRates?: Record<string, number> // tokenId -> rate (fallback)
}

export const PROTOCOLS: Record<string, Protocol> = {
  // ============================================
  // LENDING
  // ============================================
  'aave-v3': {
    id: 'aave-v3',
    name: 'Aave V3',
    category: 'lending',
    description: 'Multi-collateral lending protocol',
    supportedTokens: ['wsteth', 'weeth'], // Collateral tokens
    borrowableAssets: ['usdc', 'usdt', 'usds'],
    borrowRates: {
      usdc: 4.7,
      usdt: 5.2,
      usds: 4.0,
    },
  },
  morpho: {
    id: 'morpho',
    name: 'Morpho Blue',
    category: 'lending',
    description: 'Isolated lending markets',
    supportedTokens: ['wsteth', 'weeth'], // Collateral tokens
    borrowableAssets: ['usdc'],
    borrowRates: {
      usdc: 4.5,
    },
    // Morpho has isolated markets (1 collateral : 1 borrow)
    pools: [
      { id: 'morpho-wsteth-usdc', name: 'wstETH/USDC', inputToken: 'wsteth', apy: 0, lltv: 86 },
      { id: 'morpho-weeth-usdc', name: 'weETH/USDC', inputToken: 'weeth', apy: 0, lltv: 86 },
    ],
  },

  // ============================================
  // STAKING
  // ============================================
  lido: {
    id: 'lido',
    name: 'Lido',
    category: 'staking',
    description: 'Liquid staking for ETH',
    supportedTokens: ['eth'],
    pools: [
      {
        id: 'lido-steth',
        name: 'stETH',
        inputToken: 'eth',
        outputToken: 'steth',
        apy: 2.65,
        poolId: '747c1d2a-c668-4682-b9f9-296708a3dd90',
      },
    ],
  },
  etherfi: {
    id: 'etherfi',
    name: 'Ether.fi',
    category: 'staking',
    description: 'Decentralized staking with restaking',
    supportedTokens: ['eth'],
    pools: [
      {
        id: 'etherfi-weeth',
        name: 'weETH',
        inputToken: 'eth',
        outputToken: 'weeth',
        apy: 3.17,
        poolId: '46bd2bdf-6d92-4066-b482-e885ee172264',
      },
    ],
  },

  // ============================================
  // YIELD VAULTS
  // ============================================
  'morpho-vaults': {
    id: 'morpho-vaults',
    name: 'Morpho Vaults',
    category: 'yield',
    description: 'Curated yield vaults on Morpho',
    supportedTokens: ['usdc'],
    pools: [
      { id: 'steakusdc', name: 'steakUSDC', inputToken: 'usdc', apy: 4.0 },
      { id: 'gtusdc', name: 'GTUSDC', inputToken: 'usdc', apy: 4.4 },
      { id: 'bbqusdc', name: 'BBQUSDC', inputToken: 'usdc', apy: 7.2 },
    ],
  },
  ethena: {
    id: 'ethena',
    name: 'Ethena',
    category: 'yield',
    description: 'Synthetic dollar protocol',
    supportedTokens: ['usde'],
    pools: [
      {
        id: 'ethena-susde',
        name: 'sUSDe',
        inputToken: 'usde',
        outputToken: 'susde',
        apy: 4.9,
        poolId: '66985a81-9c51-46ca-9977-42b4fe7bc6df',
      },
    ],
  },
  maple: {
    id: 'maple',
    name: 'Maple Finance',
    category: 'yield',
    description: 'Institutional lending',
    supportedTokens: ['usdc'],
    pools: [
      {
        id: 'maple-syrupusdc',
        name: 'Syrup USDC',
        inputToken: 'usdc',
        outputToken: 'syrupusdc',
        apy: 6.8,
        poolId: '43641cf5-a92e-416b-bce9-27113d3c0db6',
      },
    ],
  },

  // ============================================
  // PENDLE
  // ============================================
  pendle: {
    id: 'pendle',
    name: 'Pendle',
    category: 'pendle',
    description: 'Yield tokenization and trading',
    supportedTokens: ['wsteth', 'weeth', 'susde', 'syrupusdc'],
    pools: [
      { id: 'pt-wsteth', name: 'PT-wstETH', inputToken: 'wsteth', underlyingToken: 'wsteth', apy: 2.9 },
      { id: 'pt-weeth', name: 'PT-weETH', inputToken: 'weeth', underlyingToken: 'weeth', apy: 2.7 },
      { id: 'pt-susde', name: 'PT-sUSDe', inputToken: 'susde', underlyingToken: 'susde', apy: 5.9 },
      { id: 'pt-syrupusdc', name: 'PT-syrupUSDC', inputToken: 'syrupusdc', underlyingToken: 'syrupusdc', apy: 6.5 },
    ],
  },

  // ============================================
  // PERPETUALS
  // ============================================
  hyperliquid: {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    category: 'perp',
    description: 'Perpetual futures DEX',
    supportedTokens: ['usdc'], // Margin token
  },
}

// Helper functions
export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS[id]
}

export function getProtocolsByCategory(category: ProtocolCategory): Protocol[] {
  return Object.values(PROTOCOLS).filter((p) => p.category === category)
}

export function getLendingProtocols(): Protocol[] {
  return getProtocolsByCategory('lending')
}

export function getPool(protocolId: string, poolId: string): Pool | undefined {
  const protocol = PROTOCOLS[protocolId]
  return protocol?.pools?.find((p) => p.id === poolId)
}

export function getBorrowRate(protocolId: string, tokenId: string): number {
  const protocol = PROTOCOLS[protocolId]
  return protocol?.borrowRates?.[tokenId] ?? 5.0 // Default fallback
}
