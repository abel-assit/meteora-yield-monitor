import { MeteoraPool, YieldCalculation, AlertConfig, PoolAlert } from '../types';

export class YieldCalculator {
  /**
   * Calculate yield score based on APR, volume efficiency, and TVL stability
   */
  static calculateYieldScore(pool: MeteoraPool): number {
    const apr = pool.apr || 0;
    const volume24h = pool.volume24h || 0;
    const tvl = pool.tvl || 0;

    if (tvl === 0) return 0;

    // Volume/TVL ratio indicates liquidity efficiency
    const volumeRatio = volume24h / tvl;
    
    // TVL factor - prefer pools with substantial but not excessive TVL
    // Sweet spot is $100k - $10M
    const tvlFactor = this.calculateTvlFactor(tvl);
    
    // Score formula
    const score = apr * (1 + volumeRatio * 10) * tvlFactor;
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Calculate TVL factor - optimal range is 100k to 10M
   */
  private static calculateTvlFactor(tvl: number): number {
    if (tvl < 50000) return 0.5; // Too small, risky
    if (tvl < 100000) return 0.8;
    if (tvl < 1000000) return 1.0; // Sweet spot
    if (tvl < 10000000) return 0.95;
    if (tvl < 50000000) return 0.9;
    return 0.85; // Very large, potentially lower yields
  }

  /**
   * Calculate estimated yields for an investment
   */
  static calculateYields(pool: MeteoraPool, investment: number): YieldCalculation {
    const apr = pool.apr || 0;
    const dailyYield = (investment * (apr / 100)) / 365;
    const monthlyYield = dailyYield * 30;
    const yearlyYield = investment * (apr / 100);

    // Estimate impermanent loss risk based on volatility
    const impermanentLossRisk = this.estimateImpermanentLossRisk(pool);

    return {
      pool,
      investment,
      dailyYield,
      monthlyYield,
      yearlyYield,
      impermanentLossRisk,
    };
  }

  /**
   * Estimate impermanent loss risk based on pool characteristics
   */
  private static estimateImpermanentLossRisk(pool: MeteoraPool): 'low' | 'medium' | 'high' {
    const volumeRatio = pool.tvl > 0 ? pool.volume24h / pool.tvl : 0;
    
    // High volume ratio = more volatility = higher IL risk
    if (volumeRatio > 0.5) return 'high';
    if (volumeRatio > 0.2) return 'medium';
    return 'low';
  }

  /**
   * Calculate APY from APR (assuming daily compounding)
   */
  static calculateAPY(apr: number): number {
    const dailyRate = apr / 100 / 365;
    const apy = (Math.pow(1 + dailyRate, 365) - 1) * 100;
    return Math.round(apy * 100) / 100;
  }

  /**
   * Format large numbers for display
   */
  static formatCurrency(value: number): string {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number, decimals = 2): string {
    return `${value.toFixed(decimals)}%`;
  }
}

export class AlertManager {
  private previousPools: Map<string, MeteoraPool> = new Map();
  private alerts: PoolAlert[] = [];

  constructor(private config: AlertConfig) {}

  /**
   * Check pools for alert conditions
   */
  checkPools(currentPools: MeteoraPool[]): PoolAlert[] {
    const newAlerts: PoolAlert[] = [];

    for (const pool of currentPools) {
      const prevPool = this.previousPools.get(pool.address);
      
      if (prevPool) {
        // Check for volume spike
        const volumeAlert = this.checkVolumeSpike(prevPool, pool);
        if (volumeAlert) newAlerts.push(volumeAlert);

        // Check for TVL drop
        const tvlAlert = this.checkTvlDrop(prevPool, pool);
        if (tvlAlert) newAlerts.push(tvlAlert);
      }

      // Check for high APR
      const aprAlert = this.checkHighApr(pool);
      if (aprAlert) newAlerts.push(aprAlert);

      this.previousPools.set(pool.address, pool);
    }

    this.alerts = [...newAlerts, ...this.alerts].slice(0, 100); // Keep last 100
    return newAlerts;
  }

  private checkVolumeSpike(prev: MeteoraPool, current: MeteoraPool): PoolAlert | null {
    if (prev.volume24h === 0) return null;
    
    const change = ((current.volume24h - prev.volume24h) / prev.volume24h) * 100;
    
    if (change >= this.config.volumeSpikeThreshold) {
      return {
        id: `vol-${Date.now()}-${current.address.slice(0, 8)}`,
        poolAddress: current.address,
        type: 'volume_spike',
        message: `${current.tokenX.symbol}-${current.tokenY.symbol} volume increased ${change.toFixed(1)}%`,
        severity: change > 100 ? 'critical' : 'warning',
        timestamp: Date.now(),
        data: { previousVolume: prev.volume24h, currentVolume: current.volume24h, change },
      };
    }
    return null;
  }

  private checkTvlDrop(prev: MeteoraPool, current: MeteoraPool): PoolAlert | null {
    if (prev.tvl === 0) return null;
    
    const drop = ((prev.tvl - current.tvl) / prev.tvl) * 100;
    
    if (drop >= this.config.tvlDropThreshold) {
      return {
        id: `tvl-${Date.now()}-${current.address.slice(0, 8)}`,
        poolAddress: current.address,
        type: 'tvl_drop',
        message: `${current.tokenX.symbol}-${current.tokenY.symbol} TVL dropped ${drop.toFixed(1)}%`,
        severity: drop > 50 ? 'critical' : 'warning',
        timestamp: Date.now(),
        data: { previousTvl: prev.tvl, currentTvl: current.tvl, drop },
      };
    }
    return null;
  }

  private checkHighApr(pool: MeteoraPool): PoolAlert | null {
    if (pool.apr >= this.config.minApr && !this.previousPools.has(pool.address)) {
      return {
        id: `apr-${Date.now()}-${pool.address.slice(0, 8)}`,
        poolAddress: pool.address,
        type: 'high_apr',
        message: `New high APR pool: ${pool.tokenX.symbol}-${pool.tokenY.symbol} at ${pool.apr.toFixed(1)}% APR`,
        severity: pool.apr > 100 ? 'critical' : pool.apr > 50 ? 'warning' : 'info',
        timestamp: Date.now(),
        data: { apr: pool.apr, tvl: pool.tvl },
      };
    }
    return null;
  }

  getAlerts(): PoolAlert[] {
    return this.alerts;
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}
