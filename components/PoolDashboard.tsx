'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MeteoraPool } from '../types';
import { meteoraApi } from '../lib/meteora-api';
import { YieldCalculator } from '../lib/yield-calculator';
import { PoolCard } from './PoolCard';
import { PoolFilters } from './PoolFilters';
import { PoolChart } from './PoolChart';

interface Props {
  onRefresh: () => void;
}

export function PoolDashboard({ onRefresh }: Props) {
  const [pools, setPools] = useState<MeteoraPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'yield' | 'apr' | 'tvl' | 'volume'>('yield');
  const [filterText, setFilterText] = useState('');

  // Filters
  const [minApr, setMinApr] = useState(5);
  const [minTvl, setMinTvl] = useState(100000);
  const [selectedToken, setSelectedToken] = useState<string>('');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meteoraApi.getAllPools();
      
      // Calculate yield scores
      const poolsWithScores = data.map(pool => ({
        ...pool,
        yieldScore: YieldCalculator.calculateYieldScore(pool),
      }));
      
      setPools(poolsWithScores);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  };

  const filteredPools = useMemo(() => {
    return pools
      .filter(pool => {
        if (pool.apr < minApr) return false;
        if (pool.tvl < minTvl) return false;
        if (selectedToken && 
            pool.tokenX.symbol !== selectedToken && 
            pool.tokenY.symbol !== selectedToken) return false;
        if (filterText) {
          const search = filterText.toLowerCase();
          const name = `${pool.tokenX.symbol}-${pool.tokenY.symbol}`.toLowerCase();
          if (!name.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'yield':
            return (b.yieldScore || 0) - (a.yieldScore || 0);
          case 'apr':
            return (b.apr || 0) - (a.apr || 0);
          case 'tvl':
            return (b.tvl || 0) - (a.tvl || 0);
          case 'volume':
            return (b.volume24h || 0) - (a.volume24h || 0);
          default:
            return 0;
        }
      });
  }, [pools, minApr, minTvl, selectedToken, filterText, sortBy]);

  const topPool = filteredPools[0];
  const stats = useMemo(() => {
    const totalTvl = pools.reduce((sum, p) => sum + p.tvl, 0);
    const avgApr = pools.length > 0 
      ? pools.reduce((sum, p) => sum + p.apr, 0) / pools.length 
      : 0;
    const highYieldCount = pools.filter(p => p.apr > 50).length;
    
    return { totalTvl, avgApr, highYieldCount, totalPools: pools.length };
  }, [pools]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading pools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPools}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Pools"
          value={stats.totalPools.toString()}
          icon="🏊"
        />
        <StatCard
          label="Total TVL"
          value={YieldCalculator.formatCurrency(stats.totalTvl)}
          icon="💰"
        />
        <StatCard
          label="Avg APR"
          value={YieldCalculator.formatPercentage(stats.avgApr)}
          icon="📈"
          trend={stats.avgApr > 20 ? 'up' : 'neutral'}
        />
        <StatCard
          label="High Yield (>50%)"
          value={stats.highYieldCount.toString()}
          icon="🔥"
          trend="up"
        />
      </div>

      {/* Filters */}
      <PoolFilters
        minApr={minApr}
        setMinApr={setMinApr}
        minTvl={minTvl}
        setMinTvl={setMinTvl}
        filterText={filterText}
        setFilterText={setFilterText}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />

      {/* Top Pool Highlight */}
      {topPool && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🏆 Top Yield Opportunity
            </h2>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              Score: {topPool.yieldScore?.toFixed(1)}
            </span>
          </div>
          <PoolCard pool={topPool} featured />
        </div>
      )}

      {/* Pool Chart */}
      {topPool && (
        <PoolChart pool={topPool} />
      )}

      {/* Pool Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            All Pools ({filteredPools.length})
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="yield">Sort by Yield Score</option>
            <option value="apr">Sort by APR</option>
            <option value="tvl">Sort by TVL</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPools.slice(0, 12).map((pool, index) => (
            <PoolCard key={pool.address} pool={pool} rank={index + 1} />
          ))}
        </div>

        {filteredPools.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>No pools match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  trend 
}: { 
  label: string; 
  value: string; 
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
