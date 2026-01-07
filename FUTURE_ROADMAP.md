# Blue Lake DeFi Simulator - Feature Roadmap

> **문서 목적**: 신규 기능 기획 및 우선순위 정의
> **작성일**: 2026-01-05
> **대상 사용자**: DeFi 파워유저 ~ 기관 투자자

---

## Executive Summary

현재 Blue Lake 시뮬레이터는 ETH/Stablecoin 포트폴리오의 단순 수익률 계산에 집중되어 있다. 기관급 자산운용 도구로 진화하기 위해 다음 기능들이 필요하다:

| 우선순위 | 기능                 | 핵심 가치                       | 예상 기간 |
| -------- | -------------------- | ------------------------------- | --------- |
| **P0**   | 가상 지갑 UI         | 복잡한 전략 시뮬레이션의 기반   | 3-4주     |
| **P1**   | Rebalancing Strategy | 기관급 리스크 관리              | 4-5주     |
| **P2**   | Backtesting MVP      | 전략 검증 및 신뢰성 확보        | 4-6주     |
| **P3**   | Strategy Management  | 사용자 retention, 네트워크 효과 | 2-3주     |
| 후순위   | On-chain Vault       | 실제 수익 창출 (별도 프로젝트)  | TBD       |
| 후순위   | Responsive Design    | 사용자층 확장 시                | 2주       |

---

## P0: Virtual Wallet UI

### 개요

현재 시뮬레이터는 `투자금 → ETH/Stable 비율 → 상품별 weight` 구조로, 실제 DeFi 워크플로우와 괴리가 있다. 가상 지갑을 도입하여 토큰 보유 → 스왑 → 예치 → 담보/차입의 실제 흐름을 반영한다.

### 현재 구조의 한계

```
현재:
  $100,000 투자
    ├── 60% ETH → wstETH 상품에 weight 분배
    ├── 30% Stable → USDC 상품에 weight 분배
    └── 10% Hedge → Hyperliquid short

문제점:
  - wstETH 담보로 ETH를 빌리는 전략 불가
  - Multi-hop leverage (looping) 시뮬레이션 불가
  - Cross-protocol 전략 표현 불가
  - 부분 담보 설정 불가
```

### 목표 구조

**아키텍처 결정: Strategy 중심 설계**

각 Strategy가 독립된 가상 포트폴리오를 가짐. Assets/Positions/Dashboard가 Strategy별로 분리되어, 동일 자본으로 완전히 다른 배분을 독립적으로 테스트하고 비교 가능.

```
Strategy A                Strategy B
├── Assets ($500K)        ├── Assets ($500K)
├── Positions             ├── Positions
├── Rebalancing Rules     ├── Rebalancing Rules
└── APY Dashboard         └── APY Dashboard
```

### 핵심 Use Cases

| Use Case                | 설명                                         | 현재 가능 여부 |
| ----------------------- | -------------------------------------------- | -------------- |
| wstETH → ETH 차입       | ETH staking yield + 추가 ETH 투자            | ❌             |
| Looping (재귀 레버리지) | wstETH 담보 → USDC 차입 → wstETH 스왑 → 반복 | ❌             |
| Cross-protocol          | Aave에 담보, Morpho에서 차입                 | ❌             |
| Partial collateral      | 보유 wstETH 중 일부만 담보 설정              | ❌             |
| Delta-neutral farming   | Long ETH + Short ETH hedge                   | ⚠️ 제한적      |

### 데이터 모델

```typescript
interface VirtualWallet {
  balances: TokenBalance[];
  positions: Position[];
}

interface TokenBalance {
  token: Token;
  amount: number;
  valueUSD: number;
}

interface Token {
  id: string; // 'eth', 'wsteth', 'usdc'
  symbol: string;
  price: number;
  isCollateralEligible: boolean;
  isBorrowable: boolean;
  protocols: string[]; // ['aave', 'morpho']
}

interface Position {
  id: string;
  protocol: Protocol;
  type: "deposit" | "borrow" | "lp" | "hedge";

  // Deposit/Lending
  depositedToken?: Token;
  depositedAmount?: number;
  apy?: number;

  // Collateral & Borrow
  collateral?: CollateralPosition[];
  borrowed?: BorrowPosition[];
  healthFactor?: number;
  liquidationPrice?: number;

  // Hedge (Perp)
  margin?: number;
  leverage?: number;
  direction?: "long" | "short";
  fundingRate?: number;
}

interface CollateralPosition {
  token: Token;
  amount: number;
  maxLTV: number;
  liquidationThreshold: number;
}

interface BorrowPosition {
  token: Token;
  amount: number;
  borrowRate: number;
}
```

### 주요 기능

#### 1. 토큰 관리

- 초기 토큰 설정 (USDC 또는 ETH로 시작)
- 가상 스왑 (price impact, slippage 시뮬레이션)
- 토큰 가격 실시간/수동 업데이트

#### 2. 포지션 관리

- 프로토콜별 예치/인출
- 담보 설정/해제
- 차입/상환
- Health factor 실시간 계산

#### 3. 시나리오 시뮬레이션

- 가격 변동 시 전체 포트폴리오 영향
- 청산 가격 계산
- 연간 수익률 추정

### 구현 복잡도

| 컴포넌트            | 복잡도 | 설명                      |
| ------------------- | ------ | ------------------------- |
| Token Balance State | 중     | Zustand store 확장        |
| Virtual Swap Logic  | 중     | 가격 영향, 슬리피지 계산  |
| Position Management | 상     | 다양한 position 타입 처리 |
| Health Factor Calc  | 중     | 기존 로직 확장            |
| UI Components       | 중     | 새로운 레이아웃 필요      |

### 차별화 포인트

| 기존 도구  | Blue Lake 차별점    |
| ---------- | ------------------- | ----------------------------------- |
| DeFi Saver | 실제 지갑 연동 필요 | 시뮬레이션 전용, 리스크 없이 테스트 |
| DeBank     | 포트폴리오 추적만   | 미래 시나리오 시뮬레이션            |
| Instadapp  | 실행 중심           | 전략 설계 및 백테스팅 중심          |

### 타겟 사용자별 가치

| 사용자층      | 가치                              |
| ------------- | --------------------------------- |
| DeFi 파워유저 | 복잡한 전략을 실제 실행 전 테스트 |
| 기관 투자자   | 전략 설계 및 리스크 평가 도구     |
| 신규 사용자   | DeFi 학습 도구 (리스크 없이 체험) |

---

## P1: Rebalancing Strategy

### 개요

기관 자산운용의 핵심인 리밸런싱 전략을 시뮬레이터에 통합한다. 사용자가 전략을 설정하면, 시뮬레이션 기간 동안 자동으로 리밸런싱이 적용된 결과를 확인할 수 있다.

### 구현 우선순위

#### Phase 1: 기본 전략 (MVP)

| 순위  | 전략                  | 설명                                        | 파라미터                          |
| ----- | --------------------- | ------------------------------------------- | --------------------------------- |
| **1** | Calendar-based        | 정해진 주기로 리밸런싱                      | `frequency`: daily/weekly/monthly |
| **2** | Threshold-based       | 목표 비율에서 X% 벗어나면 리밸런싱          | `threshold`: 3-10%                |
| **3** | Health Factor Trigger | HF가 임계값 이하로 떨어지면 자동 deleverage | `minHF`: 1.2-1.5                  |

#### Phase 2: 고급 전략

| 순위  | 전략                 | 설명                                               | 파라미터                         |
| ----- | -------------------- | -------------------------------------------------- | -------------------------------- |
| **4** | Hybrid               | Calendar 주기로 검토 + Threshold 초과 시 즉시 실행 | `frequency` + `threshold`        |
| **5** | Concentration Limits | 단일 프로토콜/자산에 최대 노출 제한                | `maxPerProtocol`: 30-50%         |
| **6** | Volatility-adaptive  | 변동성 증가 시 threshold 자동 축소                 | `baseThreshold`, `volMultiplier` |

#### Phase 3: 전문가 전략

| 순위  | 전략                 | 설명                                    | 파라미터                     |
| ----- | -------------------- | --------------------------------------- | ---------------------------- |
| **7** | Risk Parity          | 각 자산이 동일한 위험을 기여하도록 조정 | `targetVol`: 10-15%          |
| **8** | Protocol TVL Trigger | TVL 급락 시 자동 exit                   | `minTVL`, `tvlDropThreshold` |

### 데이터 모델

```typescript
interface RebalancingStrategy {
  id: string;
  name: string;
  enabled: boolean;
  rules: RebalancingRule[];
  executionLog?: RebalancingEvent[];
}

interface RebalancingRule {
  type: RebalancingType;
  priority: number; // 낮을수록 먼저 평가
  params: RebalancingParams;
  action: RebalancingAction;
}

type RebalancingType =
  | "calendar"
  | "threshold"
  | "healthFactor"
  | "hybrid"
  | "concentration"
  | "volatility"
  | "riskParity"
  | "protocolTVL";

interface CalendarParams {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-28 for monthly
}

interface ThresholdParams {
  threshold: number; // 0.03 = 3%
  checkFrequency: "realtime" | "hourly" | "daily";
}

interface HealthFactorParams {
  minHealthFactor: number; // 1.3
  targetHealthFactor: number; // 1.8 (deleverage 목표)
  deleverageStep: number; // 10% 씩 deleverage
}

interface HybridParams extends CalendarParams, ThresholdParams {
  // Calendar 주기로 검토, threshold 초과 시 즉시 실행
}

interface ConcentrationParams {
  maxPerProtocol: number; // 0.3 = 30%
  maxPerAsset: number; // 0.4 = 40%
  maxPerYieldSource: number; // 0.5 = 50%
}

interface VolatilityParams {
  baseThreshold: number; // 기본 threshold (5%)
  volLookback: number; // 변동성 계산 기간 (days)
  volMultiplier: number; // 변동성 1% 증가당 threshold 감소율
  minThreshold: number; // 최소 threshold (2%)
  maxThreshold: number; // 최대 threshold (10%)
}

interface RiskParityParams {
  targetPortfolioVol: number; // 목표 포트폴리오 변동성
  volLookback: number; // 변동성 계산 기간
  rebalanceFrequency: "weekly" | "monthly";
}

interface ProtocolTVLParams {
  minAbsoluteTVL: number; // 최소 TVL ($)
  tvlDropThreshold: number; // TVL 하락률 임계값 (0.3 = 30%)
  tvlLookback: number; // 비교 기간 (days)
}

type RebalancingAction =
  | { type: "rebalanceToTarget" }
  | { type: "deleverage"; amount: number }
  | { type: "exitProtocol"; protocolId: string }
  | { type: "reduceExposure"; assetId: string; targetPercent: number };

interface RebalancingEvent {
  timestamp: Date;
  rule: RebalancingRule;
  trigger: string; // "ETH allocation drifted to 68% (target: 60%)"
  actionsTaken: string[];
  beforeState: PortfolioSnapshot;
  afterState: PortfolioSnapshot;
  estimatedCost: number; // 거래 비용
}
```

### 시뮬레이션 로직

```typescript
function simulateRebalancing(
  portfolio: Portfolio,
  strategy: RebalancingStrategy,
  priceHistory: PriceData[],
  period: { start: Date; end: Date }
): SimulationResult {
  let currentPortfolio = { ...portfolio };
  const events: RebalancingEvent[] = [];

  for (const day of eachDay(period)) {
    const prices = priceHistory.find((p) => p.date === day);

    // 포트폴리오 가치 업데이트
    currentPortfolio = updatePortfolioValues(currentPortfolio, prices);

    // 각 규칙 평가 (우선순위 순)
    for (const rule of strategy.rules.sort((a, b) => a.priority - b.priority)) {
      if (!rule.enabled) continue;

      const shouldTrigger = evaluateRule(rule, currentPortfolio, day, prices);

      if (shouldTrigger) {
        const event = executeRebalancing(rule, currentPortfolio, prices);
        events.push(event);
        currentPortfolio = event.afterState;
        break; // 하루에 하나의 리밸런싱만
      }
    }
  }

  return {
    finalPortfolio: currentPortfolio,
    events,
    metrics: calculateMetrics(events, portfolio, currentPortfolio),
  };
}
```

### 구현 복잡도

| 컴포넌트            | 복잡도 | 설명                          |
| ------------------- | ------ | ----------------------------- |
| Rule Engine         | 중     | 각 규칙 타입별 평가 로직      |
| Calendar Logic      | 하     | 단순 날짜 비교                |
| Threshold Logic     | 중     | 현재 vs 목표 allocation 비교  |
| Health Factor Guard | 중     | 기존 HF 로직 확장             |
| Simulation Loop     | 상     | 일별 시뮬레이션 + 이벤트 처리 |
| Cost Estimation     | 중     | 거래 비용 모델링              |

### 차별화 포인트

| 기존 도구  | Blue Lake 차별점                  |
| ---------- | --------------------------------- | --------------------------------- |
| Glider.fi  | 실제 실행 중심, 시뮬레이션 제한적 | 전략 테스트 후 최적 파라미터 도출 |
| DeFi Saver | 단순 자동화                       | 다양한 전략 조합 및 비교          |
| 수동 관리  | 감정적 결정                       | 규칙 기반 일관된 실행             |

---

## P2: Backtesting MVP

### 개요

설정된 포트폴리오와 리밸런싱 전략을 과거 데이터로 검증한다. 완전한 historical APY 시뮬레이션은 복잡하므로, MVP는 가격 기반 백테스팅에 집중한다.

### MVP 범위

#### 포함 (MVP)

- ETH 가격 변동에 따른 포트폴리오 가치 변화
- 리밸런싱 전략 적용 시뮬레이션
- 주요 메트릭: 총 수익률, 최대 낙폭, Sharpe ratio
- 벤치마크 비교 (ETH only, 60/40 등)

#### 미포함 (향후)

- Historical APY 변동 반영
- Protocol-specific 이벤트 (해킹, 디페깅 등)
- 유동성 변동
- 실제 거래 비용 (gas, slippage)

### 데이터 소스

| 데이터          | 소스                           | 주기   |
| --------------- | ------------------------------ | ------ |
| ETH 가격        | CoinGecko Historical API       | Daily  |
| 주요 토큰 가격  | CoinGecko                      | Daily  |
| APY (고정 가정) | 현재 APY 사용 또는 사용자 입력 | Static |

### 데이터 모델

```typescript
interface BacktestConfig {
  portfolio: Portfolio;
  strategy: RebalancingStrategy;
  period: {
    start: Date; // e.g., '2023-01-01'
    end: Date; // e.g., '2025-12-31'
  };
  initialInvestment: number;
  benchmarks: Benchmark[];
  assumptions: {
    apyMode: "current" | "custom" | "average";
    customAPYs?: Record<string, number>;
    transactionCost: number; // basis points
  };
}

interface Benchmark {
  id: string;
  name: string;
  allocation: Record<string, number>; // { 'eth': 1.0 } for ETH only
}

interface BacktestResult {
  portfolioHistory: DailySnapshot[];
  benchmarkHistories: Record<string, DailySnapshot[]>;
  rebalancingEvents: RebalancingEvent[];
  metrics: BacktestMetrics;
}

interface DailySnapshot {
  date: Date;
  totalValue: number;
  allocation: Record<string, number>;
  dailyReturn: number;
  cumulativeReturn: number;
}

interface BacktestMetrics {
  // 수익률
  totalReturn: number;
  annualizedReturn: number;

  // 리스크
  volatility: number;
  maxDrawdown: number;
  maxDrawdownDuration: number; // days

  // 리스크 조정 수익률
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;

  // 리밸런싱
  totalRebalancingEvents: number;
  totalRebalancingCost: number;

  // vs Benchmark
  alpha: number;
  beta: number;
  trackingError: number;
}
```

### 구현 복잡도

| 컴포넌트               | 복잡도 | 설명           |
| ---------------------- | ------ | -------------- |
| Historical Price Fetch | 하     | CoinGecko API  |
| Daily Simulation Loop  | 중     | P1 로직 재활용 |
| Metrics Calculation    | 중     | 표준 금융 공식 |
| Chart Visualization    | 중     | Recharts 활용  |
| Benchmark Comparison   | 하     | 동일 로직 적용 |

### 한계 및 주의사항

```
⚠️ Backtest 결과 해석 시 주의사항

1. APY는 고정 가정
   - 실제 DeFi APY는 시간에 따라 크게 변동
   - 현재 APY를 과거에 적용하는 것은 비현실적

2. 거래 비용 단순화
   - 실제 gas 비용, slippage 미반영
   - 유동성 제약 미반영

3. 프로토콜 리스크 미반영
   - 해킹, 디페깅 이벤트 제외
   - Smart contract risk 미반영

4. Survivorship bias
   - 현재 존재하는 프로토콜만 테스트 가능
   - 실패한 프로토콜 데이터 없음

이 백테스트는 참고용이며, 실제 투자 결과와 다를 수 있습니다.
```

---

## P3: Strategy Management System

### 개요

사용자가 전략을 저장, 비교, 공유할 수 있는 시스템. 네트워크 효과를 통한 사용자 acquisition과 retention 강화가 목표.

### 핵심 기능

| 기능        | 설명                    | 우선순위     |
| ----------- | ----------------------- | ------------ |
| Save        | 전략을 프로필에 저장    | Must         |
| Load        | 저장된 전략 불러오기    | Must         |
| Compare     | 2개 이상 전략 성과 비교 | Should       |
| Export      | JSON/URL로 내보내기     | Should       |
| Share       | 공개/비공개 링크 생성   | Could        |
| Fork        | 타인 전략 복사 후 수정  | Could        |
| Leaderboard | 수익률/Sharpe 기준 랭킹 | Nice to have |

### 데이터 모델

```typescript
interface SavedStrategy {
  id: string;
  userId: string;
  name: string;
  description?: string;

  // 전략 내용
  portfolio: Portfolio;
  rebalancingStrategy: RebalancingStrategy;

  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];

  // 통계 (백테스트 결과)
  metrics?: {
    backtestPeriod: { start: Date; end: Date };
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };

  // 소셜
  forkCount: number;
  viewCount: number;
  originalStrategyId?: string; // forked from
}

interface StrategyComparison {
  strategies: SavedStrategy[];
  commonPeriod: { start: Date; end: Date };
  results: BacktestResult[];
  ranking: {
    byReturn: string[]; // strategy IDs
    bySharpe: string[];
    byMaxDrawdown: string[];
  };
}
```

### 기술 스택

| 요구사항      | 솔루션                                |
| ------------- | ------------------------------------- |
| 사용자 인증   | Supabase Auth (Google, Email)         |
| 데이터베이스  | Supabase PostgreSQL                   |
| 파일 스토리지 | Supabase Storage (백테스트 결과 캐싱) |
| 실시간 기능   | Supabase Realtime (선택적)            |

### 구현 복잡도

| 컴포넌트            | 복잡도 | 설명                       |
| ------------------- | ------ | -------------------------- |
| Supabase Setup      | 하     | 프로젝트 생성, 스키마 정의 |
| Auth Integration    | 중     | OAuth 플로우               |
| CRUD Operations     | 하     | 표준 Supabase 쿼리         |
| Strategy Comparison | 중     | 다중 백테스트 실행         |
| Sharing/Forking     | 중     | 권한 관리, URL 생성        |

---

## 후순위: On-chain Vault

### 개요

시뮬레이터에서 설계한 전략을 실제 on-chain vault로 배포하여 수익을 창출한다. 이는 Blue Lake의 궁극적 비즈니스 모델이지만, 리스크 모니터링 역량 확보 후 별도 프로젝트로 진행한다.

### 플랫폼 옵션

| 플랫폼       | 특징                                                     | 적합성                         |
| ------------ | -------------------------------------------------------- | ------------------------------ |
| **Morpho**   | Permissionless vault 생성, UI listing은 whitelisted only | 진입장벽 낮음, 시작점으로 적합 |
| **Euler V2** | 가장 유연한 전략 구성, Aave/Morpho 스타일 모두 구현 가능 | 복잡한 전략에 적합             |
| **Veda**     | $3.5B+ TVL, 대규모 파트너십 필요                         | 규모 성장 후 고려              |

### Morpho Curator 경로

```
Phase 1: 준비
├── Vault 생성 (Permissionless)
├── 초기 자본 투입 (seed liquidity)
├── Third-party에서 노출 (DeBank, Zapper)
└── Track record 구축 (3-6개월)

Phase 2: 성장
├── TVL 성장
├── 커뮤니티 빌딩
├── Risk 모니터링 체계 구축
└── Morpho 팀 접촉 및 listing 신청

Phase 3: 확장
├── Morpho UI listing
├── 추가 vault 출시
└── Euler V2 등 타 플랫폼 확장
```

### 필요 역량

| 역량                 | 현재 수준 | 목표                 |
| -------------------- | --------- | -------------------- |
| Risk Monitoring      | 미구축    | 24/7 모니터링 시스템 |
| Smart Contract       | 미구축    | 기본 이해 + 감사     |
| Liquidation Handling | 미구축    | 자동화된 청산 대응   |
| Governance           | 미구축    | Multisig 설정        |

---

## 후순위: Responsive Design

### 개요

현재 데스크톱 전용 UI를 모바일/태블릿에서도 사용 가능하게 한다.

### 타겟 사용자별 필요성

| 사용자층      | 모바일 필요성 | 이유                                |
| ------------- | ------------- | ----------------------------------- |
| 기관 투자자   | 낮음          | 대부분 데스크톱 환경에서 분석       |
| DeFi 파워유저 | 중간          | 모바일로 확인, 주요 작업은 데스크톱 |
| 일반 사용자   | 높음          | 모바일 우선                         |

### 현재 기술 스택 호환성

- Tailwind CSS 사용 중 → responsive 클래스 추가로 대응 가능
- 복잡한 테이블/차트 → 모바일 UX 재설계 필요

### 구현 접근

```
Phase 1: 기본 반응형
├── 레이아웃 breakpoint 설정
├── 네비게이션 모바일 메뉴
└── 기본 컴포넌트 반응형 처리

Phase 2: 모바일 최적화
├── 복잡한 테이블 → 카드 뷰 전환
├── 차트 터치 인터랙션
└── 입력 폼 모바일 UX 개선
```

---

## 구현 타임라인

```
Week 1-2: P0 Virtual Wallet UI
├── 데이터 모델 + 토큰 관리
└── 포지션 관리 (Aave/Morpho)

Week 3-4: P1 Rebalancing Phase 1
├── Calendar-based + Threshold-based
└── Health Factor Trigger

Week 5-6: P1 Rebalancing Phase 2 + P2 Backtesting MVP
├── Hybrid, Concentration, Volatility-adaptive
└── Historical price 연동 + 시뮬레이션 엔진

Week 7-8: P2 Backtesting 완성 + P3 Strategy Management
├── 결과 시각화 + 메트릭 계산
└── Supabase 연동, Save/Load/Compare

Week 9+: 고도화 및 B2C 준비
├── Rebalancing Phase 3 (Risk Parity, TVL Trigger)
├── Monetization 연동
└── On-chain Vault 준비 (별도 트랙)
```

**예상 MVP 완성: 8주 (2개월)**

---

## Monetization (B2C 확장)

### 개요

MVP 완성 후 retail 사용자에게 유료 서비스로 제공. 동일 코드베이스에서 인증/결제 레이어 추가로 확장.

### 수익 모델 옵션

| 모델              | 장점                          | 단점             | 적합도     |
| ----------------- | ----------------------------- | ---------------- | ---------- |
| **Freemium**      | 사용자 획득 용이, 바이럴 가능 | 전환율 관리 필요 | ⭐⭐⭐⭐⭐ |
| **Subscription**  | 예측 가능한 수익              | 초기 진입장벽    | ⭐⭐⭐⭐   |
| **Pay-as-you-go** | 사용량 비례 과금, 공정함      | 수익 예측 어려움 | ⭐⭐⭐     |

### Freemium Tier 설계 (권장)

| 기능          | Free     | Pro ($19/mo) | Team ($49/mo) |
| ------------- | -------- | ------------ | ------------- |
| 시뮬레이션    | ✓        | ✓            | ✓             |
| 리밸런싱 전략 | 기본 3개 | 전체         | 전체          |
| 백테스트      | 1년      | 5년          | 무제한        |
| 백테스트 실행 | 5회/일   | 50회/일      | 무제한        |
| 저장 전략     | 3개      | 20개         | 무제한        |
| 전략 공유     | -        | ✓            | ✓             |
| 팀 협업       | -        | -            | ✓             |
| API 접근      | -        | -            | ✓             |

### 기술 요구사항

| 컴포넌트       | 솔루션            | 복잡도           |
| -------------- | ----------------- | ---------------- |
| 인증           | Supabase Auth     | 하 (P3에서 구현) |
| 결제           | Stripe            | 중               |
| Usage Metering | Custom + Supabase | 중               |
| Feature Gating | Middleware        | 하               |

### 추가 고려사항

| 영역           | 내용                                              |
| -------------- | ------------------------------------------------- |
| **Legal**      | Terms of Service, Privacy Policy, 투자 disclaimer |
| **Onboarding** | 신규 사용자 튜토리얼, 샘플 전략                   |
| **Support**    | FAQ, Documentation, 피드백 채널                   |
| **Analytics**  | 사용 패턴 추적, 전환 퍼널 분석                    |

### 구현 타이밍

MVP 완성 (Week 8) 후 2-3주 추가 작업:

- Stripe 연동
- Tier별 기능 제한 로직
- 결제 UI
- Legal 문서

---

## 리스크 및 완화 방안

| 리스크                 | 영향          | 완화 방안                         |
| ---------------------- | ------------- | --------------------------------- |
| 복잡성 증가로 UX 저하  | 사용자 이탈   | 단계별 온보딩, 프리셋 제공        |
| 백테스트 결과 오해     | 법적 리스크   | 명확한 disclaimer, 제한사항 고지  |
| 시뮬레이션 정확도 한계 | 신뢰도 저하   | 한계점 투명하게 공개, 점진적 개선 |
| 외부 API 의존성        | 서비스 안정성 | 캐싱, fallback 로직, 다중 소스    |

---

_문서 버전: 1.0_
_최종 업데이트: 2026-01-05_
