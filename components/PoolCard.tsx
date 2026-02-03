'use client';

import React, { useState } from 'react';
import { MeteoraPool } from '../types';
import { YieldCalculator } from '../lib/yield-calculator';

interface Props {
  pool: MeteoraPool;
  rank?: number;
  featured?: boolean;
}

export function PoolCard({ pool, rank, featured }: Props) {
  const [expanded, setExpanded] = useState(false);
  
  const volumeRatio = pool.tvl > 0 ? (pool.volume24h / pool.tvl) * 100 : 0;
  const apy = YieldCalculator.calculateAPY(pool.apr);

  const getRankColor = () => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-orange-400';
    return 'bg-purple-500';
  };

  const getRiskColor = () => {
    const risk = YieldCalculator.calculateYields(pool, 1000).impermanentLossRisk;
    if (risk === 'low') return 'text-green-400';
    if (risk === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      className={`relative bg-gray-800/50 border rounded-xl p-4 transition hover:border-purple-500/50 ${
        featured ? 'border-purple-500/50' : 'border-gray-700'
      }`}
    >
      {rank && (
        <div className={`absolute -top-2 -left-2 w-8 h-8 ${getRankColor()} rounded-full flex items-center justify-center font-bold text-black text-sm`}>
          {rank}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {pool.tokenX.symbol}-{pool.tokenY.symbol}
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            {YieldCalculator.formatPercentage(pool.apr)}
          </div>
          <p className="text-xs text-gray-400">APR</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-xs text-gray-400">TVL</p>
          <p className="font-semibold">{YieldCalculator.formatCurrency(pool.tvl)}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-xs text-gray-400">24h Volume</p>
          <p className="font-semibold">{YieldCalculator.formatCurrency(pool.volume24h)}</p>
        </div>
      </div>

      {/* Yield Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Yield Score:</span>
          <span className="font-bold text-purple-400">
            {pool.yieldScore?.toFixed(1) || 'N/A'}
          </span>
        </div>
        <div className={`text-xs ${getRiskColor()}`}>
          IL Risk: {YieldCalculator.calculateYields(pool, 1000).impermanentLossRisk}
        </div>
      </div>

      {/* Volume/TVL Ratio Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Volume/TVL</span>
          <span>{volumeRatio.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${Math.min(volumeRatio * 2, 100)}%` }}
          />
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 text-sm text-gray-400 hover:text-white transition flex items-center justify-center gap-1"
      >
        {expanded ? '▲ Less' : '▼ More'} Details
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">APY:</span>{' '}
              <span className="text-green-400">{YieldCalculator.formatPercentage(apy)}</span>
            </div>
            <div>
              <span className="text-gray-400">Bin Step:</span>{' '}
              <span>{pool.binStep}</span>
            </div>
            <div>
              <span className="text-gray-400">Base Fee:</span>{' '}
              <span>{pool.baseFee}%</span>
            </div>
            <div>
              <span className="text-gray-400">Fees 24h:</span>{' '}
              <span>{pool.fees24h ? YieldCalculator.formatCurrency(pool.fees24h) : 'N/A'}</span>
            </div>
          </div>
          
          <a
            href={`https://app.meteora.ag/dlmm/${pool.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-center text-sm font-medium transition"
          >
            View on Meteora ↗
          </a>
        </div>
      )}
    </div>
  );
}
