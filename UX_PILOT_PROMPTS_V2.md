# UXPilot Prompts V2 - DeFi Yield Simulator

Sequential prompts for designing the redesigned DeFi Yield Simulator UI.
Each prompt generates one page/view.

---

## Design System Reference

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Deep Purple | `#48104a` | Primary buttons, active states, brand |
| **Primary Light** | Soft Purple | `#6B2D6B` | Hover states, secondary elements |
| **Success** | Muted Green | `#2D6B4F` | Positive returns, gains |
| **Warning** | Warm Amber | `#B8860B` | Caution states |
| **Danger** | Deep Red | `#8B0000` | Losses, liquidation warnings |
| **Background** | Off-White | `#FAFAFA` | Page background |
| **Surface** | White | `#FFFFFF` | Cards, panels |
| **Text Primary** | Charcoal | `#1A1A1A` | Headings, body text |
| **Text Secondary** | Slate Gray | `#6B7280` | Labels, secondary info |
| **Border** | Light Gray | `#E5E7EB` | Dividers, input borders |

### Design Principles (Robinhood-inspired)

- **Spacious**: Generous whitespace, never cramped
- **Bold typography**: Large numbers, clear hierarchy
- **Rounded & soft**: Pill buttons, rounded cards (16px radius)
- **One focus**: Each screen has one primary purpose
- **Minimal**: Only essential information, no clutter
- **Touch-friendly**: Large tap targets, comfortable inputs
- **Light mode**: Clean white cards on light gray background

### Typography

- Font: Inter or SF Pro (system)
- Hero numbers: 48-64px, bold
- Section headers: 18-20px, semibold
- Body: 14-16px, regular
- Labels: 12-14px, medium, muted color
- Monospace for financial figures

---

## Prompt 1: Global Layout Shell

```
Design the main layout shell for "DeFi Yield Simulator" - a portfolio simulator for institutional DeFi investors. This is the container layout that all pages share.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode with generous whitespace
- Large bold typography for key numbers
- Rounded corners (16px), soft shadows
- Professional but approachable
- Desktop-first, responsive

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F
- Danger: #8B0000

---

LAYOUT STRUCTURE (desktop 1440px):

┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
├─────────────────────────────────────────────────────────────┤
│ [PORTFOLIO ALLOCATION               ]  gap  [ETH PRICE    ] │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  SIDEBAR   │         CONTENT AREA                           │
│  (nav)     │                                                │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘

- Global controls bar spans full width, NO padding on left/right edges
- Gap ONLY between the two widget cards (16px), no gap at outer edges
- Sidebar starts below global controls bar

---

HEADER (sticky, white background, subtle bottom border):
- Left: "PlumLabs" logo (text, purple #48104a, bold) + separator "|" + "DeFi Yield Simulator" (gray, medium weight)
- Right: Language toggle "EN | KR" (pill style)
- Height: 64px
- Padding: 24px horizontal

---

GLOBAL CONTROLS (two separate widget cards, side by side):
- IMPORTANT: NO outer padding/margin on left or right edges
- Portfolio Allocation card touches the LEFT edge of the viewport (no gap)
- ETH Price card touches the RIGHT edge of the viewport (no gap)
- ONLY a 16px gap BETWEEN the two cards (center gap only)
- The two cards together span the full width edge-to-edge

WIDGET 1 - PORTFOLIO ALLOCATION (~65% width):
- White card, rounded 16px, padding 24px
- Header row: "Portfolio Allocation" (16px, semibold, left) + "Reset" (14px, gray text link, right)
- Content row with two controls side by side:

  Control A - Investment Amount:
  - Label: "Investment Amount" (12px, gray)
  - Input: Large text field with "$" prefix
  - Value: "1,000,000"
  - Formatted with commas

  Control B - Allocation Ratio (3-segment slider):
  - Label: "ETH / Stablecoin / Hedge" (12px, gray)
  - Three-tone slider bar:
    - Purple segment (ETH): 60%
    - Light gray segment (Stablecoin Yield): 32%
    - Darker gray segment (Hedge): 8%
  - Two draggable handles:
    - Handle 1: between ETH and Stablecoin
    - Handle 2: between Stablecoin and Hedge (within stablecoin portion)
  - Below slider, three labels with amounts:
    - "ETH 60%" + "$600,000" (purple text)
    - "Stable 32%" + "$320,000" (gray text)
    - "Hedge 8%" + "$80,000" (dark gray text)

WIDGET 2 - ETH PRICE (~35% width):
- White card, rounded 16px, padding 24px
- Header row: "ETH Price" (16px, semibold, left) + "Reset" (14px, gray text link, right)
- Content row with two controls side by side:

  Control A - Current Price:
  - Label: "Price" (12px, gray)
  - Input: Text field with "$" prefix
  - Value: "3,400"
  - Below: "Fetch" link button (purple text, 12px)

  Control B - Price Scenario:
  - Label: "Scenario" (12px, gray)
  - Input: Text field with "%" suffix
  - Value: "+10"
  - Below: "→ $3,740" (calculated price, 12px, gray)

---

RESET BUTTON STYLE:
- Text link style, not a button
- Font: 14px, medium weight
- Color: #6B7280 (gray)
- Hover: #4B5563 (darker gray) + underline
- Position: top right corner of each widget card
- No border, no background

---

SIDEBAR (left, white background, right border):
- Width: 240px
- Padding: 16px
- 4 navigation items, vertical stack with 8px gap

Nav item style:
- Rounded rectangle (12px radius)
- Padding: 16px
- Icon (left) + Label (right)
- Inactive: gray text, transparent background
- Active: purple text (#48104a), light purple background (#f5f0f5)
- Hover: light gray background

Nav items:
1. Icon: chart-pie | Label: "ETH Products"
2. Icon: coins | Label: "Stablecoin Products"
3. Icon: shield | Label: "Hedge"
4. Icon: calculator | Label: "Results"

---

CONTENT AREA:
- Background: #FAFAFA
- Padding: 32px
- This is where each tab's content renders
- Show placeholder text: "Content Area"

---

FOOTER (inside content area, bottom):
- Small text, centered, muted gray
- "For simulation purposes only. Not financial advice."

---

RESPONSIVE BEHAVIOR:
- < 1024px: Sidebar collapses to icons only (64px width), two widgets stack vertically
- < 768px: Sidebar becomes bottom tab bar, widgets stack vertically, full width
```

---

## Prompt 2: ETH Products Tab

```
Design the "ETH Products" tab content for a DeFi Yield Simulator. This page allows users to select and allocate weights to ETH-based yield products.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows
- Professional but approachable

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F

---

PAGE HEADER:
- Title: "ETH Products" (24px, bold)
- Subtitle: "Select products and allocate weights" (14px, gray)
- Right side: Total allocation badge "Total: $600,000" (large, bold, purple background pill)

---

ALLOCATION PROGRESS BAR (below header):
- Full width rounded bar (8px height)
- Shows allocation progress toward 100%
- Filled portion: purple (#48104a)
- Unfilled: light gray (#E5E7EB)
- Right side label: "75% allocated" or "100% ✓" (green when complete)
- If over 100%: bar turns red, label shows "115% - exceeds 100%"

---

PRODUCT LIST (vertical stack of cards):
- Each product is a white card with rounded corners (16px)
- Card padding: 24px
- Gap between cards: 16px
- Subtle shadow on hover

PRODUCT CARD LAYOUT (horizontal, space-between):

Left section (flex, align center, gap 16px):
- Checkbox: Large rounded checkbox (24px), purple when checked
- Logos: Two overlapping circles (32px each)
  - Back: Protocol logo (e.g., Lido)
  - Front: Token logo (e.g., stETH), offset right and down
- Product info (vertical stack):
  - Product name: "stETH" (16px, semibold)
  - Protocol: "Lido" (14px, gray)

Middle section:
- APY display in a rounded pill (light green background)
- "2.65% APY" (16px, semibold, green text)
- Small "Live" dot indicator if real-time

Right section (flex, align center, gap 16px):
- Weight input:
  - Rounded input field (80px width)
  - "%" suffix inside
  - Value: "50"
  - Disabled (grayed out) if product not selected
- Leverage button (only for eligible products: stETH, weETH):
  - If no leverage: "Leverage" button (outline, purple)
  - If leverage active: Purple pill showing "60% LTV · $36k" (clickable to edit)
  - For non-eligible products: Show nothing or "—"

---

PRODUCT LIST ITEMS (4 products):

1. Lido stETH
   - Logos: Lido protocol + stETH token
   - APY: 2.65%
   - Leverage eligible: Yes

2. Ether.fi weETH
   - Logos: Ether.fi protocol + weETH token
   - APY: 3.17%
   - Leverage eligible: Yes

3. Pendle PT-wstETH
   - Logos: Pendle protocol + wstETH token
   - APY: 2.90%
   - Leverage eligible: No

4. Pendle PT-weETH
   - Logos: Pendle protocol + weETH token
   - APY: 2.70%
   - Leverage eligible: No

---

EMPTY STATE (when no products selected):
- Show subtle message: "Select at least one product to begin"
- Muted text, centered in list area

---

VISUAL NOTES:
- Cards have subtle hover state (slight lift, shadow increase)
- Selected products have purple left border (4px)
- Weight inputs only enabled when product is checked
- Smooth transitions on all interactions
- Checkbox animation on toggle
```

---

## Prompt 3: Stablecoin Products Tab

```
Design the "Stablecoin Products" tab content for a DeFi Yield Simulator. This page shows base stablecoin allocation and any leveraged funds deployed from ETH collateral.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F

---

PAGE HEADER:
- Title: "Stablecoin Products" (24px, bold)
- Subtitle: "Select products and allocate weights" (14px, gray)
- Right side: Total badge "Total: $400,000" (purple background pill)

---

SECTION 1: BASE ALLOCATION

Section header:
- "Base Allocation" (18px, semibold)
- Right side: Allocation progress "80% allocated" or "100% ✓"

Progress bar:
- Same style as ETH tab
- Full width, 8px height, rounded

Product list (same card style as ETH tab):
- Checkbox (large, rounded)
- Dual logos (protocol + token)
- Product name + protocol
- APY pill (green background)
- Weight input (%)

PRODUCTS (8 items, scrollable if needed):

1. Aave V3 USDC - 3.4% APY
2. Morpho steakUSDC - 4.0% APY
3. Morpho GTUSDC - 4.5% APY
4. Morpho BBQUSDC - 7.2% APY
5. Ethena sUSDe - 4.9% APY
6. Maple Syrup USDC - 6.8% APY
7. Pendle PT-sUSDe - 5.9% APY
8. Pendle PT-syrupUSDC - 6.5% APY

---

SECTION 2: LEVERAGED ALLOCATION (only visible if leverage active)

Visual separator:
- Horizontal dashed line
- Or distinct background color section (#f9f7fa light purple tint)

Section header:
- "Leveraged Funds" (18px, semibold)
- Badge: "$60,000 borrowed" (purple outline pill)
- Right side: "100% deployed ✓"

Explanation text (small, gray):
- "These funds are borrowed against your ETH collateral and deployed to stablecoin products."

Deployed funds display (read-only cards, not editable):
- Simpler card style than base allocation
- Shows: Product name + Amount deployed + APY
- Example: "Maple Syrup USDC · $60,000 · 6.8% APY"
- Subtle purple left border to indicate it's leveraged

---

SUMMARY BAR (sticky bottom or bottom of section):
- White card, full width
- "Total Stablecoin Exposure"
- Large number: "$460,000"
- Breakdown: "$400,000 base + $60,000 leveraged"
- Subtle purple accent

---

VISUAL NOTES:
- Base allocation section always visible
- Leveraged section only appears when leverage is configured in ETH tab
- Clear visual distinction between base and leveraged
- Leveraged section has subtle purple tint to differentiate
- Scroll within sections if many products
```

---

## Prompt 4: Hedge Tab

```
Design the "Hedge" tab content for a DeFi Yield Simulator. This page allows users to configure the leverage multiplier for their ETH short hedge using Hyperliquid perpetuals.

NOTE: The hedge allocation percentage is already set in the global Portfolio Allocation widget (the 3-segment slider: ETH | Stablecoin | Hedge). This tab only configures HOW the hedge operates, not how much is allocated.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F
- Warning: #B8860B

---

PAGE HEADER:
- Title: "ETH Hedge" (24px, bold)
- Subtitle: "Configure your Hyperliquid perpetual short position" (14px, gray)
- Right side: Allocation badge showing "Hedge: $80,000" (purple background pill, NO percentage) - this is read-only, set from global controls

---

MAIN CARD (white, rounded, padded):

CARD HEADER:
- Title: "Hedge Configuration" (18px, semibold)
- Subtitle: "Adjust leverage to control position size and risk" (14px, gray)

---

SLIDER STYLE (applies to all sliders):
- Track filled portion: Deep Purple #48104a
- Track unfilled portion: Light Gray #E5E7EB
- Thumb/handle: White circle with purple border (#48104a) and subtle shadow
- Height: 8px, rounded

---

CONFIGURATION SECTION:

Vertical stack with generous spacing (32px gap):

1. FUND ALLOCATION SLIDER:
   - Label row: "Fund Allocation" (14px, semibold, left) + "80%" (14px, semibold, right)
   - Slider: 0% to 100%
   - Controls how much of the hedge allocation to actually deploy as margin
   - Below slider: "$64,000 deployed of $80,000" (14px, gray)
   - Helper text: "Percentage of hedge funds to deploy as margin" (12px, gray)

2. LEVERAGE SELECTOR:
   - Label row: "Leverage Multiplier" (14px, semibold, left) + "10x" (14px, semibold, right)
   - Slider with tick marks at: 1x, 2x, 5x, 10x, 25x
   - Tick marks: small vertical lines below slider
   - Selected tick: highlighted in purple, others in gray
   - Helper text below: "Higher leverage = larger position, higher risk" (12px, gray)

3. POSITION SUMMARY (highlighted card, light purple background #f9f7fa):
   - Title: "Position Details" (16px, semibold)
   - Rounded 12px, padding 24px

   Three columns, evenly spaced:

   Column 1 - Collateral:
   - Label: "Collateral" (12px, gray)
   - Value: "$80,000" (28px, bold)
   - Subtext: "From hedge allocation"

   Column 2 - Short Position:
   - Label: "Short Position" (12px, gray)
   - Value: "$800,000" (28px, bold)
   - Subtext: "10x leverage"

   Column 3 - Hedge Coverage:
   - Label: "ETH Hedged" (12px, gray)
   - Value: "133%" (28px, bold, green if >= 100%)
   - Subtext: "of $600,000 ETH exposure"

4. FUNDING RATE CARD (white card with green left border):
   - Left side:
     - Label: "Est. Funding Rate" (12px, gray)
     - Value: "+12.4% APY" (24px, bold, green)
     - Subtext: "Paid to shorts (you earn this)"
   - Right side:
     - Label: "Annual Funding Income" (12px, gray)
     - Value: "+$9,920" (24px, bold, green)
     - Subtext: "Based on current rate"
   - Small "Live" indicator dot with green pulse animation
   - "Refresh" link (purple text, 12px)

---

INFO CARD (below configuration, subtle gray border):
- Collapsed by default, expandable
- Header row: Info icon + "How ETH Hedging Works" (14px, semibold) + Chevron (right when collapsed, down when expanded)
- Expanded content (14px, gray, line-height 1.6):
  - "Opening a short position on Hyperliquid offsets your ETH price exposure."
  - "If ETH price drops, your short profits, compensating for losses in ETH holdings."
  - "You earn funding rate when it's positive (longs pay shorts)."
  - "Risk: If ETH rises sharply, the short position loses money."

---

EMPTY STATE (when hedge allocation is 0% in global controls):
- Show centered message in content area
- Icon: shield with slash
- Title: "No Hedge Allocation" (18px, semibold)
- Subtitle: "Adjust the hedge slider in Portfolio Allocation to enable hedging" (14px, gray)
- Arrow or visual pointing toward the global controls widget

---

VISUAL NOTES:
- Leverage pills are large and easy to tap (min 48px height)
- Position summary updates in real-time as leverage changes
- Funding rate has live indicator to show it's real data
- Green accent for positive funding (earning money)
- Clear visual hierarchy: leverage choice → position details → funding income
- Info card is subtle, doesn't distract from main configuration
```

---

## Prompt 5: Results Tab

```
Design the "Results" tab content for a DeFi Yield Simulator. This page displays portfolio performance metrics and interactive charts.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold hero numbers
- Rounded cards (16px), soft shadows
- Charts are clean and minimal

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Success: #2D6B4F
- Danger: #8B0000
- Warning: #B8860B
- Chart colors: Purple #48104a, Light Purple #9B6B9B, Green #2D6B4F, Gray #6B7280

---

PAGE HEADER:
- Title: "Portfolio Results" (24px, bold)
- Subtitle: "Projected returns based on your allocation" (14px, gray)

---

ROW 1 - EXPECTED BALANCE (full width, standalone hero card):
- Card: White, rounded 16px, padding 32px
- Full width spanning the entire content area

Layout (horizontal, space-between):
- Left side:
  - Label: "Expected Balance" (14px, gray)
  - Value: "$1,080,690" (56px, bold, purple) - largest hero number
  - Subtext: "After 1 year" (14px, gray)

- Right side (breakdown):
  - "ETH: 176.5 ETH → 181.2 ETH (+4.7 ETH)" (16px)
    - Change amount in green if positive, red if negative
  - "→ $677,280" (14px, gray) - USD value at scenario price
  - "USD: $400,000 → $433,220 (+$33,220)" (16px)
    - Change amount in green if positive, red if negative

---

ROW 2 - TOTAL RETURN + APY (two cards side by side):

LEFT CARD - Total Return (~60% width):
- Label: "Total Return" (14px, gray)
- Value: "+$80,690 (+8.1%)" (42px, bold, green #2D6B4F)
- Subtext: "Including +10% ETH scenario" (12px, gray)

RIGHT CARD - Portfolio APY (~40% width):
- Label: "Portfolio APY" (14px, gray)
- Value: "4.12%" (42px, bold, purple)
- Subtext: "Blended yield rate" (12px, gray)
- Breakdown below (14px):
  - "ETH: 2.91%" (gray)
  - "Stablecoin: 5.82%" (gray)
- All APY info in ONE card, not separate cards

---

ROW 3 - RISK METRICS (single card, only visible if leverage active):
- Card: White, rounded 16px, padding 24px
- Title: "Risk Metrics" (16px, semibold)

Layout (horizontal, two sections):
- Left section:
  - Label: "Health Factor" (12px, gray)
  - Value: "1.56" (32px, bold)
  - Status: "Safe" (14px, green) - color-coded text only, NO gauge/chart
  - Color: Green if >1.5, Amber if 1.2-1.5, Red if <1.2

- Right section:
  - Label: "Liquidation Price" (12px, gray)
  - Value: "$2,176" (32px, bold)
  - Subtext: "-36% from current ($3,400)" (14px, amber)

Simple text layout, NO semicircle gauge or charts.

---

RETURN BREAKDOWN SECTION (Full width card):
- Card: White, rounded 16px, padded 24px
- Title: "Return Breakdown" (18px, semibold)
- Subtitle: "Click each category to see per-product details" (12px, gray)

Table layout with MIXED collapsed/expanded state (to show both states in design):

| Category                  | Amount              |
|---------------------------|---------------------|
| ETH Yield             [▴] | +4.7 ETH ($15,980)  |  ← EXPANDED
|   └ stETH                 | +2.8 ETH ($9,520)   |
|   └ weETH                 | +1.9 ETH ($6,460)   |
| ETH Price Impact (+10%)   | +$60,090            |  ← collapsed
| Stablecoin Yield      [▾] | +$17,000            |  ← collapsed
| Leverage Net          [▴] | +$780               |  ← EXPANDED
|   └ Maple USDC yield      | +$4,080             |
|   └ USDC borrow cost      | -$3,300             |
| Hedge Net             [▾] | +$1,920             |  ← collapsed
|---------------------------|---------------------|
| **Total Return**          | **+$80,690**        |

Row styling:
- Each row: flex between, padding 12px 0, border-bottom light gray
- Category name: 14px, semibold, gray-900
- Amount: 14px, tabular-nums, color-coded (green positive, red negative)
- [▾] collapse icon / [▴] expand icon: gray, rotates when toggled
- Total row: bold, larger text (16px), top border darker

Expanded row styling:
- Indented with └ prefix or left padding (24px)
- Slightly smaller text (13px)
- Lighter gray text color
- No border between sub-rows
- Background: very light gray (#FAFAFA) for expanded section

ETH amounts displayed as: "2.8 ETH ($9,520)" - ETH unit first in purple, USD in gray

Color coding:
- Positive amounts: #2D6B4F (green)
- Negative amounts: #8B0000 (red)
- Neutral/labels: #6B7280 (gray)
- ETH amounts: #48104a (purple)

---

ALLOCATION SECTION (Full width card):
- Card: White, rounded 16px, padded 24px
- Two parts side by side (50/50 split)

LEFT - Pie Chart (50% width):
- Title: "Allocation by Category" (16px, semibold)
- MUST SHOW the actual donut chart, not empty space
- Donut chart with 3 segments and visible GAPS between them:
  - ETH segment: purple #48104a, 60% of chart
    - SELECTED state: full opacity, slightly pulled out from center
  - Stablecoin segment: light purple #9B6B9B, 32% of chart
    - UNSELECTED state: 50% opacity, normal position
  - Hedge segment: gray #6B7280, 8% of chart
    - UNSELECTED state: 50% opacity, normal position
- Show ETH as the currently selected segment
- Legend below chart:
  - (purple dot) ETH | (light purple dot) Stablecoin | (gray dot) Hedge

RIGHT - Category Breakdown (50% width):
- Title: "ETH Breakdown" (16px, semibold) - dynamic based on selected pie segment
- Table showing protocols within selected category

| Protocol                | Allocation | Amount                  |
|-------------------------|------------|-------------------------|
| [Lido logo] stETH       | 60%        | 105.9 ETH ($360,000)    |
| [Ether.fi logo] weETH   | 40%        | 70.6 ETH ($240,000)     |

Row details:
- Protocol logo: 24px circle with protocol icon
- Protocol name: 14px, semibold
- Allocation: percentage with small mini-pie indicator
- Amount: ETH units in purple bold, USD in gray parentheses
  - Format: "105.9 ETH ($360,000)"
- Subtle hover state (light gray background)

When Stablecoin selected (shows USD amounts only):
| Protocol                  | Allocation | Amount    |
|---------------------------|------------|-----------|
| [Maple logo] Syrup USDC   | 40%        | $160,000  |
| [Aave logo] USDC          | 30%        | $120,000  |
| [Morpho logo] steakUSDC   | 30%        | $120,000  |

When Hedge selected:
| Protocol                  | Allocation | Amount   |
|---------------------------|------------|----------|
| [Hyperliquid logo] Short  | 100%       | $80,000  |

INTERACTION:
- Click pie segment → right side updates to show that category's breakdown
- Selected segment: full opacity, pulled out
- Unselected segments: 50% opacity

---

VISUAL NOTES:
- Expected Balance is the first and largest hero card (full width)
- Total Return and APY are on the same row below
- APY card combines ETH APY, Stablecoin APY, and Portfolio APY in ONE card
- Risk Metrics merges Health Factor and Liquidation Price in ONE card, simple text only
- Return Breakdown shows mixed expanded/collapsed states as example
- ETH amounts always show ETH unit first, then USD: "4.7 ETH ($15,980)"
- Pie chart MUST be visible with 3 colored segments
- Pie chart has one segment selected (pulled out, full opacity), others faded
- All numbers formatted with commas and appropriate decimals
```

---

## Prompt 6: Leverage Configuration Modal

```
Design a Leverage Configuration Modal for the DeFi Yield Simulator. This modal appears when user clicks "Leverage" button on an ETH product.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Modal with semi-transparent dark backdrop
- Rounded corners (20px)
- Generous padding and spacing

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Success: #2D6B4F
- Warning: #B8860B
- Danger: #8B0000

---

MODAL CONTAINER:
- Centered on screen
- Width: 480px
- White background, rounded 20px
- Padding: 32px
- Subtle drop shadow
- Backdrop: black at 50% opacity

---

MODAL HEADER:
- Title: "Configure Leverage" (24px, bold)
- Subtitle: "weETH · $240,000 position" (16px, gray)
- Close button (X) in top right corner (gray, hover: black)

---

FORM SECTIONS (vertical stack, 32px gap):

SECTION 1 - COLLATERAL AMOUNT:
- Label: "Collateral Percentage" (14px, semibold)
- Slider: 0% to 100%
- Slider track: gray, filled portion purple
- Thumb: white circle with shadow
- Value display: "50%" (right side of slider)
- Below: "Using $120,000 as collateral" (14px, gray)

SECTION 2 - LOAN-TO-VALUE:
- Label: "Loan-to-Value (LTV)" (14px, semibold)
- Helper: "Max 75% for weETH" (12px, gray)
- Slider: 0% to 75%
- Slider zones (visual background):
  - 0-50%: subtle green tint
  - 50-65%: subtle amber tint
  - 65-75%: subtle red tint
- Value display: "60%"
- Below: "Borrowing $72,000" (14px, gray)

SECTION 3 - BORROW ASSET:
- Label: "Borrow Asset" (14px, semibold)
- Two pill buttons side by side:
  - "USDC" (selected: purple bg, white text)
  - "USDe" (unselected: gray outline)
- Below selected: "Borrow rate: ~4.7% APY" (14px, gray)

SECTION 4 - DEPLOY TO:
- Label: "Deploy Borrowed Funds To" (14px, semibold)
- Dropdown select (full width):
  - Rounded border, gray
  - Selected: "Maple Syrup USDC - 6.8% APY"
  - Dropdown shows list of stablecoin products with APYs

---

IMPACT SUMMARY CARD (highlighted):
- Background: light purple (#f9f7fa)
- Rounded 12px
- Padding: 20px
- Title: "Leverage Impact" (16px, semibold)

Two rows of metrics:

Row 1:
- "Borrowed" → "$72,000"
- "Net Spread" → "+2.1%" (green, deploy APY minus borrow rate)
- "Annual Boost" → "+$1,512" (green)

Row 2:
- "Health Factor" → "1.56" (green badge if >1.5)
- "Liquidation Price" → "$2,176 (-36%)" (amber text)

---

MODAL FOOTER:
- Left: "Remove Leverage" link (red text, only if editing existing)
- Right: Two buttons
  - "Cancel" (outline, gray)
  - "Apply" (solid purple)

---

VISUAL NOTES:
- Sliders are large and easy to drag
- Real-time updates as user adjusts sliders
- Color-coded risk zones on LTV slider
- Impact summary updates live
- Clean transitions and hover states
- Modal is scrollable if content exceeds viewport
```

---

## Usage Instructions

1. **Prompt 1**: Generate the global layout shell (header, controls bar, sidebar, content area)
2. **Prompt 2**: Generate the ETH Products tab content
3. **Prompt 3**: Generate the Stablecoin Products tab content
4. **Prompt 4**: Generate the Hedge tab content
5. **Prompt 5**: Generate the Results tab content
6. **Prompt 6**: Generate the Leverage Configuration modal

Each prompt builds on the same design system for visual consistency. Generate in order, then combine into a cohesive application.
