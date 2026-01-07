import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type { Strategy, Wallet, Position, TokenBalance } from '@/types/strategy'
import { TOKENS } from '@/lib/tokens'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Create empty wallet
const createEmptyWallet = (): Wallet => ({
  id: generateId(),
  name: 'Main Wallet',
  balances: [],
  positions: [],
})

interface StrategyStore {
  // State
  currentStrategy: Strategy | null
  ethPrice: number

  // Computed
  totalWalletValueUsd: () => number
  totalPositionValueUsd: () => number
  getBalance: (tokenId: string) => number

  // Actions - Strategy
  createStrategy: (name: string, initialInvestmentUsd: number, ethPrice: number) => void
  updateStrategy: (updates: Partial<Pick<Strategy, 'name' | 'ethPriceAtCreation'>>) => void
  clearStrategy: () => void

  // Actions - ETH Price
  setEthPrice: (price: number) => void

  // Actions - Wallet Balances
  setBalance: (tokenId: string, amount: number) => void
  addBalance: (tokenId: string, amount: number) => void
  subtractBalance: (tokenId: string, amount: number) => boolean

  // Actions - Positions
  addPosition: (position: Omit<Position, 'id' | 'createdAt'>) => string
  updatePosition: (id: string, updates: Partial<Position>) => void
  removePosition: (id: string) => void
}

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStrategy: null,
      ethPrice: 3500,

      // Computed - Total wallet value in USD
      totalWalletValueUsd: () => {
        const { currentStrategy, ethPrice } = get()
        if (!currentStrategy) return 0

        return currentStrategy.wallet.balances.reduce((total, balance) => {
          const token = TOKENS[balance.tokenId]
          if (!token) return total

          // Price based on token category
          if (token.category === 'native' || token.category === 'lst') {
            return total + balance.amount * ethPrice
          }
          // Stablecoins and yield tokens are ~$1
          return total + balance.amount
        }, 0)
      },

      // Computed - Total position value (simplified for now)
      totalPositionValueUsd: () => {
        const { currentStrategy, ethPrice } = get()
        if (!currentStrategy) return 0

        return currentStrategy.wallet.positions.reduce((total, position) => {
          switch (position.type) {
            case 'stake': {
              const token = TOKENS[position.outputTokenId]
              if (token?.category === 'lst') {
                return total + position.amount * ethPrice
              }
              return total + position.amount
            }
            case 'yield':
              return total + position.amount
            case 'lending':
              // Collateral value minus borrows
              return total // TODO: implement proper calculation
            case 'pendle':
              return total + position.amount * position.purchasePrice
            case 'perp':
              return total + position.marginAmount
            default:
              return total
          }
        }, 0)
      },

      // Get balance for a specific token
      getBalance: (tokenId: string) => {
        const { currentStrategy } = get()
        if (!currentStrategy) return 0
        const balance = currentStrategy.wallet.balances.find((b) => b.tokenId === tokenId)
        return balance?.amount ?? 0
      },

      // Actions - Strategy
      createStrategy: (name, initialInvestmentUsd, ethPrice) => {
        const now = Date.now()
        const wallet = createEmptyWallet()

        // Initialize with USDC balance equal to investment
        wallet.balances.push({
          tokenId: 'usdc',
          amount: initialInvestmentUsd,
        })

        set({
          currentStrategy: {
            id: generateId(),
            name,
            createdAt: now,
            updatedAt: now,
            wallet,
            initialInvestmentUsd,
            ethPriceAtCreation: ethPrice,
          },
          ethPrice,
        })
      },

      updateStrategy: (updates) =>
        set((state) => {
          if (!state.currentStrategy) return state
          return {
            currentStrategy: {
              ...state.currentStrategy,
              ...updates,
              updatedAt: Date.now(),
            },
          }
        }),

      clearStrategy: () => set({ currentStrategy: null }),

      // Actions - ETH Price
      setEthPrice: (price) => set({ ethPrice: price }),

      // Actions - Wallet Balances
      setBalance: (tokenId, amount) =>
        set((state) => {
          if (!state.currentStrategy) return state

          const balances = [...state.currentStrategy.wallet.balances]
          const existingIndex = balances.findIndex((b) => b.tokenId === tokenId)

          if (amount <= 0) {
            // Remove balance if zero or negative
            if (existingIndex >= 0) {
              balances.splice(existingIndex, 1)
            }
          } else if (existingIndex >= 0) {
            balances[existingIndex] = { tokenId, amount }
          } else {
            balances.push({ tokenId, amount })
          }

          return {
            currentStrategy: {
              ...state.currentStrategy,
              updatedAt: Date.now(),
              wallet: {
                ...state.currentStrategy.wallet,
                balances,
              },
            },
          }
        }),

      addBalance: (tokenId, amount) => {
        const current = get().getBalance(tokenId)
        get().setBalance(tokenId, current + amount)
      },

      subtractBalance: (tokenId, amount) => {
        const current = get().getBalance(tokenId)
        if (current < amount) return false
        get().setBalance(tokenId, current - amount)
        return true
      },

      // Actions - Positions
      addPosition: (positionData) => {
        const id = generateId()
        const position = {
          ...positionData,
          id,
          createdAt: Date.now(),
        } as Position

        set((state) => {
          if (!state.currentStrategy) return state
          return {
            currentStrategy: {
              ...state.currentStrategy,
              updatedAt: Date.now(),
              wallet: {
                ...state.currentStrategy.wallet,
                positions: [...state.currentStrategy.wallet.positions, position],
              },
            },
          }
        })

        return id
      },

      updatePosition: (id, updates) =>
        set((state) => {
          if (!state.currentStrategy) return state
          return {
            currentStrategy: {
              ...state.currentStrategy,
              updatedAt: Date.now(),
              wallet: {
                ...state.currentStrategy.wallet,
                positions: state.currentStrategy.wallet.positions.map((p) =>
                  p.id === id ? { ...p, ...updates } : p
                ),
              },
            },
          }
        }),

      removePosition: (id) =>
        set((state) => {
          if (!state.currentStrategy) return state
          return {
            currentStrategy: {
              ...state.currentStrategy,
              updatedAt: Date.now(),
              wallet: {
                ...state.currentStrategy.wallet,
                positions: state.currentStrategy.wallet.positions.filter((p) => p.id !== id),
              },
            },
          }
        }),
    }),
    {
      name: 'strategy-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStrategy: state.currentStrategy,
        ethPrice: state.ethPrice,
      }),
    }
  )
)

// Hook to check if the store has been hydrated from sessionStorage
export const useStrategyHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsubFinishHydration = useStrategyStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    if (useStrategyStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return () => {
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
