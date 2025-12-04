# UXPilot Prompts - Juicy Yield Simulator

Sequential prompts for designing the DeFi Portfolio APY Simulator UI.

---

## Color Palette Reference

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Deep Purple | `#48104a` | Headers, primary buttons, key UI elements |
| **Primary Light** | Soft Purple | `#6B2D6B` | Hover states, secondary elements |
| **Accent** | KKR Red | `#D00946` | CTAs, alerts, important highlights |
| **Success** | Muted Green | `#2D6B4F` | Positive returns, health factor good |
| **Warning** | Warm Amber | `#B8860B` | Caution states, medium risk |
| **Danger** | Deep Red | `#8B0000` | Liquidation warnings, high risk |
| **Background** | Off-White | `#FAFAFA` | Page background |
| **Surface** | White | `#FFFFFF` | Cards, panels |
| **Text Primary** | Charcoal | `#1A1A1A` | Headings, body text |
| **Text Secondary** | Slate Gray | `#6B7280` | Labels, secondary info |
| **Border** | Light Gray | `#E5E7EB` | Dividers, input borders |

---

## Prompt 1: Full Dashboard Layout

```
Design a single-page dashboard for "Juicy Yield" - a DeFi Portfolio APY Simulator for institutional investors. Use a modern widget-based layout with mixed-size cards arranged in an asymmetric grid. All inputs and results are visible on one screen, updating in real-time.

TARGET AUDIENCE:
Institutional investors, asset managers, and treasury professionals from traditional finance. They value credibility, precision, and clarity over flashy crypto aesthetics.

DESIGN STYLE:
- Refined, institutional-grade financial software
- Chic, modern, understated elegance
- Clean lines with generous whitespace
- Professional and trustworthy—evokes private banking interfaces
- Data-forward with sophisticated typography
- Premium feel without being ostentatious
- Widget-based dashboard with varied card sizes (small, medium, wide, tall)

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Primary Light: #6B2D6B
- Accent: #D00946
- Success: #2D6B4F
- Warning: #B8860B
- Danger: #8B0000
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB

TYPOGRAPHY:
- Sophisticated sans-serif (Inter or DM Sans)
- Large bold numbers for key metrics
- Monospace for financial figures and percentages

---

HEADER BAR (full width, sticky):
- Logo "Juicy Yield" on left (text-based, elegant)
- Tagline: "Institutional DeFi Portfolio Simulator"
- "Export Summary" button on right (outline style)

---

WIDGET GRID LAYOUT:
Use CSS Grid or Bento-box style layout. Widgets have different sizes:
- Small: 1x1 (compact metric display)
- Medium: 2x1 (standard card)
- Wide: 3x1 or 4x1 (spans multiple columns)
- Tall: 1x2 or 2x2 (spans multiple rows)

Visual grid reference (4-column base):
┌─────────────────────────────────┬───────────┐
│ PORTFOLIO SETUP (wide, 3 cols)  │ APY       │
│                                 │ (small)   │
├───────────┬─────────────────────┼───────────┤
│ ETH PRICE │ ETH ALLOCATION      │ TOTAL     │
│ (small)   │ (medium, 2 cols)    │ RETURN    │
│           │                     │ (small)   │
├───────────┼─────────────────────┼───────────┤
│ HEALTH    │ STABLECOIN          │ EXPECTED  │
│ FACTOR    │ ALLOCATION          │ RETURN    │
│ (small)   │ (medium-tall,       │ (small)   │
├───────────┤  2 cols, 2 rows)    ├───────────┤
│ LIQ.      │                     │ BREAKDOWN │
│ PRICE     │                     │ (tall,    │
│ (small)   │                     │  2 rows)  │
└───────────┴─────────────────────┴───────────┘

---

WIDGET DETAILS:

1. PORTFOLIO SETUP WIDGET (wide - spans 3 columns):
   - Card title: "Portfolio Setup"
   - Horizontal layout with 3 sections side by side:

   A) Total Investment:
      - Label + large input with "$" prefix
      - Value: "1,000,000"

   B) Investment Period:
      - Compact number input field (~60px width)
      - "years" suffix label to the right (muted gray #6B7280)
      - Allow decimals (e.g., 1.5, 2.5)
      - Min: 0.1, Max: 10
      - Example: [ 1 ] years

   C) Allocation Ratio:
      - Two-tone slider track (purple for ETH / gray for Stablecoin)
      - Circular draggable handle in the middle that user grabs to adjust
      - "40% ETH · 60% Stablecoin"
      - Below: "$400,000 ETH | $600,000 Stablecoin"

2. ETH PRICE WIDGET (small - 1 column):
   - Card title: "ETH Price"
   - Large price display: "$3,500"
   - Small "Fetch Live" link
   - Price scenario slider below: -100% to +200%
   - Current: "+20%"
   - Result: "→ $4,200"

3. ETH ALLOCATION WIDGET (medium - 2 columns):
   - Card title: "ETH Allocation"
   - Subtitle: "$400,000 · Must total 100%"

   Product rows - each row contains:
   - Checkbox (select/deselect product)
   - Product name + Protocol (e.g., "Lido stETH")
   - APY display (e.g., "2.65%")
   - Weight input field (0-100%, number input or dropdown)
   - Leverage button (only for collateral-eligible: stETH, weETH)
     - If no leverage: shows "Leverage" button (outline style)
     - If leverage applied: shows leverage info inline (e.g., "60% LTV · $60k")
       but still clickable to edit leverage settings

   Example rows:
   | ☑ Lido stETH      | 2.65% | [50%] | [Leverage]           |
   | ☑ Ether.fi weETH  | 3.17% | [50%] | [60% LTV · $60k] ←clickable |
   | ☐ Pendle PT-wstETH| 2.90% | [ - ] | (not eligible)       |
   | ☐ Pendle PT-weETH | 2.70% | [ - ] | (not eligible)       |

   - Progress bar at bottom showing allocation total (green if 100%, amber otherwise)

4. STABLECOIN ALLOCATION WIDGET (medium-tall - 2 columns, 2 rows):
   - Card title: "Stablecoin Allocation"
   - Widget has min-height with overflow-y scroll enabled

   TWO SECTIONS inside the widget:

   SECTION A - Base Allocation:
   - Section label: "Base Allocation · $600,000 · Must total 100%"
   - Product rows with:
     - Checkbox
     - Product name + Protocol
     - APY + Risk badge (Low/Medium)
     - Weight input field (0-100%)

   | ☑ Aave USDC         | 3.4% | Low    | [20%] |
   | ☑ Morpho steakUSDC  | 4.2% | Low    | [30%] |
   | ☑ Ethena sUSDe      | 4.9% | Medium | [25%] |
   | ☑ Maple Syrup USDC  | 6.8% | Medium | [25%] |
   | ☐ Aave USDT         | 4.3% | Low    | [ - ] |
   | ☐ Morpho BBQUSDC    | 7.2% | Medium | [ - ] |
   | ☐ Morpho steakUSDT  | 5.2% | Low    | [ - ] |
   | ☐ Maple Syrup USDT  | 6.2% | Medium | [ - ] |
   | ☐ Pendle PT-sUSDe   | 5.9% | Medium | [ - ] |
   | ☐ Pendle PT-syrupUSDC | 6.5% | Medium | [ - ] |

   - Progress bar: "100%" (green)

   SECTION B - Leveraged Allocation (only visible if leverage exists):
   - Divider line
   - Section label: "Leveraged Funds · $60,000 borrowed · Must total 100%"
   - Display which products receive borrowed funds
   - Separate weight input fields for allocating borrowed stablecoins

   | Maple Syrup USDC  | 6.8% | [100%] | → $60,000 |

   - Progress bar: "100%" (green)

   - Summary row at bottom:
     "Total Stablecoin Exposure: $660,000 ($600k base + $60k leveraged)"

5. PORTFOLIO APY WIDGET (small - 1 column, hero style):
   - Minimal label: "Portfolio APY"
   - Giant number: "4.82%"
   - Purple left border accent
   - Subtle background tint

6. TOTAL RETURN WIDGET (small - 1 column, hero style):
   - Minimal label: "Total Return"
   - Giant number: "+12.62%"
   - Green color (positive)
   - Subtitle: "incl. +20% ETH"

7. EXPECTED RETURN WIDGET (small - 1 column, hero style):
   - Minimal label: "Annual Return"
   - Giant number: "$126,200"
   - Monospace font
   - Secondary row: "Daily $346 · Monthly $10.5k"

8. HEALTH FACTOR WIDGET (small - 1 column):
   - Minimal label: "Health Factor"
   - Large number: "1.56"
   - Semicircle gauge or color indicator
   - Green = safe (>1.5), Yellow = caution (1.2-1.5), Red = danger (<1.2)
   - Only visible when leverage active

9. LIQUIDATION PRICE WIDGET (small - 1 column):
   - Minimal label: "Liquidation Price"
   - Large number: "$2,243"
   - Subtitle: "-36% from current"
   - Warning amber tint
   - Only visible when leverage active

10. PORTFOLIO BREAKDOWN WIDGET (tall - 1 column, 2 rows):
    - Card title: "Breakdown"
    - Compact vertical list:

    ETH Exposure
    ├ stETH     $200k  2.65%  $5.3k
    └ weETH     $200k  3.17%  $6.3k

    Stablecoin Exposure
    ├ Aave      $120k  3.40%  $4.1k
    ├ Morpho    $180k  4.20%  $7.6k
    ├ Ethena    $150k  4.90%  $7.4k
    └ Maple     $210k  6.80%  $14.3k

    Leverage Cost
    └ Borrow    -$60k  -5.50% -$3.3k

    ─────────────────────────
    Net Total   $1M    4.82%  $41.6k

---

FOOTER (minimal, full width):
- "For simulation purposes only. Not financial advice."
- Muted gray, small text

---

VISUAL NOTES:
- Widgets have white background, subtle shadow, rounded corners (12px)
- Different widget sizes create visual hierarchy and rhythm
- Hero metric widgets (APY, Return) are visually elevated with accent borders or tints
- Smooth number transitions when values update
- Sticky header on scroll
- Gap between widgets: 16-20px
- Risk widgets (Health Factor, Liquidation) appear/disappear based on leverage state

Desktop-first, responsive design. On smaller screens, widgets reflow to fewer columns and stack naturally.
```

---

## Prompt 2: Leverage Configuration Modal

```
Design a Leverage Configuration Modal for the Juicy Yield dashboard. This modal appears when user clicks "Leverage" button on an ETH product (weETH).

DESIGN STYLE: Same institutional, refined aesthetic. Deep purple (#48104a) primary. Modal overlays the dashboard with a semi-transparent dark backdrop.

MODAL LAYOUT (centered, medium width):

1. MODAL HEADER:
   - Title: "Configure Leverage for weETH"
   - Subtitle: "Use your weETH as collateral to borrow stablecoins"
   - Close button (X) in top right corner

2. POSITION SUMMARY (read-only context):
   - "Your weETH position: $200,000"
   - Subtle background, top of modal

3. COLLATERAL SECTION:
   - Label: "Collateral Amount"
   - Subtitle: "Percentage of position to use as collateral"
   - Slider: 0% to 100%
   - Current: 50%
   - Display: "Using $100,000 of $200,000 as collateral"

4. LOAN-TO-VALUE SECTION:
   - Label: "Loan-to-Value (LTV)"
   - Subtitle: "How much to borrow against collateral"
   - Slider: 0% to 75% (max LTV for weETH)
   - Visual markers: "Safe" zone (0-50%), "Moderate" (50-65%), "Risky" (65-75%)
   - Clear marker at 75% showing "Max LTV"
   - Current: 60%
   - Display: "Borrowing $60,000 against $100,000 collateral"

5. BORROW ASSET SECTION:
   - Label: "Borrow Asset"
   - Three toggle buttons: USDC | USDT | USDS
   - Currently selected: USDC
   - Show borrow rate below: "Est. Borrow Rate: ~5.5% APY"

6. DEPLOYMENT TARGET SECTION:
   - Label: "Deploy Borrowed Funds To"
   - Subtitle: "Which stablecoin product receives the borrowed funds"
   - Dropdown showing stablecoin products with APYs:
     - Aave USDC (3.4% APY)
     - Morpho steakUSDC (4.2% APY)
     - Maple Syrup USDC (6.8% APY) ← selected
     - etc.

7. LEVERAGE IMPACT SUMMARY (highlighted card):
   - Background: light purple tint (#f5f0f5)
   - Title: "Leverage Impact"

   Row 1 - Key Numbers:
   - Borrowed: "$60,000"
   - Deploy APY: "6.8%"
   - Borrow Cost: "5.5%"
   - Net Boost: "+0.78%" (green)

   Row 2 - Risk Metrics:
   - Health Factor: "1.56" (green badge)
   - Liquidation Price: "$2,243 (-36%)" (with warning icon)

   Row 3 - Annual Impact:
   - Yield Gain: "+$4,080"
   - Borrow Cost: "-$3,300"
   - Net Gain: "+$780/year" (green)

8. MODAL FOOTER:
   - "Remove Leverage" button (text/link style, left) - only if leverage already configured
   - "Cancel" button (outline)
   - "Apply Leverage" button (solid purple)

VISUAL NOTES:
- Modal max-height with scroll if needed
- Sliders have tooltips showing exact values while dragging
- Risk colors: green (<50% LTV), amber (50-65%), red (>65%)
- Numbers update in real-time as sliders move
```

---

## Prompt 3: Export Summary Modal

```
Design an Export Summary modal for the Juicy Yield dashboard. Allows users to download or share their portfolio simulation results.

DESIGN STYLE: Same institutional aesthetic. Deep purple (#48104a) primary. Clean modal overlay.

MODAL LAYOUT (centered, narrow width):

1. MODAL HEADER:
   - Title: "Export Portfolio Summary"
   - Close (X) button

2. EXPORT FORMAT OPTIONS (radio button cards):

   A) PDF Report (selected):
      - Icon: document icon
      - Title: "PDF Report"
      - Description: "Detailed breakdown with charts"
      - Selected state: purple border, light purple background

   B) CSV Data:
      - Icon: spreadsheet icon
      - Title: "CSV Data"
      - Description: "Raw data for spreadsheet analysis"

   C) Copy Link:
      - Icon: link icon
      - Title: "Shareable Link"
      - Description: "Copy link to this simulation"

3. INCLUDE IN EXPORT (checkboxes):
   - Section title: "Include in export"
   - ☑ Portfolio allocation breakdown
   - ☑ Return projections
   - ☑ Risk metrics (if leverage active)
   - ☐ Disclaimer text

4. PREVIEW SECTION (optional):
   - Small thumbnail preview of PDF
   - Or text: "Preview will generate on export"

5. MODAL FOOTER:
   - "Cancel" button (outline, left)
   - "Download PDF" button (solid purple, right)
   - Button text changes based on selection: "Download PDF" / "Download CSV" / "Copy Link"

VISUAL NOTES:
- Radio cards have hover states
- Checkboxes use custom styling matching design system
- Primary action button is prominent
```

---

## Usage Instructions

1. Use **Prompt 1** to generate the complete dashboard layout
2. Use **Prompt 2** for the leverage configuration overlay
3. Use **Prompt 3** for the export functionality overlay

All prompts share the same design system for visual consistency.
