export interface MeteoraPool {
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
  price?: number;
  liquidity?: number;
  isVerified?: boolean;
}

export interface PoolAlert {
  id: string;
  poolAddress: string;
  type: 'high_apr' | 'volume_spike' | 'tvl_drop' | 'new_pool';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface YieldCalculation {
  pool: MeteoraPool;
  investment: number;
  dailyYield: number;
  monthlyYield: number;
  yearlyYield: number;
  impermanentLossRisk: 'low' | 'medium' | 'high';
}

export interface UserPosition {
  poolAddress: string;
  tokenXAmount: number;
  tokenYAmount: number;
  entryPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

export interface AlertConfig {
  minApr: number;
  minVolume: number;
  minTvl: number;
  volumeSpikeThreshold: number;
  tvlDropThreshold: number;
  enabled: boolean;
}

export interface HistoricalDataPoint {
  timestamp: number;
  apr: number;
  tvl: number;
  volume24h: number;
  price: number;
}
