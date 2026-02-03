# Meteora Yield Monitor API Documentation

## Overview

The Meteora Yield Monitor provides a comprehensive TypeScript SDK for monitoring yield opportunities on Meteora DLMM pools, with integrations for Solana wallet connections, Jupiter swaps, and SAID identity verification.

## Installation

```bash
npm install
npm run dev
```

## Core Modules

### 1. Meteora API Client (`lib/meteora-api.ts`)

#### `MeteoraApiClient`

Main client for fetching pool data from Meteora.

```typescript
import { meteoraApi } from './lib/meteora-api';

// Get all pools
const pools = await meteoraApi.getAllPools();

// Get specific pool
const pool = await meteoraApi.getPoolByAddress('pool_address');

// Filter by token
const solPools = await meteoraApi.getPoolsByToken('SOL');

// Get token price
const solPrice = await meteoraApi.getTokenPrice('solana');

// Get historical data
const history = await meteoraApi.getHistoricalData('pool_address', 7);
```

#### Types

```typescript
interface MeteoraPool {
  address: string;
  name?: string;
  tokenX: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  tokenY: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  binStep: number;
  baseFee: number;
  tvl: number;
  volume24h: number;
  volume7d?: number;
  fees24h?: number;
  apr: number;
  apy?: number;
  yieldScore?: number;
}
```

### 2. Yield Calculator (`lib/yield-calculator.ts`)

#### `YieldCalculator`

Calculate yields, scores, and risk assessments.

```typescript
import { YieldCalculator } from './lib/yield-calculator';

// Calculate yield score (0-1000+)
const score = YieldCalculator.calculateYieldScore(pool);

// Calculate projected yields
const yields = YieldCalculator.calculateYields(pool, 1000); // $1000 investment

// Get APY from APR
const apy = YieldCalculator.calculateAPY(45); // 45% APR

// Format numbers
YieldCalculator.formatCurrency(1500000); // "$1.50M"
YieldCalculator.formatPercentage(45.5); // "45.50%"
```

#### Return Types

```typescript
interface YieldCalculation {
  pool: MeteoraPool;
  investment: number;
  dailyYield: number;
  monthlyYield: number;
  yearlyYield: number;
  impermanentLossRisk: 'low' | 'medium' | 'high';
}
```

### 3. Alert Manager (`lib/yield-calculator.ts`)

#### `AlertManager`

Detect market changes and generate alerts.

```typescript
import { AlertManager } from './lib/yield-calculator';

const config = {
  minApr: 20,
  minVolume: 100000,
  minTvl: 500000,
  volumeSpikeThreshold: 50,  // 50% increase
  tvlDropThreshold: 20,      // 20% drop
  enabled: true,
};

const alertManager = new AlertManager(config);

// Check pools for alerts
const newAlerts = alertManager.checkPools(pools);

// Get all alerts
const allAlerts = alertManager.getAlerts();

// Clear alerts
alertManager.clearAlerts();
```

#### Alert Types

```typescript
interface PoolAlert {
  id: string;
  poolAddress: string;
  type: 'high_apr' | 'volume_spike' | 'tvl_drop' | 'new_pool';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  data: Record<string, unknown>;
}
```

### 4. Jupiter Client (`lib/jupiter-client.ts`)

#### `JupiterClient`

Execute swaps via Jupiter aggregator.

```typescript
import { jupiterClient } from './lib/jupiter-client';

// Get swap quote
const quote = await jupiterClient.getQuote(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112',    // SOL
  1000000 // 1 USDC (6 decimals)
);

// Build transaction
const swapTx = await jupiterClient.buildSwapTransaction(
  quote,
  'user_wallet_address'
);

// Execute (requires wallet signer)
const signature = await jupiterClient.executeSwap(
  swapTx,
  signTransaction // From wallet
);

// Get token price
const price = await jupiterClient.getTokenPrice(mintAddress);
```

### 5. SAID Client (`lib/said-client.ts`)

#### `SAIDClient`

Verify agent identities and wallet reputation.

```typescript
import { saidClient } from './lib/said-client';

// Verify agent
const agentVerified = await saidClient.verifyAgent('said_string');

// Verify wallet
const walletVerified = await saidClient.verifyWallet('wallet_address');

// Get trust badge HTML
const badge = saidClient.getTrustBadge(750, 'md');
```

#### Return Types

```typescript
interface SAIDVerificationResult {
  isVerified: boolean;
  identity?: SAIDIdentity;
  trustScore: number;      // 0-1000
  riskLevel: 'low' | 'medium' | 'high';
}

interface SAIDIdentity {
  agentId: string;
  name: string;
  reputation: number;      // 0-100
  verified: boolean;
  badges: string[];
  createdAt: string;
}
```

## React Hooks

### `useAutoAlerts` (`hooks/useAutoAlerts.ts`)

Automated alert monitoring with browser notifications.

```typescript
import { useAutoAlerts, useNotifications } from './hooks/useAutoAlerts';

const { permission, requestPermission, notify } = useNotifications();

const { isRunning, start, stop, lastCheck } = useAutoAlerts({
  config: alertConfig,
  pools: pools,
  onAlert: (alert) => {
    console.log('New alert:', alert);
    notify('Yield Alert', { body: alert.message });
  },
});

// Start monitoring
start();

// Stop monitoring
stop();
```

## React Components

### PoolDashboard

Main dashboard with pool listings, filters, and charts.

```tsx
<PoolDashboard onRefresh={() => console.log('refreshed')} />
```

### AlertPanel

Display and manage alerts.

```tsx
<AlertPanel />
```

### YieldCalculatorPanel

Calculate projected yields.

```tsx
<YieldCalculatorPanel />
```

### WalletPanel

Wallet connection with SAID verification.

```tsx
<WalletPanel />
```

### PortfolioPanel

Track your positions and P&L.

```tsx
<PortfolioPanel />
```

### AutoInvestPanel

Execute automated investments via Jupiter.

```tsx
<AutoInvestPanel
  pool={selectedPool}
  investmentAmount={1000}
  onSuccess={(sig) => console.log('Success:', sig)}
/>
```

### PoolCard

Display individual pool information.

```tsx
<PoolCard pool={pool} rank={1} featured />
```

## Testing

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch
```

### Test Files

- `__tests__/yield-calculator.test.ts` - Yield calculation tests
- `__tests__/meteora-api.test.ts` - API client tests

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
```

## Common Tokens

```typescript
const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
};
```

## Error Handling

All async methods return `null` on error. Always check return values:

```typescript
const pools = await meteoraApi.getAllPools();
if (!pools) {
  // Handle error
  return;
}
// Use pools
```

## License

MIT
