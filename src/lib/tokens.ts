// Token Registry
// Part of P0: Virtual Wallet UI

import type { Token } from '@/types/strategy'

export const TOKENS: Record<string, Token> = {
  // ============================================
  // NATIVE
  // ============================================
  eth: {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'native',
    decimals: 18,
  },

  // ============================================
  // LIQUID STAKING TOKENS (LST)
  // ============================================
  steth: {
    id: 'steth',
    symbol: 'stETH',
    name: 'Lido Staked ETH',
    category: 'lst',
    decimals: 18,
    apy: 2.65,
    apySource: 'defillama',
    poolId: '747c1d2a-c668-4682-b9f9-296708a3dd90',
  },
  wsteth: {
    id: 'wsteth',
    symbol: 'wstETH',
    name: 'Wrapped stETH',
    category: 'lst',
    decimals: 18,
    apy: 2.65, // Same as stETH
    apySource: 'defillama',
    poolId: '747c1d2a-c668-4682-b9f9-296708a3dd90',
    collateralParams: {
      maxLtv: 80,
      liquidationThreshold: 82.5,
    },
  },
  weeth: {
    id: 'weeth',
    symbol: 'weETH',
    name: 'Wrapped eETH',
    category: 'lst',
    decimals: 18,
    apy: 3.17,
    apySource: 'defillama',
    poolId: '46bd2bdf-6d92-4066-b482-e885ee172264',
    collateralParams: {
      maxLtv: 75,
      liquidationThreshold: 78,
    },
  },

  // ============================================
  // STABLECOINS
  // ============================================
  usdc: {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    category: 'stablecoin',
    decimals: 6,
  },
  usdt: {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    category: 'stablecoin',
    decimals: 6,
  },
  usde: {
    id: 'usde',
    symbol: 'USDe',
    name: 'Ethena USDe',
    category: 'stablecoin',
    decimals: 18,
  },
  usds: {
    id: 'usds',
    symbol: 'USDS',
    name: 'Sky Dollar',
    category: 'stablecoin',
    decimals: 18,
  },

  // ============================================
  // YIELD TOKENS (actual receipt tokens)
  // ============================================
  susde: {
    id: 'susde',
    symbol: 'sUSDe',
    name: 'Staked USDe',
    category: 'yield',
    decimals: 18,
  },
  syrupusdc: {
    id: 'syrupusdc',
    symbol: 'syrupUSDC',
    name: 'Maple Syrup USDC',
    category: 'yield',
    decimals: 6,
  },
}

// Helper functions
export function getToken(id: string): Token | undefined {
  return TOKENS[id]
}

export function getTokensByCategory(category: Token['category']): Token[] {
  return Object.values(TOKENS).filter((t) => t.category === category)
}

export function getCollateralTokens(): Token[] {
  return Object.values(TOKENS).filter((t) => t.collateralParams !== undefined)
}
