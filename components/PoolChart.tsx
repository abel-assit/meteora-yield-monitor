'use client';

import React, { useState, useEffect } from 'react';
import { MeteoraPool, HistoricalDataPoint } from '../types';
import { meteoraApi } from '../lib/meteora-api';

interface Props {
  pool: MeteoraPool;
}

export function PoolChart({ pool }: Props) {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'apr' | 'tvl' | 'volume'>('apr');

  useEffect(() => {
    loadData();
  }, [pool.address]);

  const loadData = async () => {
    setLoading(true);
    const historical = await meteoraApi.getHistoricalData(pool.address, 7);
    setData(historical);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return null;
  }

  const values = data.map(d => d[metric]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const getColor = () => {
    if (metric === 'apr') return 'stroke-green-400';
    if (metric === 'tvl') return 'stroke-purple-400';
    return 'stroke-blue-400';
  };

  // Create SVG path
  const width = 600;
  const height = 200;
  const padding = 20;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d[metric] - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">{pool.tokenX.symbol}-{pool.tokenY.symbol} - 7 Day History</h3>
        <div className="flex gap-2">
          {(['apr', 'tvl', 'volume'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition ${
                metric === m
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-48">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={height - padding - ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - ratio * (height - 2 * padding)}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* Line chart */}
          <polyline
            fill="none"
            className={getColor()}
            strokeWidth="2"
            points={points}
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d[metric] - min) / range) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className={getColor().replace('stroke-', 'fill-')}
              />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
          <span>{max.toFixed(0)}</span>
          <span>{((max + min) / 2).toFixed(0)}</span>
          <span>{min.toFixed(0)}</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-2">
        {metric === 'apr' ? 'APR %' : metric === 'tvl' ? 'TVL ($)' : 'Volume ($)'}
      </p>
    </div>
  );
}
