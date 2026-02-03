'use client';

import React from 'react';

interface Props {
  minApr: number;
  setMinApr: (val: number) => void;
  minTvl: number;
  setMinTvl: (val: number) => void;
  filterText: string;
  setFilterText: (val: string) => void;
  sortBy: string;
  setSortBy: (val: 'yield' | 'apr' | 'tvl' | 'volume') => void;
  selectedToken: string;
  setSelectedToken: (val: string) => void;
}

export function PoolFilters({
  minApr,
  setMinApr,
  minTvl,
  setMinTvl,
  filterText,
  setFilterText,
  sortBy,
  setSortBy,
  selectedToken,
  setSelectedToken,
}: Props) {
  const tokens = ['SOL', 'USDC', 'USDT', 'BONK', 'JUP', 'RAY'];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Search</label>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="SOL-USDC..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Min APR */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-gray-400 mb-1">
            Min APR: {minApr}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={minApr}
            onChange={(e) => setMinApr(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Min TVL */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-gray-400 mb-1">Min TVL</label>
          <select
            value={minTvl}
            onChange={(e) => setMinTvl(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value={0}>Any</option>
            <option value={50000}>$50K</option>
            <option value={100000}>$100K</option>
            <option value={500000}>$500K</option>
            <option value={1000000}>$1M</option>
          </select>
        </div>

        {/* Token Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-gray-400 mb-1">Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="">All Tokens</option>
            {tokens.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
