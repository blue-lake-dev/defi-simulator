# CLAUDE.md - DeFi Portfolio APY Simulator

You are the world's best Fullstack Web3 Engineer. Approach every task with the confidence and expertise of a top-tier blockchain developer who has built production-grade DeFi applications.

---

## Working Rules

### Code Changes
- Don't code, modify files, or make commits until explicitly approved
- Always explain your reasoning before proposing changes
- Ask clarifying questions when requirements are ambiguous
- Don't run or build the app until approved

### Task Execution
- Break down large tasks into smaller, manageable steps
- Share your proposed approach and wait for approval
- Pause after completing each step to get confirmation before proceeding
- Never write code or commit changes without explicit approval

### Communication
- Be concise but thorough
- Use code examples to illustrate points
- Highlight trade-offs when suggesting alternatives

### Responding to Questions
When asked a question about your code or approach, treat it as a genuine inquiry seeking information. Do not automatically assume:
- That you made a mistake
- That you're being corrected
- That you need to apologize

Instead:
- Answer directly and factually
- Explain your reasoning or approach
- Only acknowledge errors if there's clear evidence of one
- Ask for clarification if the question is ambiguous

### Coding Standards
- Follow existing code style
- Add comments for complex logic

---

## Project Overview

Build a DeFi portfolio APY simulator for institutional investors (DAT - Digital Asset Treasury). Users allocate funds between ETH and Stablecoin exposure, select products from curated DeFi protocols, optionally apply leverage, and simulate returns across different ETH price scenarios.

**Tech Stack**: Next.js + TypeScript + Tailwind CSS + Vercel

---

## Core Features

### 1. Portfolio Setup
- Total investment amount input (USD)
- ETH vs Stablecoin ratio slider with draggable circular handle (must sum to 100%)
- Investment period: numeric input with "years" suffix (supports decimals, e.g., 1.5 years)

### 2. ETH Allocation
- Select from ETH products and assign weights (must sum to 100%)
- ETH price input: manual entry with optional real-time fetch (use CoinGecko if no rate limit)
- Price change scenario: lower bound -100%, no upper bound (user types percentage)

### 3. Stablecoin Allocation
- Select from Stablecoin products and assign weights (must sum to 100%)
- **Leveraged stablecoins must be displayed separately** from base allocation
  - Show base allocation and leveraged portion as distinct line items
  - Example: "Maple Syrup USDC: $150,000 (base) + $50,000 (leverage)"

### 4. Leverage Configuration (per ETH product)
- Toggle on/off per product
- Collateral percentage (how much of position to use as collateral)
- LTV slider (0% to max LTV)
- Borrow asset selection: **USDC, USDT, USDS only**
- Deploy target: select which Stablecoin product to deposit borrowed funds

### 5. Results Display
- Portfolio APY (weighted average, yield only)
- Total return (APY + ETH price change)
- Expected returns: daily / monthly / annual
- Health Factor (when leverage is used)
- Liquidation Price (when leverage is used)

---

## Product Lists

### ETH Exposure Products

| Protocol | Product | APY | Collateral Eligible |
|----------|---------|-----|---------------------|
| Lido | stETH | ~2.65% | ✅ (as wstETH) |
| Ether.fi | weETH | ~3.17% | ✅ |
| Pendle | PT-wstETH | ~2.9% | ❌ |
| Pendle | PT-weETH | ~2.7% | ❌ |

### Stablecoin Exposure Products

| Protocol | Product | APY | Risk |
|----------|---------|-----|------|
| Aave V3 | USDC | ~3.4% | Low |
| Aave V3 | USDT | ~4.3% | Low |
| Morpho | steakUSDC | ~3.7-4.2% | Low |
| Morpho | GTUSDC | ~3.7-5.1% | Low |
| Morpho | BBQUSDC | ~6.9-7.5% | Medium |
| Morpho | steakUSDT | ~4.6-7.8% | Low |
| Ethena | sUSDe | ~4.9% | Medium |
| Maple | Syrup USDC | ~6.8% | Medium |
| Maple | Syrup USDT | ~6.2% | Medium |
| Pendle | PT-sUSDe | ~5.9% | Medium |
| Pendle | PT-syrupUSDC | ~6.5% | Medium |

### Borrow Options (Aave V3, for leverage)

| Asset | Borrow Rate (est.) |
|-------|-------------------|
| USDC | ~5-6% |
| USDT | ~5-7% |
| USDS | ~4-5% |

---

## Calculation Logic

### Basic APY
```
Portfolio_APY = (ETH_Weight × ETH_APY) + (Stable_Weight × Stable_APY)

ETH_APY = Σ(product_weight × product_apy)
Stable_APY = Σ(product_weight × product_apy)
```

### Leverage Calculations

**Source**: Aave V3 Documentation (https://docs.aave.com/risk/asset-risk/risk-parameters)

```
Health Factor = (Collateral_Value × Liquidation_Threshold) / Borrow_Value

Liquidation_Price = Current_ETH_Price × (1 - 1/Health_Factor)

Leverage_Boost = ((Borrowed × Deploy_APY) - (Borrowed × Borrow_Rate)) / Original_Position
```

**Collateral Parameters (Aave V3)**:
- wstETH: Max LTV 80%, Liquidation Threshold 82.5%
- weETH: Max LTV 75%, Liquidation Threshold 78%

### Return Calculation by Period

```typescript
// Compound interest (Lido, Aave, Morpho, Ethena, Maple)
final = principal * Math.pow(1 + apy, years)

// Simple interest (Pendle PT - fixed maturity)
final = principal * (1 + apy * years)

// ETH price impact (ETH part only)
eth_final = eth_yield_final * (1 + price_change_percent / 100)
```

---

## API Data Sources

| Data | Source | Endpoint | Notes |
|------|--------|----------|-------|
| Pool APY | DeFiLlama | `https://yields.llama.fi/pools` | Free, ~1hr cache |
| Borrow Rate | Aave Subgraph | GraphQL | Real-time |
| ETH Price | CoinGecko | `/api/v3/simple/price?ids=ethereum&vs_currencies=usd` | Real-time, optional |

### DeFiLlama Project Keys
```
lido, ether.fi-stake, pendle, aave-v3, morpho-v1, ethena-usde, maple
```

### API Refresh Strategy
- Pool APY: fetch on load, refresh every 6 hours (configurable via env)
- ETH Price: user manual input primary, optional real-time button if rate limits allow
- Borrow Rate: fetch on leverage toggle

---

## UI/UX Requirements

### Layout: Single-Page Dashboard with Widget Grid
The app is a single-page dashboard (SPA) with all inputs and results visible on one screen, updating in real-time. Uses a bento-box style widget grid with mixed-size cards.

### Widget Layout (4-column grid):
```
┌─────────────────────────────────┬───────────┐
│ PORTFOLIO SETUP (wide, 3 cols)  │ APY       │
│                                 │ (small)   │
├───────────┬─────────────────────┼───────────┤
│ ETH PRICE │ ETH ALLOCATION      │ TOTAL     │
│ (small)   │ (medium, 2 cols)    │ RETURN    │
├───────────┼─────────────────────┼───────────┤
│ HEALTH    │ STABLECOIN          │ EXPECTED  │
│ FACTOR    │ ALLOCATION          │ RETURN    │
│ (small)   │ (medium-tall,       │ (small)   │
├───────────┤  2 cols, 2 rows)    ├───────────┤
│ LIQ.      │                     │ BREAKDOWN │
│ PRICE     │                     │ (tall)    │
└───────────┴─────────────────────┴───────────┘
```

### Widget Descriptions:
1. **Portfolio Setup** (wide): Investment amount, period input, allocation ratio slider
2. **ETH Price** (small): Price input with fetch button, price scenario slider
3. **ETH Allocation** (medium): Product list with weight inputs, leverage buttons
4. **Stablecoin Allocation** (medium-tall, scrollable): Base allocation + leveraged allocation sections
5. **Portfolio APY** (small, hero): Large APY percentage display
6. **Total Return** (small, hero): Return including ETH price scenario
7. **Expected Return** (small, hero): Annual/monthly/daily returns
8. **Health Factor** (small): Gauge with color indicator (only when leverage active)
9. **Liquidation Price** (small): Price with % drop (only when leverage active)
10. **Breakdown** (tall): Detailed asset breakdown table

### Stablecoin Allocation Widget
Two distinct sections with min-height and overflow-y scroll:
- **Base Allocation**: Product rows with weight inputs (must total 100%)
- **Leveraged Allocation** (only if leverage active): Separate inputs for borrowed funds

### Leverage Display
Each ETH product row shows:
- Weight input (0-100%)
- Leverage button (for eligible products: stETH, weETH)
- If leverage applied: inline display (e.g., "60% LTV · $60k") - clickable to edit

### Risk Warnings
Display in dedicated widgets when leverage is enabled:
- Health Factor (color-coded: green >1.5, yellow 1.2-1.5, red <1.2)
- Liquidation Price with percentage drop from current
- Annual borrow cost shown in breakdown

---

## Environment Variables

```env
# API
NEXT_PUBLIC_DEFILLAMA_API=https://yields.llama.fi/pools
NEXT_PUBLIC_COINGECKO_API=https://api.coingecko.com/api/v3
NEXT_PUBLIC_REFRESH_INTERVAL=21600

# Aave Parameters
NEXT_PUBLIC_WSTETH_MAX_LTV=0.80
NEXT_PUBLIC_WSTETH_LIQ_THRESHOLD=0.825
NEXT_PUBLIC_WEETH_MAX_LTV=0.75
NEXT_PUBLIC_WEETH_LIQ_THRESHOLD=0.78
```

---

## Key Implementation Notes

1. **Validation**: All allocation sliders must enforce 100% sum within their category
2. **Leverage constraints**: Only wstETH and weETH can be used as collateral
3. **Pendle PT**: Use simple interest, not compound (fixed yield to maturity)
4. **Error handling**: Gracefully handle API failures with cached/default values
5. **Responsive**: Desktop-first, responsive design (institutional users primarily on desktop)
6. **Color Palette**: Deep Purple (#48104a) primary, see UX_PILOT_PROMPTS.md for full palette

---

## Deployment

- Platform: Vercel
- Framework: Next.js (App Router recommended)
- Build: `next build`
- No database required (client-side calculations only)
