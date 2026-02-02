#!/usr/bin/env node
/**
 * Meteora Pool Yield & Volume Monitor (TypeScript)
 * Monitors DLMM pools for best yields and alerts on high volume pools
 */

import axios from 'axios';

interface Pool {
  address?: string;
  name?: string;
  tokenX?: { symbol: string };
  tokenY?: { symbol: string };
  apr?: number;
  farmApr?: number;
  volume24h?: number;
  volume?: number;
  tvl?: number;
  yield_score?: number;
}

interface Alert {
  pool: Pool;
  previousVolume: number;
  currentVolume: number;
  changePercent: number;
}

interface MonitorConfig {
  minApr: number;
  minVolume: number;
  minTvl: number;
}

class MeteoraMonitor {
  private config: MonitorConfig;
  private previousPools: Map<string, Pool> = new Map();

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  async fetchAllPools(): Promise<Pool[]> {
    try {
      const response = await axios.get('https://dlmm-api.meteora.ag/pair/all', {
        timeout: 60000,
      });
      
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (data.pairs && Array.isArray(data.pairs)) {
          return data.pairs;
        } else {
          return Object.values(data);
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    }
  }

  calculateYieldScore(pool: Pool): number {
    const apr = pool.apr || pool.farmApr || 0;
    const volume24h = pool.volume24h || pool.volume || 0;
    const tvl = pool.tvl || 0;

    if (tvl === 0) return 0;

    const volumeRatio = volume24h / tvl;
    const tvlFactor = Math.log10(Math.max(tvl, 1000)) / 10;

    return apr * (1 + volumeRatio) * tvlFactor;
  }

  filterPools(pools: Pool[]): Pool[] {
    const filtered = pools.filter((pool) => {
      const apr = pool.apr || pool.farmApr || 0;
      const volume = pool.volume24h || pool.volume || 0;
      const tvl = pool.tvl || 0;

      return (
        apr >= this.config.minApr &&
        volume >= this.config.minVolume &&
        tvl >= this.config.minTvl
      );
    });

    filtered.forEach((pool) => {
      pool.yield_score = this.calculateYieldScore(pool);
    });

    return filtered.sort((a, b) => (b.yield_score || 0) - (a.yield_score || 0));
  }

  detectVolumeSpike(pool: Pool): Alert | null {
    const poolAddress = pool.address || '';
    const currentVolume = pool.volume24h || pool.volume || 0;

    if (this.previousPools.has(poolAddress)) {
      const prevPool = this.previousPools.get(poolAddress)!;
      const prevVolume = prevPool.volume24h || prevPool.volume || 0;

      if (prevVolume > 0) {
        const volumeChange = ((currentVolume - prevVolume) / prevVolume) * 100;

        if (volumeChange > 50) {
          return {
            pool,
            previousVolume: prevVolume,
            currentVolume,
            changePercent: volumeChange,
          };
        }
      }
    }

    return null;
  }

  formatPoolDisplay(pool: Pool, rank: number): string {
    const tokenX = pool.tokenX?.symbol || 'Unknown';
    const tokenY = pool.tokenY?.symbol || 'Unknown';
    const apr = pool.apr || pool.farmApr || 0;
    const volume = pool.volume24h || pool.volume || 0;
    const tvl = pool.tvl || 0;
    const score = pool.yield_score || 0;

    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🔹';
    const volumeRatio = tvl > 0 ? ((volume / tvl) * 100).toFixed(2) : '0.00';

    return `
${'='.repeat(60)}
${rankEmoji} Rank #${rank} | ${tokenX}-${tokenY}
   📍 Pool: ${(pool.address || 'Unknown').slice(0, 20)}...
   💰 TVL: $${tvl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
   📈 APR: ${apr.toFixed(2)}%
   🔄 Volume 24h: $${volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
   ⭐ Yield Score: ${score.toFixed(2)}
   📊 Volume/TVL: ${volumeRatio}%
${'='.repeat(60)}`;
  }

  displayAlerts(alerts: Alert[]): void {
    if (alerts.length === 0) return;

    console.log('\n' + '🚨'.repeat(30));
    console.log('🚨 VOLUME SPIKE ALERTS');
    console.log('🚨'.repeat(30));

    alerts.forEach((alert) => {
      const pool = alert.pool;
      const tokenX = pool.tokenX?.symbol || 'Unknown';
      const tokenY = pool.tokenY?.symbol || 'Unknown';

      console.log(`\n🔥 ${tokenX}-${tokenY}`);
      console.log(`   Volume Change: +${alert.changePercent.toFixed(1f)}%`);
      console.log(`   Previous: $${alert.previousVolume.toLocaleString()}`);
      console.log(`   Current: $${alert.currentVolume.toLocaleString()}`);
      console.log(`   Pool: ${pool.address || 'Unknown'}`);
    });
  }

  async runMonitor(topN: number = 10, alertMode: boolean = false): Promise<Pool[]> {
    console.log(`\n🔍 Meteora Pool Monitor`);
    console.log(`   Min APR: ${this.config.minApr}%`);
    console.log(`   Min Volume: $${this.config.minVolume.toLocaleString()}`);
    console.log(`   Min TVL: $${this.config.minTvl.toLocaleString()}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`\n${'='.repeat(60)}`);

    console.log('\n📡 Fetching pools from Meteora...');
    const pools = await this.fetchAllPools();

    if (!pools || pools.length === 0) {
      console.log('❌ No pools fetched');
      return [];
    }

    console.log(`✅ Fetched ${pools.length} pools`);

    console.log('\n🔍 Filtering and scoring pools...');
    const filtered = this.filterPools(pools);

    if (filtered.length === 0) {
      console.log('❌ No pools match criteria');
      return [];
    }

    console.log(`✅ ${filtered.length} pools match criteria`);

    const alerts: Alert[] = [];
    if (alertMode) {
      console.log('\n📊 Checking for volume spikes...');
      for (const pool of pools.slice(0, 100)) {
        const alert = this.detectVolumeSpike(pool);
        if (alert) alerts.push(alert);
      }
      this.displayAlerts(alerts);
    }

    console.log(`\n🏆 TOP ${topN} POOLS BY YIELD SCORE`);
    console.log('='.repeat(60));

    filtered.slice(0, topN).forEach((pool, i) => {
      console.log(this.formatPoolDisplay(pool, i + 1));
    });

    // Save current state
    pools.forEach((pool) => {
      if (pool.address) {
        this.previousPools.set(pool.address, pool);
      }
    });

    return filtered.slice(0, topN);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  const getArg = (flag: string, defaultValue: any) => {
    const index = args.indexOf(flag);
    return index !== -1 ? parseFloat(args[index + 1]) : defaultValue;
  };

  const hasFlag = (flag: string) => args.includes(flag);

  const config: MonitorConfig = {
    minApr: getArg('--min-apr', 10),
    minVolume: getArg('--min-volume', 50000),
    minTvl: getArg('--min-tvl', 100000),
  };

  const topN = getArg('--top', 10);
  const alertMode = hasFlag('--alert');
  const watchMode = hasFlag('--watch');
  const interval = getArg('--interval', 300) * 1000;

  const monitor = new MeteoraMonitor(config);

  if (watchMode) {
    console.log(`\n👁️  WATCH MODE ENABLED`);
    console.log(`   Update interval: ${interval / 1000} seconds`);
    console.log(`   Press Ctrl+C to stop\n`);

    const run = async () => {
      await monitor.runMonitor(topN, alertMode);
      console.log(`\n⏳ Next update in ${interval / 1000} seconds...`);
      setTimeout(run, interval);
    };

    run();
  } else {
    await monitor.runMonitor(topN, alertMode);
  }
}

main().catch(console.error);
