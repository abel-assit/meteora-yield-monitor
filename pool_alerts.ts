#!/usr/bin/env node
/**
 * Pool Alert System - TypeScript
 * Sends alerts when pools meet certain criteria
 */

import axios from 'axios';

interface Pool {
  address?: string;
  name?: string;
  apr?: number;
  farmApr?: number;
  volume24h?: number;
  volume?: number;
  tvl?: number;
}

interface AlertConfig {
  minApr: number;
  minVolume: number;
}

const METEORA_API = 'https://api.meteora.ag';

async function fetchPools(): Promise<Pool[]> {
  try {
    const response = await axios.get(`${METEORA_API}/pools`, { timeout: 30000 });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
}

function checkAlerts(pools: Pool[], config: AlertConfig): Pool[] {
  return pools.filter((pool) => {
    const apr = pool.apr || pool.farmApr || 0;
    const volume = pool.volume24h || pool.volume || 0;
    return apr >= config.minApr && volume >= config.minVolume;
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  const getArg = (flag: string, defaultValue: number): number => {
    const index = args.indexOf(flag);
    return index !== -1 ? parseFloat(args[index + 1]) : defaultValue;
  };

  const minApr = getArg('--min-apr', 20);
  const minVolume = getArg('--min-volume', 100000);

  console.log(`🔍 Checking for pools with APR >= ${minApr}% and Volume >= $${minVolume.toLocaleString()}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const pools = await fetchPools();
  if (!pools.length) {
    console.log('❌ Could not fetch pools');
    return;
  }

  const alerts = checkAlerts(pools, { minApr, minVolume });

  if (alerts.length) {
    console.log(`🚨 FOUND ${alerts.length} ALERTS:\n`);
    alerts.forEach((pool) => {
      const apr = pool.apr || pool.farmApr || 0;
      const volume = pool.volume24h || pool.volume || 0;
      const tvl = pool.tvl || 0;
      
      console.log(`⚡ ${pool.name || 'Unknown Pool'}`);
      console.log(`   APR: ${apr.toFixed(2)}%`);
      console.log(`   Volume 24h: $${volume.toLocaleString()}`);
      console.log(`   TVL: $${tvl.toLocaleString()}`);
      console.log(`   Address: ${pool.address || pool.name || 'N/A'}`);
      console.log();
    });
  } else {
    console.log('✅ No pools meet alert criteria');
  }
}

main().catch(console.error);
