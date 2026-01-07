# P0: Virtual Wallet UI - Implementation Plan

> **Status**: Planning
> **Created**: 2026-01-07
> **Purpose**: Reference document for Claude Code sessions

---

## 1. Overview

### Current State
The simulator uses a USD allocation-based model:
- Investment amount → ETH/Stablecoin ratio → Product weights
- Leverage limited to borrowing stablecoins only
- Cannot simulate real DeFi workflows

### Target State
A token-based virtual wallet that mirrors actual DeFi operations:
- Token balances (not USD percentages)
- Deposit/borrow/stake per protocol
- Enable complex strategies (looping, partial collateral)

### Key Use Cases to Enable

| Use Case | Description | Currently |
|----------|-------------|-----------|
| wstETH → ETH borrow | Borrow ETH against staked ETH | ❌ |
| Looping | Recursive leverage (deposit → borrow → swap → repeat) | ❌ |
| Partial collateral | Use only portion of holdings as collateral | ❌ |
| Delta-neutral | Long ETH yield + Short ETH hedge | ⚠️ Limited |

---

## 2. Architecture Decisions

### Confirmed Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Approach | **Replace** current UI entirely | Cleaner UX, no legacy confusion |
| Data Model | **Future-ready** from P0 | Avoid refactors in P1-P3 |
| Strategy:Wallet | **1:1 relationship** | Each strategy has one isolated wallet |
| Looping | **Both** manual steps + wizard | Power users + convenience |
| Starting Asset | **USD (fiat)** → swap to tokens | Familiar entry point |
| Dashboard | **Sidebar tab** | Consistent navigation |
| Wallet Tab | **Balances only** (no quick actions) | Keep P0 scope manageable |
| Protocol Scope | **Full current set** | Aave, Morpho, Lido, Ether.fi, Ethena, Maple, Pendle, Hyperliquid |

### Cross-Protocol Clarification
Each lending protocol (Aave, Morpho) is **self-contained**:
- Collateralize AND borrow within same protocol
- After borrowing, deploy funds anywhere (same protocol = looping, or different protocol)
- Cannot: collateralize in Aave → borrow from Morpho directly

---

## 3. Data Model

### Hierarchy
```
Account (future)
└── Strategy (multiple in P3, single in P0)
    ├── Wallet (1:1 with strategy)
    │   ├── initialCapitalUsd
    │   └── balances: TokenBalance[]
    └── Positions[]
        └── Per-protocol positions (deposit, borrow, stake, hedge)
```

### Core Types

```typescript
// ============ STRATEGY ============
interface Strategy {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date

  wallet: VirtualWallet
  positions: Position[]

  // P1: Will add
  // rebalancingRules?: RebalancingRule[]

  // P2: Will add
  // backtestConfig?: BacktestConfig
  // backtestResults?: BacktestResult[]
}

// ============ WALLET ============
interface VirtualWallet {
  initialCapitalUsd: number
  balances: TokenBalance[]
}

interface TokenBalance {
  tokenId: string
  amount: number          // Actual token amount (not USD)
  // USD value computed from token price
}

// ============ TOKENS ============
interface Token {
  id: string              // 'eth', 'wsteth', 'usdc', etc.
  symbol: string
  name: string
  decimals: number
  price: number           // USD price

  // Protocol capabilities
  isCollateral: boolean
  isBorrowable: boolean
  isStakeable: boolean

  // Collateral params (if applicable)
  collateralParams?: {
    protocol: string
    maxLtv: number
    liquidationThreshold: number
  }[]
}

// ============ POSITIONS ============
interface Position {
  id: string
  protocol: ProtocolId
  type: 'deposit' | 'borrow' | 'stake' | 'hedge'

  // Common
  tokenId: string
  amount: number

  // For deposits/stakes
  apy?: number
  isCollateralEnabled?: boolean

  // For borrows
  borrowRate?: number

  // For hedge (Hyperliquid)
  direction?: 'long' | 'short'
  leverage?: number
  margin?: number
  fundingRate?: number

  // Computed (per lending protocol position group)
  healthFactor?: number
  liquidationPrice?: number
}

type ProtocolId =
  | 'aave-v3'
  | 'morpho'
  | 'lido'
  | 'etherfi'
  | 'ethena'
  | 'maple'
  | 'pendle'
  | 'hyperliquid'
```

---

## 4. UI Structure

### Header Bar (Persistent)

```
┌─────────────────────────────────────────────────────────────────────┐
│ {Tab Name}                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

- Shows current tab name (Wallet, Dashboard, Aave V3, etc.)
- Persistent across all tabs
- Can add more items later (ETH price, settings, etc.)

### Sidebar Navigation

```
┌─ Sidebar ─────────────────────────────────────────┐
│ [Default Strategy ▾]  ← Dropdown (disabled in P0) │
│ ─────────────────────────────────────────────────│
│ 💰 Wallet                                         │
│ 📊 Dashboard                                      │
│ ─────────────────────────────────────────────────│
│ PROTOCOLS                                         │
│   ├─ Aave V3      ← includes Loop Wizard          │
│   ├─ Morpho       ← includes Loop Wizard          │
│   ├─ Lido                                         │
│   ├─ Ether.fi                                     │
│   ├─ Ethena                                       │
│   ├─ Maple                                        │
│   ├─ Pendle                                       │
│   └─ Hyperliquid                                  │
│ ─────────────────────────────────────────────────│
│ ⚙️ Settings                                       │
└───────────────────────────────────────────────────┘
```

### Tab Descriptions

| Tab | Purpose | Key Components |
|-----|---------|----------------|
| **Wallet** | Token balances | Balance list only (swap via protocol tabs) |
| **Dashboard** | Portfolio performance | APY, total return, health factors summary |
| **Aave V3** | Aave positions | Deposits, borrows, collateral toggles, health factor, **Loop Wizard** |
| **Morpho** | Morpho positions | Vault deposits, borrows, **Loop Wizard** |
| **Lido** | stETH staking | Stake ETH → stETH |
| **Ether.fi** | weETH staking | Stake ETH → weETH |
| **Ethena** | sUSDe yield | Deposit USDC → sUSDe |
| **Maple** | Syrup USDC | Deposit USDC → Syrup |
| **Pendle** | PT positions | PT-sUSDe, PT-syrupUSDC, etc. |
| **Hyperliquid** | ETH hedge | Short ETH with leverage |

---

## 5. Protocol Scope

### Lending Protocols

| Protocol | Actions | Collateral Assets | Borrowable Assets |
|----------|---------|-------------------|-------------------|
| **Aave V3** | Deposit, Borrow, Enable Collateral | wstETH, weETH | ETH, USDC, USDT, USDS |
| **Morpho** | Deposit to vaults | — | — |

### Staking Protocols

| Protocol | Action | Input | Output |
|----------|--------|-------|--------|
| **Lido** | Stake | ETH | stETH (wstETH) |
| **Ether.fi** | Stake | ETH | weETH |

### Yield Protocols

| Protocol | Products | Input |
|----------|----------|-------|
| **Ethena** | sUSDe | USDC/USDT |
| **Maple** | Syrup USDC, Syrup USDT | USDC/USDT |
| **Pendle** | PT-sUSDe, PT-syrupUSDC, PT-wstETH, PT-weETH | Underlying tokens |

### Hedge

| Protocol | Action | Description |
|----------|--------|-------------|
| **Hyperliquid** | Short ETH | Perpetual futures with funding rate |

---

## 6. Features

### P0 Core Features

#### 6.1 Wallet Management
- [ ] Set initial capital (USD)
- [ ] Convert USD → USDC as entry point
- [ ] View all token balances with USD values
- [ ] Swap tokens (simple price conversion using token prices)

> **Future Enhancement**: Integrate DEX aggregator API (0x or 1inch) for accurate swap quotes including price impact, slippage, and gas estimates. Both offer free tiers (~10 RPS for 0x, requires API key signup).

#### 6.2 Protocol Actions

**Aave V3:**
- [ ] Deposit tokens (ETH, wstETH, weETH, USDC, etc.)
- [ ] Enable/disable as collateral
- [ ] Borrow against collateral (ETH, USDC, USDT, USDS)
- [ ] Repay borrows
- [ ] Withdraw deposits
- [ ] View health factor, liquidation price

**Morpho:**
- [ ] Deposit to vaults (steakUSDC, GTUSDC, BBQUSDC, etc.)
- [ ] Withdraw from vaults

**Lido:**
- [ ] Stake ETH → receive stETH/wstETH
- [ ] Unstake (with delay note)

**Ether.fi:**
- [ ] Stake ETH → receive weETH
- [ ] Unstake

**Ethena:**
- [ ] Deposit USDC → sUSDe
- [ ] Withdraw

**Maple:**
- [ ] Deposit USDC → Syrup USDC
- [ ] Deposit USDT → Syrup USDT
- [ ] Withdraw

**Pendle:**
- [ ] Buy PT tokens (fixed yield)
- [ ] View maturity, implied APY

**Hyperliquid:**
- [ ] Open short ETH position
- [ ] Set leverage (1-25x)
- [ ] View funding rate, P&L
- [ ] Close position

#### 6.3 Looping (within Aave/Morpho tabs)
- [ ] Manual: Step-by-step execution (deposit → enable collateral → borrow → deposit again)
- [ ] Wizard: "Loop N times at X% LTV" → auto-calculate final position

#### 6.4 Dashboard
- [ ] Portfolio total value (USD)
- [ ] Net APY (yield - borrow costs)
- [ ] Total projected return (with price scenario)
- [ ] Health factor summary (per lending protocol)
- [ ] Position breakdown table

---

## 7. Implementation Phases

### Phase 1: Data Model & Token Registry
- [ ] Create new types in `types/index.ts`
- [ ] Build token registry with prices, params
- [ ] Create `strategyStore.ts` (replaces portfolioStore)
- [ ] Migration path from old store (or fresh start)

### Phase 2: Core Wallet Functionality
- [ ] Wallet tab UI (balance display)
- [ ] Swap simulation logic (price impact calculation)
- [ ] Token price management (CoinGecko integration)

### Phase 3: Lending Protocol (Aave V3)
- [ ] Aave tab UI
- [ ] Deposit/withdraw logic
- [ ] Collateral enable/disable
- [ ] Borrow/repay logic
- [ ] Health factor calculation
- [ ] Liquidation price calculation

### Phase 4: Other Protocols
- [ ] Morpho tab (vault deposits)
- [ ] Lido tab (ETH staking)
- [ ] Ether.fi tab (ETH staking)
- [ ] Ethena tab (sUSDe)
- [ ] Maple tab (Syrup)
- [ ] Pendle tab (PT tokens)
- [ ] Hyperliquid tab (hedge)

### Phase 5: Looping & Dashboard
- [ ] Loop wizard modal
- [ ] Dashboard tab with aggregated metrics
- [ ] Position table component

### Phase 6: Polish & Migration
- [ ] Remove old tabs (Overview, ETH, Stablecoin, Hedge)
- [ ] Update sidebar navigation
- [ ] Testing & edge cases

---

## 8. Daily Task Breakdown (2-3 hrs/day)

> For 5yr experienced fullstack developer
> Estimated total: 7 days (1 week)

### Day 1 - Foundation & Store
- [ ] Create `src/types/strategy.ts` with all interfaces (Strategy, Wallet, Position, Token)
- [ ] Create `src/lib/tokens.ts` - token registry (ETH, wstETH, weETH, USDC, USDT, sUSDe, etc.)
- [ ] Create `src/lib/protocols.ts` - protocol definitions
- [ ] Create `src/store/strategyStore.ts` - new Zustand store with basic actions
- [ ] Create `src/components/layout/Header.tsx` - persistent header with tab name
- [ ] Update `Sidebar.tsx` with new navigation structure
- [ ] Update `AppLayout.tsx` for new tab routing + header integration

### Day 2 - Wallet Tab & Swap
- [ ] Create `src/components/tabs/WalletTab.tsx` - balance list, initial capital input
- [ ] Create `src/components/modals/SwapModal.tsx` - simple token swap UI:
  - From/To token selection
  - Amount input
  - Output preview (using token prices)
- [ ] Connect swap to strategyStore (update balances)

### Day 3 - Aave Tab Complete
- [ ] Create `src/components/tabs/AaveTab.tsx`
- [ ] Deposit/withdraw UI and logic
- [ ] Collateral enable/disable toggle
- [ ] Borrow/repay UI and logic
- [ ] `calculateHealthFactor` and `calculateLiquidationPrice` utilities
- [ ] Health factor display with warning states

### Day 4 - Loop Wizard & Morpho
- [ ] Create `src/components/modals/LoopWizardModal.tsx`
  - Manual mode: step-by-step instructions
  - Auto mode: loops + LTV input → final position preview
- [ ] Integrate loop wizard into Aave tab
- [ ] Create `src/components/tabs/MorphoTab.tsx`
  - Vault deposits (steakUSDC, GTUSDC, BBQUSDC, etc.)
  - Withdraw logic
  - Loop wizard integration

### Day 5 - Staking & Yield Protocols
- [ ] Create `src/components/tabs/LidoTab.tsx` - stake ETH → wstETH
- [ ] Create `src/components/tabs/EtherfiTab.tsx` - stake ETH → weETH
- [ ] Create `src/components/tabs/EthenaTab.tsx` - deposit → sUSDe
- [ ] Create `src/components/tabs/MapleTab.tsx` - Syrup USDC/USDT
- [ ] Create `src/components/tabs/PendleTab.tsx` - PT tokens with maturity

### Day 6 - Hyperliquid & Dashboard
- [ ] Create `src/components/tabs/HyperliquidTab.tsx`
  - Short position UI (margin, leverage)
  - Funding rate from existing API
  - P&L calculation
- [ ] Create `src/components/tabs/DashboardTab.tsx`
  - Portfolio total value
  - Net APY (yields - borrow costs)
  - Health factor summary
  - Position breakdown table
  - Price scenario impact

### Day 7 - Integration & Cleanup
- [ ] Remove old tabs (PortfolioTab, EthProductsTab, StablecoinProductsTab, HedgeTab)
- [ ] Remove old store (portfolioStore) after confirming migration
- [ ] End-to-end testing of all flows
- [ ] Edge cases: 0 balance, max LTV, invalid operations
- [ ] UI polish: loading states, empty states, error handling

---

## 9. Gradual Rollout (P0 → P3)

| Phase | Data Model Addition | UI Addition |
|-------|---------------------|-------------|
| **P0** | Strategy + Wallet + Positions | Wallet, Dashboard, Protocol tabs, Loop Wizard |
| **P1** | + RebalancingRules | + Rebalancing tab |
| **P2** | + BacktestConfig/Results | + Backtest tab |
| **P3** | Multiple strategies per account | Strategy selector enabled, Compare, Share |

---

## 9. Open Questions

- [ ] Swap price impact formula (constant product? aggregator simulation?)
- [ ] Should Pendle PTs have maturity date simulation?
- [ ] APY data source strategy (continue DeFiLlama or expand?)
- [ ] Error handling for impossible operations (borrow > available, etc.)

---

## 10. Future Considerations (Not P0)

### Forked Mainnet Simulation
- Deferred for now
- Would add "Precision Mode" using Tenderly/Anvil
- Current architecture supports future addition via abstracted execution layer

### Strategy Templates
- Pre-built strategies (ETH Loop 3x, Delta Neutral, etc.)
- Deferred to post-P0

---

## 11. Files to Modify/Create

### New Files
- `src/types/strategy.ts` - New type definitions
- `src/store/strategyStore.ts` - New Zustand store
- `src/lib/tokens.ts` - Token registry
- `src/lib/protocols.ts` - Protocol configurations
- `src/components/tabs/WalletTab.tsx`
- `src/components/tabs/DashboardTab.tsx`
- `src/components/tabs/AaveTab.tsx`
- `src/components/tabs/MorphoTab.tsx`
- `src/components/tabs/LidoTab.tsx`
- `src/components/tabs/EtherfiTab.tsx`
- `src/components/tabs/EthenaTab.tsx`
- `src/components/tabs/MapleTab.tsx`
- `src/components/tabs/PendleTab.tsx`
- `src/components/tabs/HyperliquidTab.tsx`
- `src/components/modals/SwapModal.tsx` (accessed from Wallet tab)
- `src/components/modals/LoopWizardModal.tsx` (accessed from Aave/Morpho tabs)

### Files to Update
- `src/components/layout/Sidebar.tsx` - New navigation structure
- `src/components/layout/AppLayout.tsx` - Tab management + header integration

### New Layout Files
- `src/components/layout/Header.tsx` - Persistent header with tab name

### Files to Eventually Remove
- `src/components/tabs/PortfolioTab.tsx`
- `src/components/tabs/EthProductsTab.tsx`
- `src/components/tabs/StablecoinProductsTab.tsx`
- `src/components/tabs/HedgeTab.tsx`
- `src/store/portfolioStore.ts` (after migration)

---

_Document Version: 1.0_
_Last Updated: 2026-01-07_
