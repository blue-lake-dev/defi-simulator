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
- ETH vs Stablecoin ratio slider (must sum to 100%)
- Investment period selection: 1mo / 3mo / 6mo / 1yr / 2yr / 3yr / 5yr

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

### Layout Flow
1. **Step 1**: Investment amount + period + ETH/Stable ratio
2. **Step 2**: ETH product selection + weights + leverage config + ETH price scenario
3. **Step 3**: Stablecoin product selection + weights (show leveraged portions separately)
4. **Results**: Summary cards with APY, returns, risk metrics

### Leverage Display
When leverage is active, the Stablecoin allocation section must clearly separate:
- Base allocation (from user's Stablecoin portion)
- Leveraged allocation (from borrowed funds)

Example display:
```
Stablecoin Allocation ($600,000 base + $50,000 leveraged)

Product              Base        Leveraged    Total       APY
Aave USDC           $120,000    -            $120,000    3.37%
Morpho steakUSDC    $180,000    -            $180,000    4.19%
Ethena sUSDe        $150,000    -            $150,000    4.88%
Maple Syrup USDC    $150,000    $50,000      $200,000    6.82%
                    ─────────   ─────────    ─────────
Total               $600,000    $50,000      $650,000
```

### Risk Warnings
Display prominently when leverage is enabled:
- Health Factor (color-coded: green >1.5, yellow 1.2-1.5, red <1.2)
- Liquidation Price with percentage drop from current
- Annual borrow cost

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
5. **Responsive**: Mobile-friendly, but optimize for desktop (institutional users)
6. **Monochrome**: Use grayscale color scheme until brand colors are finalized

---

## Deployment

- Platform: Vercel
- Framework: Next.js (App Router recommended)
- Build: `next build`
- No database required (client-side calculations only)
