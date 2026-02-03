import { YieldCalculator, AlertManager } from '../lib/yield-calculator';
import { MeteoraPool, AlertConfig } from '../types';

describe('YieldCalculator', () => {
  const mockPool: MeteoraPool = {
    address: 'test123',
    tokenX: { symbol: 'SOL', mint: '', decimals: 9 },
    tokenY: { symbol: 'USDC', mint: '', decimals: 6 },
    binStep: 10,
    baseFee: 0.25,
    tvl: 1000000,
    volume24h: 500000,
    apr: 50,
  };

  describe('calculateYieldScore', () => {
    it('should calculate yield score based on APR, volume, and TVL', () => {
      const score = YieldCalculator.calculateYieldScore(mockPool);
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should return 0 for pool with 0 TVL', () => {
      const pool = { ...mockPool, tvl: 0 };
      const score = YieldCalculator.calculateYieldScore(pool);
      expect(score).toBe(0);
    });

    it('should give higher score for higher APR', () => {
      const lowAprPool = { ...mockPool, apr: 10 };
      const highAprPool = { ...mockPool, apr: 100 };
      
      const lowScore = YieldCalculator.calculateYieldScore(lowAprPool);
      const highScore = YieldCalculator.calculateYieldScore(highAprPool);
      
      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('calculateYields', () => {
    it('should calculate daily, monthly, and yearly yields', () => {
      const investment = 1000;
      const result = YieldCalculator.calculateYields(mockPool, investment);
      
      expect(result.dailyYield).toBeGreaterThan(0);
      expect(result.monthlyYield).toBeGreaterThan(result.dailyYield);
      expect(result.yearlyYield).toBeGreaterThan(result.monthlyYield);
      expect(result.investment).toBe(investment);
    });

    it('should estimate impermanent loss risk', () => {
      const result = YieldCalculator.calculateYields(mockPool, 1000);
      expect(['low', 'medium', 'high']).toContain(result.impermanentLossRisk);
    });
  });

  describe('calculateAPY', () => {
    it('should calculate APY from APR with compounding', () => {
      const apr = 50;
      const apy = YieldCalculator.calculateAPY(apr);
      
      expect(apy).toBeGreaterThan(apr); // APY > APR due to compounding
      expect(apy).toBeCloseTo(64.8, 0); // ~64.8% APY for 50% APR
    });

    it('should handle 0 APR', () => {
      const apy = YieldCalculator.calculateAPY(0);
      expect(apy).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format large numbers with K, M, B suffixes', () => {
      expect(YieldCalculator.formatCurrency(1500)).toBe('$1.50K');
      expect(YieldCalculator.formatCurrency(1500000)).toBe('$1.50M');
      expect(YieldCalculator.formatCurrency(1500000000)).toBe('$1.50B');
      expect(YieldCalculator.formatCurrency(150)).toBe('$150.00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with specified decimals', () => {
      expect(YieldCalculator.formatPercentage(50)).toBe('50.00%');
      expect(YieldCalculator.formatPercentage(50.1234, 2)).toBe('50.12%');
      expect(YieldCalculator.formatPercentage(50.1234, 4)).toBe('50.1234%');
    });
  });
});

describe('AlertManager', () => {
  const config: AlertConfig = {
    minApr: 20,
    minVolume: 100000,
    minTvl: 500000,
    volumeSpikeThreshold: 50,
    tvlDropThreshold: 20,
    enabled: true,
  };

  const mockPool: MeteoraPool = {
    address: 'test123',
    tokenX: { symbol: 'SOL', mint: '', decimals: 9 },
    tokenY: { symbol: 'USDC', mint: '', decimals: 6 },
    binStep: 10,
    baseFee: 0.25,
    tvl: 1000000,
    volume24h: 500000,
    apr: 50,
  };

  let alertManager: AlertManager;

  beforeEach(() => {
    alertManager = new AlertManager(config);
  });

  describe('checkPools', () => {
    it('should detect high APR pools', () => {
      const alerts = alertManager.checkPools([mockPool]);
      
      const highAprAlert = alerts.find(a => a.type === 'high_apr');
      expect(highAprAlert).toBeDefined();
      expect(highAprAlert?.severity).toBe('warning');
    });

    it('should detect volume spikes', () => {
      // First check to set baseline
      alertManager.checkPools([{ ...mockPool, volume24h: 100000 }]);
      
      // Second check with volume spike
      const alerts = alertManager.checkPools([{ ...mockPool, volume24h: 200000 }]);
      
      const volumeAlert = alerts.find(a => a.type === 'volume_spike');
      expect(volumeAlert).toBeDefined();
    });

    it('should detect TVL drops', () => {
      // First check to set baseline
      alertManager.checkPools([{ ...mockPool, tvl: 1000000 }]);
      
      // Second check with TVL drop
      const alerts = alertManager.checkPools([{ ...mockPool, tvl: 700000 }]);
      
      const tvlAlert = alerts.find(a => a.type === 'tvl_drop');
      expect(tvlAlert).toBeDefined();
    });

    it('should not alert for pools below min APR', () => {
      const lowAprPool = { ...mockPool, apr: 10 };
      const alerts = alertManager.checkPools([lowAprPool]);
      
      const highAprAlert = alerts.find(a => a.type === 'high_apr');
      expect(highAprAlert).toBeUndefined();
    });
  });

  describe('getAlerts and clearAlerts', () => {
    it('should return all alerts', () => {
      alertManager.checkPools([mockPool]);
      const alerts = alertManager.getAlerts();
      
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should clear all alerts', () => {
      alertManager.checkPools([mockPool]);
      alertManager.clearAlerts();
      
      expect(alertManager.getAlerts()).toHaveLength(0);
    });
  });
});
